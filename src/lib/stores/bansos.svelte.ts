import { browser } from '$app/environment';
import { bansosList as initialBansosList, type BansosItem } from '$lib/data/bansos';

const GITHUB_RAW_URL =
	'https://raw.githubusercontent.com/wauputr4/bansos/refs/heads/main/src/lib/data/bansos.json';
const CACHE_KEY = 'bansos_data_cache';
export const COOLDOWN_MS = 60 * 1000; // 1 minute

export const bansosState = $state({
	data: initialBansosList as BansosItem[],
	lastFetched: 0,
	isFetching: false
});

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
}

export async function fetchLatestBansos() {
	if (!browser) return;

	const now = Date.now();

	bansosState.isFetching = true;
	try {
		const res = await fetch(GITHUB_RAW_URL);
		if (!res.ok) throw new Error('Failed to fetch from GitHub');

		const newData = await res.json();

		if (Array.isArray(newData)) {
			bansosState.data = newData;
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
