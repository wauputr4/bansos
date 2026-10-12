import { error, fail, redirect } from '@sveltejs/kit';
import { slugTaken } from '$lib/server/dynamic-catalog';
import { requireDb } from '$lib/server/dynamic-db';
import { parseSubmission } from '$lib/server/submission';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(303, '/auth/github?next=contribute');
		if (locals.user.banned_at) error(403, 'Akun ini tidak dapat mengirim usulan.');
		const db = requireDb(platform);
		const input = await request.formData();
		const values = Object.fromEntries(
			[...input.entries()].map(([key, value]) => [key, String(value)])
		);
		try {
			const payload = parseSubmission(input);
			if (await slugTaken(db, payload.id))
				return fail(400, { message: 'Slug sudah dipakai listing lain.', values });
			const matching = await db
				.prepare(
					"SELECT id FROM submissions WHERE json_extract(payload, '$.id') = ? AND state IN ('pending', 'published')"
				)
				.bind(payload.id)
				.first();
			if (matching) return fail(400, { message: 'Slug sudah diajukan.', values });
			const active = await db
				.prepare(
					"SELECT COUNT(*) AS total FROM submissions WHERE github_id = ? AND state = 'pending'"
				)
				.bind(locals.user.github_id)
				.first<{ total: number }>();
			if ((active?.total || 0) >= 3)
				return fail(429, { message: 'Maksimal tiga usulan menunggu review.', values });
			await db
				.prepare("INSERT INTO submissions (github_id, payload, state) VALUES (?, ?, 'pending')")
				.bind(locals.user.github_id, JSON.stringify(payload))
				.run();
		} catch (cause) {
			return fail(400, {
				message: cause instanceof Error ? cause.message : 'Usulan tidak valid.',
				values
			});
		}
		redirect(303, '/dashboard/?submitted=1');
	}
};
