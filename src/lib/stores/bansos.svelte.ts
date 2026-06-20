import { browser } from '$app/environment';
import { SvelteDate } from 'svelte/reactivity';
import {
	bansosList as initialBansosList,
	normalizeBansosStatuses,
	type BansosItem
} from '$lib/data/bansos';

export const bansosState = $state({
	data: initialBansosList as BansosItem[]
});

type LegacyBansosItem = Omit<BansosItem, 'validity'> & {
	validity: BansosItem['validity'] | string;
};

function checkExpired(data: LegacyBansosItem[], referenceDate: SvelteDate): BansosItem[] {
	if (isNaN(referenceDate.getTime())) {
		referenceDate = new SvelteDate();
	}
	return normalizeBansosStatuses(
		data.map((item) => {
			let validityObj = item.validity;
			if (typeof validityObj === 'string') {
				validityObj = { type: 'uncertain' };
			}

			return { ...item, validity: validityObj };
		}),
		referenceDate
	);
}

// Perform an initial local check so SSG/SSR starts somewhat correct
bansosState.data = checkExpired(initialBansosList, new SvelteDate());

let isInitialized = false;

export function initBansosStore() {
	if (!browser || isInitialized) return;
	isInitialized = true;

	bansosState.data = checkExpired(bansosState.data, new SvelteDate());
}
