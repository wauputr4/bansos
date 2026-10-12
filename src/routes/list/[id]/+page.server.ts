import { error } from '@sveltejs/kit';
import { catalogItems } from '$lib/server/dynamic-catalog';
import { bansosList } from '$lib/data/bansos';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const items = await catalogItems(platform?.env.DB);
	const item = items.find((entry) => entry.id === params.id);
	if (!item) error(404, 'Bansos tidak ditemukan.');
	return {
		item,
		items,
		id: params.id,
		isLegacy: bansosList.some((entry) => entry.id === params.id)
	};
};
