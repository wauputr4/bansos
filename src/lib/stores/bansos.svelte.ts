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

// Perform an initial local check so SSG/SSR starts somewhat correct
bansosState.data = normalizeBansosStatuses(initialBansosList, new SvelteDate());

let isInitialized = false;

export function initBansosStore() {
	if (!browser || isInitialized) return;
	isInitialized = true;
	bansosState.data = normalizeBansosStatuses(bansosState.data, new SvelteDate());
}
