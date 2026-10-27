import { bansosList, getAllContributors } from '$lib/data/bansos';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => {
	return [
		...getAllContributors().map((contributor) => ({ slug: contributor.login })),
		...bansosList.map((item) => ({ slug: item.id }))
	];
};

// Server data is already filtered through the D1-aware catalog.
export const load: PageLoad = ({ data }) => data;
