import { catalogItems } from '$lib/server/dynamic-catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => ({
	items: await catalogItems(platform?.env.DB)
});
