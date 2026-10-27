import type { Handle } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { takeRateLimit } from '$lib/server/moderation';
import { userFromSession } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const env = event.platform?.env;
	const isLocalDemo =
		['localhost', '127.0.0.1'].includes(event.url.hostname) &&
		(privateEnv.BANSOS_LOCAL_DEMO ?? env?.BANSOS_LOCAL_DEMO) === '1';
	if (event.request.method === 'POST') {
		if (event.request.headers.get('origin') !== event.url.origin) error(403, 'Origin tidak valid.');
		if (Number(event.request.headers.get('content-length')) > 32 * 1024)
			error(413, 'Request terlalu besar.');
	}
	event.locals.user = event.platform?.env.DB
		? await userFromSession(
				event.platform.env.DB,
				event.cookies,
				privateEnv.OWNER_GITHUB_ID || env?.OWNER_GITHUB_ID || (isLocalDemo ? '1' : undefined)
			)
		: null;
	if (event.request.method === 'POST' && event.locals.user && env?.DB) {
		await takeRateLimit(env.DB, 'write', event.locals.user.github_id, 30, 60);
	}
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'same-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	if ((privateEnv.BANSOS_ENV || env?.BANSOS_ENV) === 'staging') {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
	}
	if (
		env?.DB ||
		event.locals.user ||
		/^\/(auth|admin|dashboard|contribute)(\/|$)/.test(event.url.pathname)
	) {
		response.headers.set('Cache-Control', 'private, no-store');
	}
	return response;
};
