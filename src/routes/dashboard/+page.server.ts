import { error, fail, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/dynamic-db';
import {
	parseSubmission,
	readSubmissionForm,
	type SubmissionPayload
} from '$lib/server/submission';
import { signedIn, positiveId, mutate } from '$lib/server/moderation';
import { mutateReview } from '$lib/server/review-notifications';
import { env } from '$env/dynamic/private';
import {
	changeVisibility,
	managedListing,
	type ManagedListing
} from '$lib/server/listing-management';
import type { Actions, PageServerLoad } from './$types';

interface Row {
	id: number;
	payload: string;
	state: string;
	admin_note: string;
	updated_at: string;
	withdrawn_at: string | null;
}

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	const user = signedIn(locals);
	const db = requireDb(platform);
	const rows = await db
		.prepare(
			'SELECT id, payload, state, admin_note, updated_at, withdrawn_at FROM submissions WHERE github_id = ? ORDER BY id DESC LIMIT 50'
		)
		.bind(user.github_id)
		.all<Row>();
	const owned = await db
		.prepare(
			'SELECT * FROM catalog_items WHERE owner_github_id = ? ORDER BY updated_at DESC LIMIT 100'
		)
		.bind(user.github_id)
		.all<ManagedListing>();
	return {
		user,
		submitted: url.searchParams.has('submitted'),
		submissions: rows.results.map((row) => ({
			...row,
			payload: JSON.parse(row.payload) as SubmissionPayload
		})),
		owned: owned.results.map((row) => ({
			...row,
			payload: JSON.parse(row.payload) as SubmissionPayload
		}))
	};
};

export const actions: Actions = {
	revise: async ({ locals, platform, request }) => {
		const user = signedIn(locals);
		const db = requireDb(platform);
		let form: FormData;
		let payload: SubmissionPayload;
		try {
			form = await readSubmissionForm(request);
			payload = parseSubmission(form, true);
		} catch {
			return fail(400, { message: 'Periksa isian revisi dan ukuran form.' });
		}
		const id = positiveId(form, 'submissionId');
		const row = await db
			.prepare(
				"SELECT payload FROM submissions WHERE id = ? AND github_id = ? AND state IN ('pending', 'needs_changes') AND withdrawn_at IS NULL"
			)
			.bind(id, user.github_id)
			.first<{ payload: string }>();
		if (!row) error(403, 'Usulan tidak dapat diedit.');
		if (payload.id !== JSON.parse(row.payload).id)
			return fail(400, { message: 'Slug tidak dapat diganti.' });
		const updated = await mutateReview(
			db,
			db
				.prepare(
					"UPDATE submissions SET payload = ?, state = 'pending', review_version = review_version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND github_id = ? AND state IN ('pending', 'needs_changes') AND withdrawn_at IS NULL AND payload = ?"
				)
				.bind(JSON.stringify(payload), id, user.github_id, row.payload),
			user.github_id,
			'revise',
			`submission:${id}`,
			payload.id,
			{ ...platform?.env, ...env }
		);
		if (!updated) return fail(409, { message: 'Usulan berubah. Muat ulang.' });
		redirect(303, '/dashboard/');
	},
	withdraw: async ({ locals, platform, request }) => {
		const user = signedIn(locals);
		const db = requireDb(platform);
		const id = positiveId(await readSubmissionForm(request));
		const updated = await mutate(
			db,
			db
				.prepare(
					"UPDATE submissions SET withdrawn_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND github_id = ? AND state IN ('pending', 'needs_changes') AND withdrawn_at IS NULL"
				)
				.bind(id, user.github_id),
			user.github_id,
			'withdraw',
			`submission:${id}`
		);
		if (!updated) return fail(409, { message: 'Usulan tidak dapat dibatalkan.' });
		redirect(303, '/dashboard/');
	},
	editPublished: async ({ locals, platform, request }) => {
		const user = signedIn(locals);
		const db = requireDb(platform);
		let payload: SubmissionPayload;
		let form: FormData;
		try {
			form = await readSubmissionForm(request);
			payload = parseSubmission(form, true);
		} catch {
			return fail(400, { message: 'Periksa isian listing dan ukuran form.' });
		}
		const row = await managedListing(db, payload.id);
		if (
			!row ||
			row.owner_github_id !== user.github_id ||
			row.state !== 'published' ||
			row.deleted_at
		)
			error(404, 'Listing milikmu tidak ditemukan.');
		if (Number(form.get('version')) !== row.version)
			return fail(409, { message: 'Listing berubah. Muat ulang sebelum mengedit.' });
		try {
			const result = await mutateReview(
				db,
				db
					.prepare(
						`INSERT INTO submissions (github_id, payload, state, revision_of, base_version)
    SELECT ?, ?, 'pending', ?, ? WHERE (SELECT COUNT(*) FROM submissions WHERE github_id = ? AND state IN ('pending','needs_changes') AND withdrawn_at IS NULL) < 3
    AND EXISTS (SELECT 1 FROM catalog_items WHERE id = ? AND owner_github_id = ? AND state = 'published' AND deleted_at IS NULL AND version = ?)`
					)
					.bind(
						user.github_id,
						JSON.stringify(payload),
						payload.id,
						row.version,
						user.github_id,
						payload.id,
						user.github_id,
						row.version
					),
				user.github_id,
				'request_edit',
				payload.id,
				payload.id,
				{ ...platform?.env, ...env }
			);
			if (!result) return fail(429, { message: 'Antrean penuh atau listing berubah.' });
		} catch {
			return fail(409, { message: 'Sudah ada revisi menunggu review untuk listing ini.' });
		}
		redirect(303, '/dashboard/?submitted=1');
	},
	archive: async ({ locals, platform, request }) => {
		const user = signedIn(locals);
		const form = await readSubmissionForm(request);
		await changeVisibility(
			requireDb(platform),
			user,
			String(form.get('id') || ''),
			'archive',
			true
		);
		redirect(303, '/dashboard/');
	}
};
