import { browser } from '$app/environment';
import { SvelteDate } from 'svelte/reactivity';
import { bansosList as initialBansosList, type BansosItem } from '$lib/data/bansos';

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
	const todayStr = referenceDate.toISOString().split('T')[0];
	return data.map((item) => {
		let validityObj = item.validity;
		if (typeof validityObj === 'string') {
			validityObj = { type: 'uncertain' };
		}

		if (
			item.status !== 'expired' &&
			validityObj &&
			validityObj.type === 'fixed' &&
			validityObj.date
		) {
			if (validityObj.date < todayStr) {
				return { ...item, validity: validityObj, status: 'expired' };
			}
		}
		return { ...item, validity: validityObj };
	});
}

// Perform an initial local check so SSG/SSR starts somewhat correct
bansosState.data = checkExpired(initialBansosList, new SvelteDate());

let isInitialized = false;

export function initBansosStore() {
	if (!browser || isInitialized) return;
	isInitialized = true;

	// Fetch true server time to prevent local client clock bypass
	fetch('/robots.txt', { method: 'HEAD' })
		.then((res) => {
			const dateHeader = res.headers.get('Date');
			if (dateHeader) {
				const serverDate = new SvelteDate(dateHeader);
				bansosState.data = checkExpired(bansosState.data, serverDate);
			}
		})
		.catch(() => {});
}
