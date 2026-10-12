import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function base64url(bytes: Uint8Array) {
	return btoa(String.fromCharCode(...bytes))
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replaceAll('=', '');
}

export const GET: RequestHandler = async ({ cookies, url }) => {
	const clientId = env.GITHUB_CLIENT_ID;
	const callback = env.GITHUB_CALLBACK_URL;
	if (!clientId || !callback) error(503, 'Login GitHub belum dikonfigurasi.');
	const state = base64url(crypto.getRandomValues(new Uint8Array(24)));
	const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
	const challenge = base64url(
		new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
	);
	cookies.set('bansos_oauth_state', state, {
		path: '/auth/github',
		httpOnly: true,
		sameSite: 'lax',
		secure: callback.startsWith('https:'),
		maxAge: 600
	});
	cookies.set('bansos_oauth_verifier', verifier, {
		path: '/auth/github',
		httpOnly: true,
		sameSite: 'lax',
		secure: callback.startsWith('https:'),
		maxAge: 600
	});
	cookies.set(
		'bansos_oauth_next',
		url.searchParams.get('next') === 'contribute' ? 'contribute' : 'dashboard',
		{
			path: '/auth/github',
			httpOnly: true,
			sameSite: 'lax',
			secure: callback.startsWith('https:'),
			maxAge: 600
		}
	);
	const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
	authorizeUrl.searchParams.set('client_id', clientId);
	authorizeUrl.searchParams.set('redirect_uri', callback);
	authorizeUrl.searchParams.set('state', state);
	authorizeUrl.searchParams.set('scope', 'read:user');
	authorizeUrl.searchParams.set('code_challenge', challenge);
	authorizeUrl.searchParams.set('code_challenge_method', 'S256');
	redirect(303, authorizeUrl.toString());
};
