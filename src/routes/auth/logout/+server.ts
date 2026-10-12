import { redirect } from '@sveltejs/kit';
import { endSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, platform }) => {
	await endSession(platform?.env.DB, cookies);
	redirect(303, '/');
};
