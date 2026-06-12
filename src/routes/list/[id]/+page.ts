import { bansosList } from '$lib/data/bansos';
import type { EntryGenerator } from './$types';

// Tells SvelteKit which dynamic pages to prerender
export const entries: EntryGenerator = () => {
	return bansosList.map((item) => ({ id: item.id }));
};

export function load({ params }) {
	const item = bansosList.find((b) => b.id === params.id);
	return {
		item: item || null,
		id: params.id
	};
}
