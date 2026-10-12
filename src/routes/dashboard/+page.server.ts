import { error, fail, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/dynamic-db';
import { parseSubmission, type SubmissionPayload } from '$lib/server/submission';
import { slugTaken } from '$lib/server/dynamic-catalog';
import type { Actions, PageServerLoad } from './$types';

interface Row {
	id: number;
	payload: string;
	state: string;
	admin_note: string;
	updated_at: string;
}

function currentUser(locals: App.Locals) {
	if (!locals.user) redirect(303, '/auth/github/');
	if (locals.user.banned_at) error(403, 'Akun ini tidak dapat mengirim usulan.');
	return locals.user;
}

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	const user = currentUser(locals);
	const db = requireDb(platform);
	const rows = (
		await db
			.prepare(
				'SELECT id, payload, state, admin_note, updated_at FROM submissions WHERE github_id = ? ORDER BY updated_at DESC LIMIT 50'
			)
			.bind(user.github_id)
			.all<Row>()
	).results;
	return {
		user,
		submitted: url.searchParams.has('submitted'),
		submissions: rows.map((row) => ({
			...row,
			payload: JSON.parse(row.payload) as SubmissionPayload
		}))
	};
};

export const actions: Actions = {
	create: async ({ locals, platform, request }) => {
		const user = currentUser(locals);
		const db = requireDb(platform);
		try {
			const payload = parseSubmission(await request.formData());
			if (await slugTaken(db, payload.id)) return fail(400, { message: 'Slug sudah digunakan.' });
			const matching = await db
				.prepare(
					"SELECT id FROM submissions WHERE json_extract(payload, '$.id') = ? AND state IN ('pending', 'published')"
				)
				.bind(payload.id)
				.first();
			if (matching) return fail(400, { message: 'Slug sudah diajukan.' });
			const active = await db
				.prepare(
					"SELECT COUNT(*) AS total FROM submissions WHERE github_id = ? AND state = 'pending'"
				)
				.bind(user.github_id)
				.first<{ total: number }>();
			if ((active?.total || 0) >= 3)
				return fail(429, { message: 'Maksimal tiga usulan menunggu review.' });
			await db
				.prepare("INSERT INTO submissions (github_id, payload, state) VALUES (?, ?, 'pending')")
				.bind(user.github_id, JSON.stringify(payload))
				.run();
		} catch (cause) {
			return fail(400, { message: cause instanceof Error ? cause.message : 'Usulan tidak valid.' });
		}
		redirect(303, '/dashboard/');
	},
	revise: async ({ locals, platform, request }) => {
		const user = currentUser(locals);
		const db = requireDb(platform);
		const form = await request.formData();
		const submissionId = Number(form.get('submissionId'));
		if (!Number.isSafeInteger(submissionId))
			return fail(400, { message: 'ID usulan tidak valid.' });
		const row = await db
			.prepare('SELECT payload, state FROM submissions WHERE id = ? AND github_id = ?')
			.bind(submissionId, user.github_id)
			.first<{ payload: string; state: string }>();
		if (!row || !['pending', 'needs_changes'].includes(row.state))
			error(403, 'Usulan tidak dapat diedit.');
		try {
			const payload = parseSubmission(form);
			if (payload.id !== (JSON.parse(row.payload) as SubmissionPayload).id)
				return fail(400, { message: 'Slug tidak dapat diganti saat revisi.' });
			await db
				.prepare(
					"UPDATE submissions SET payload = ?, state = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
				)
				.bind(JSON.stringify(payload), submissionId)
				.run();
		} catch (cause) {
			return fail(400, { message: cause instanceof Error ? cause.message : 'Revisi tidak valid.' });
		}
		redirect(303, '/dashboard/');
	}
};
