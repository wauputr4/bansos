import { error, fail, redirect } from '@sveltejs/kit';
import { slugTaken } from '$lib/server/dynamic-catalog';
import { requireDb } from '$lib/server/dynamic-db';
import { parseSubmission, readSubmissionForm } from '$lib/server/submission';
import { mutateReview } from '$lib/server/review-notifications';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(303, '/auth/github?next=contribute');
		if (locals.user.banned_at) error(403, 'Akun ini tidak dapat mengirim usulan.');
		const db = requireDb(platform);
		let values: Record<string, string> = {};
		try {
			const input = await readSubmissionForm(request);
			const fields = [
				'id',
				'title',
				'provider',
				'description',
				'benefits',
				'requirements',
				'tags',
				'ctaLink',
				'source',
				'promoCode',
				'validityType',
				'validityDate',
				'validityDescription',
				'status'
			];
			values = Object.fromEntries(fields.map((key) => [key, String(input.get(key) || '')]));
			const payload = parseSubmission(input);
			if (await slugTaken(db, payload.id))
				return fail(400, { message: 'Slug sudah dipakai listing lain.', values });
			const matching = await db
				.prepare(
					"SELECT id FROM submissions WHERE json_extract(payload, '$.id') = ? AND state IN ('pending', 'needs_changes') AND withdrawn_at IS NULL"
				)
				.bind(payload.id)
				.first();
			if (matching) return fail(400, { message: 'Slug sudah diajukan.', values });
			const active = await db
				.prepare(
					"SELECT COUNT(*) AS total FROM submissions WHERE github_id = ? AND state IN ('pending','needs_changes') AND withdrawn_at IS NULL"
				)
				.bind(locals.user.github_id)
				.first<{ total: number }>();
			if ((active?.total || 0) >= 3)
				return fail(429, { message: 'Maksimal tiga usulan menunggu review.', values });
			const created = await mutateReview(
				db,
				db
					.prepare(
						`INSERT INTO submissions (github_id, payload, state)
			 SELECT ?, ?, 'pending' WHERE (SELECT COUNT(*) FROM submissions WHERE github_id = ? AND state IN ('pending','needs_changes') AND withdrawn_at IS NULL) < 3`
					)
					.bind(locals.user.github_id, JSON.stringify(payload), locals.user.github_id),
				locals.user.github_id,
				'submit',
				payload.id,
				payload.id,
				{ ...platform?.env, ...env }
			);
			if (!created) return fail(429, { message: 'Maksimal tiga usulan menunggu review.', values });
		} catch {
			return fail(400, {
				message: 'Periksa isian form, ukuran maksimal 32 KB, dan pastikan slug belum diajukan.',
				values
			});
		}
		redirect(303, '/dashboard/?submitted=1');
	}
};
