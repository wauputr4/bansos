import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/dynamic-db';
import { startSession, upsertUser } from '$lib/server/session';
import type { RequestHandler } from './$types';

// Local preview only. Both localhost AND an explicit local binding are required.
export const GET: RequestHandler = async ({ url, platform, cookies }) => {
	if (
		!['localhost', '127.0.0.1'].includes(url.hostname) ||
		(env.BANSOS_LOCAL_DEMO ?? platform?.env.BANSOS_LOCAL_DEMO) !== '1'
	) {
		error(404, 'Tidak tersedia.');
	}
	const admin = url.searchParams.get('as') === 'admin';
	const profile = admin
		? { id: 1, login: 'demo-owner', name: 'Demo Admin' }
		: url.searchParams.get('as') === 'other'
			? { id: 3, login: 'demo-other', name: 'Demo Other' }
			: { id: 2, login: 'demo-contributor', name: 'Demo Contributor' };
	const db = requireDb(platform);
	await upsertUser(db, profile, '1');
	await startSession(db, cookies, profile.id, false);
	redirect(
		303,
		admin
			? '/admin/'
			: url.searchParams.get('next') === 'contribute'
				? '/contribute/#form'
				: '/dashboard/'
	);
};
