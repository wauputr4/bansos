import bansosData from './bansos.json';

export interface BansosItem {
	id: string;
	title: string;
	provider: string;
	providerLogoUrl?: string;
	description: string;
	benefits: string[];
	promoCode?: string;
	validity: string;
	requirements: string[];
	tips?: string;
	contributor?: {
		name: string;
		url: string;
	};
	ctaLink: string;
	tags: string[];
	featured: boolean;
	status: 'active' | 'expired' | 'upcoming';
}

export const bansosList: BansosItem[] = bansosData as BansosItem[];

export const latestBansos = (limit = 3) => bansosList.slice(-limit).reverse();

export const allBansosTags = Array.from(new Set(bansosList.flatMap((item) => item.tags))).sort(
	(a, b) => a.localeCompare(b)
);

export function getBansosById(id: string) {
	return bansosList.find((item) => item.id === id);
}

export function getBansosByTag(tag: string) {
	return bansosList.filter((item) => item.tags.includes(tag));
}
