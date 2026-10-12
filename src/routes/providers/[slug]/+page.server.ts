import { error } from '@sveltejs/kit';
import { getProviderStats } from '$lib/data/bansos';
import { catalogItems } from '$lib/server/dynamic-catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const provider = getProviderStats(await catalogItems(platform?.env.DB)).find(
		(entry) => entry.slug === params.slug
	);
	if (!provider) error(404, 'Provider tidak ditemukan');
	return { provider, slug: params.slug };
};
