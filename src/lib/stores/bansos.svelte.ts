import { browser } from '$app/environment';
import { SvelteDate } from 'svelte/reactivity';
import {
	bansosList as initialBansosList,
	addTrackedCtaLink,
	normalizeBansosStatuses,
	type BansosItem
} from '$lib/data/bansos';

const GITHUB_RAW_URL =
	'https://raw.githubusercontent.com/wauputr4/bansos/refs/heads/main/src/lib/data/bansos.json';
const CACHE_KEY = 'bansos_data_cache';
export const COOLDOWN_MS = 60 * 1000; // 1 minute

export const bansosState = $state({
	data: initialBansosList as BansosItem[],
	lastFetched: 0,
	isFetching: false
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

	try {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			const parsed = JSON.parse(cached);
			if (parsed.lastFetched) {
				bansosState.lastFetched = parsed.lastFetched;
			}
		}
	} catch (e) {
		console.error('Failed to parse cached bansos data', e);
	}

	// Fetch true server time to prevent local client clock bypass
	fetch(window.location.href, { method: 'HEAD' })
		.then((res) => {
			const dateHeader = res.headers.get('Date');
			if (dateHeader) {
				const serverDate = new SvelteDate(dateHeader);
				bansosState.data = checkExpired(bansosState.data, serverDate);
			}
		})
		.catch(() => {});
}

export async function fetchLatestBansos() {
	if (!browser) return;

	const now = Date.now();

	bansosState.isFetching = true;
	try {
		const res = await fetch(GITHUB_RAW_URL);
		if (!res.ok) throw new Error('Failed to fetch from GitHub');

		const serverDateStr = res.headers.get('Date');
		const serverDate = serverDateStr ? new SvelteDate(serverDateStr) : new SvelteDate();

		const newData = await res.json();

		if (Array.isArray(newData)) {
			const trackedData = (newData as BansosItem[]).map((item) => addTrackedCtaLink(item));
			bansosState.data = checkExpired(trackedData, serverDate);
			bansosState.lastFetched = now;
			// Only cache the timestamp to prevent data tampering (Self-XSS/Injection)
			localStorage.setItem(
				CACHE_KEY,
				JSON.stringify({
					lastFetched: now
				})
			);
		}
	} catch (e) {
		console.error('Failed to dynamically fetch bansos data:', e);
	} finally {
		bansosState.isFetching = false;
	}
}
