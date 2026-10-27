import { json } from '@sveltejs/kit';
import { signedIn } from '$lib/server/moderation';
import { requireDb } from '$lib/server/dynamic-db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, platform }) => {
	signedIn(locals, true);
	const row = await requireDb(platform)
		.prepare(
			"SELECT COUNT(*) AS pending FROM submissions WHERE state IN ('pending','needs_changes') AND withdrawn_at IS NULL"
		)
		.first<{ pending: number }>();
	return json(
		{ pending: row?.pending || 0 },
		{ headers: { 'Cache-Control': 'private, no-store' } }
	);
};
