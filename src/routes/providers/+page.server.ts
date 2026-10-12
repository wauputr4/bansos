import { getProviderStats } from '$lib/data/bansos';
import { catalogItems } from '$lib/server/dynamic-catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => ({
	providers: getProviderStats(await catalogItems(platform?.env.DB))
});
