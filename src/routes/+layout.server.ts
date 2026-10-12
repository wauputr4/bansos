import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, platform, url }) => ({
	viewer: locals.user,
	demoMode:
		['localhost', '127.0.0.1'].includes(url.hostname) && platform?.env.BANSOS_LOCAL_DEMO === '1'
});
