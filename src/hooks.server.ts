import type { Handle } from '@sveltejs/kit';
import { userFromSession } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = event.platform?.env.DB
		? await userFromSession(event.platform.env.DB, event.cookies)
		: null;
	return resolve(event);
};
