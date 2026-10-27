import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = ({ locals, platform, url }) => ({
	viewer: locals.user,
	accountMode: !!platform?.env.DB,
	staging: (env.BANSOS_ENV || platform?.env.BANSOS_ENV) === 'staging',
	demoMode:
		['localhost', '127.0.0.1'].includes(url.hostname) &&
		(env.BANSOS_LOCAL_DEMO ?? platform?.env.BANSOS_LOCAL_DEMO) === '1'
});
