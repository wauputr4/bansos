import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/dynamic-db';
import { startSession, upsertUser } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const state = cookies.get('bansos_oauth_state');
	const verifier = cookies.get('bansos_oauth_verifier');
	const next = cookies.get('bansos_oauth_next');
	cookies.delete('bansos_oauth_state', { path: '/auth/github' });
	cookies.delete('bansos_oauth_verifier', { path: '/auth/github' });
	cookies.delete('bansos_oauth_next', { path: '/auth/github' });
	if (!state || !verifier || state !== url.searchParams.get('state'))
		error(400, 'OAuth state tidak cocok.');
	const code = url.searchParams.get('code');
	if (!code) error(400, 'GitHub tidak mengirim kode login.');
	if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_CALLBACK_URL) {
		error(503, 'Login GitHub belum dikonfigurasi.');
	}
	const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
		signal: AbortSignal.timeout(10000),
		method: 'POST',
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			redirect_uri: env.GITHUB_CALLBACK_URL,
			code,
			code_verifier: verifier
		})
	});
	if (!tokenResponse.ok) error(502, 'GitHub gagal memvalidasi login.');
	const token = (await tokenResponse.json()) as { access_token?: string };
	if (!token.access_token) error(401, 'Token GitHub tidak tersedia.');
	const profileResponse = await fetch('https://api.github.com/user', {
		signal: AbortSignal.timeout(10000),
		headers: {
			Authorization: `Bearer ${token.access_token}`,
			Accept: 'application/vnd.github+json',
			'User-Agent': 'bansos.dev'
		}
	});
	if (!profileResponse.ok) error(502, 'Profil GitHub tidak dapat dibaca.');
	const profile = (await profileResponse.json()) as {
		id: number;
		login: string;
		name?: string | null;
		avatar_url?: string | null;
	};
	if (!Number.isSafeInteger(profile.id) || !profile.login) error(502, 'Profil GitHub tidak valid.');
	const db = requireDb(platform);
	await upsertUser(db, profile, env.OWNER_GITHUB_ID);
	await startSession(db, cookies, profile.id, url.protocol === 'https:');
	redirect(303, next === 'contribute' ? '/contribute/#form' : '/dashboard/');
};
