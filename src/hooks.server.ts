import type { Handle } from '@sveltejs/kit';
import { userFromSession } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const env = event.platform?.env;
	const isLocalDemo =
		['localhost', '127.0.0.1'].includes(event.url.hostname) && env?.BANSOS_LOCAL_DEMO === '1';
	event.locals.user = event.platform?.env.DB
		? await userFromSession(
				event.platform.env.DB,
				event.cookies,
				env?.OWNER_GITHUB_ID || (isLocalDemo ? '1' : undefined)
			)
		: null;
	return resolve(event);
};
