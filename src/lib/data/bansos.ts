import bansosData from './bansos.json';

export interface BansosItem {
	id: string;
	title: string;
	provider: string;
	providerLogoUrl?: string;
	description: string;
	benefits: string[];
	promoCode?: string;
	validity: {
		type: 'fixed' | 'uncertain' | 'forever';
		date?: string;
		description?: string;
	};
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

export interface ContributorSummary {
	name: string;
	url: string;
	count: number;
}

const DEFAULT_UTM = {
	source: 'bansos.dev',
	medium: 'referral',
	campaign: 'bansos'
};

function appendDefaultUtmParams(url: string) {
	try {
		const parsed = new URL(url);
		if (!parsed.searchParams.has('utm_source')) {
			parsed.searchParams.set('utm_source', DEFAULT_UTM.source);
		}
		if (!parsed.searchParams.has('utm_medium')) {
			parsed.searchParams.set('utm_medium', DEFAULT_UTM.medium);
		}
		if (!parsed.searchParams.has('utm_campaign')) {
			parsed.searchParams.set('utm_campaign', DEFAULT_UTM.campaign);
		}
		return parsed.toString();
	} catch {
		return url;
	}
}

export function addTrackedCtaLink(item: BansosItem): BansosItem {
	return {
		...item,
		ctaLink: appendDefaultUtmParams(item.ctaLink)
	};
}

export const bansosList: BansosItem[] = (bansosData as BansosItem[]).map((item) =>
	addTrackedCtaLink(item)
);

export const latestBansos = (limit = 3) => bansosList.slice(-limit).reverse();
export const featuredBansos = (limit = 3) =>
	bansosList
		.filter((i) => i.featured && i.status !== 'expired')
		.slice(-limit)
		.reverse();

export const allBansosTags = Array.from(new Set(bansosList.flatMap((item) => item.tags))).sort(
	(a, b) => a.localeCompare(b)
);

export function getBansosById(id: string) {
	return bansosList.find((item) => item.id === id);
}

export function getBansosByTag(tag: string) {
	return bansosList.filter((item) => item.tags.includes(tag));
}

function contributorKey(name: string, url: string) {
	return `${name.trim().toLowerCase()}::${normalizeContributorUrl(url)}`;
}

function normalizeContributorUrl(url: string) {
	try {
		const parsed = new URL(url.trim());
		return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}${parsed.search}${parsed.hash}`;
	} catch {
		return url.trim().replace(/\/+$/, '');
	}
}

export function getContributorStats() {
	const map = new Map<string, ContributorSummary>();

	for (const item of bansosList) {
		const contributor = item.contributor;
		if (!contributor?.name || !contributor?.url) continue;

		const key = contributorKey(contributor.name, contributor.url);
		const current = map.get(key);
		if (current) {
			current.count += 1;
		} else {
			map.set(key, {
				name: contributor.name.trim().toLowerCase(),
				url: contributor.url,
				count: 1
			});
		}
	}

	return Array.from(map.values()).sort((a, b) => {
		if (b.count !== a.count) return b.count - a.count;
		return a.name.localeCompare(b.name);
	});
}
