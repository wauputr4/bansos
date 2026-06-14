import bansosData from './bansos.json';
import commitContributorsData from './commit-contributors.json';

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
	publishedAt?: string;
	contributor?: {
		name: string;
		url: string;
	};
	source?: string;
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

export interface ProviderSummary {
	name: string;
	slug: string;
	websiteUrl: string;
	faviconUrl: string;
	totalCount: number;
	activeCount: number;
	expiredCount: number;
	upcomingCount: number;
	tags: string[];
	items: BansosItem[];
}

export interface CommitContributor {
	login: string;
	name: string;
	avatarUrl: string;
	commitUrl: string;
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

export function normalizeBansosStatuses(items: BansosItem[], referenceDate = new Date()) {
	const todayStr = Number.isNaN(referenceDate.getTime())
		? new Date().toISOString().split('T')[0]
		: referenceDate.toISOString().split('T')[0];

	return items.map((item) => {
		if (
			item.status !== 'expired' &&
			item.validity.type === 'fixed' &&
			item.validity.date &&
			item.validity.date < todayStr
		) {
			return { ...item, status: 'expired' as const };
		}

		return item;
	});
}

export const bansosList: BansosItem[] = normalizeBansosStatuses(
	(bansosData as BansosItem[]).map((item) => addTrackedCtaLink(item))
);

function itemDateValue(item: BansosItem, fallbackIndex: number) {
	if (!item.publishedAt) return fallbackIndex;
	const timestamp = Date.parse(`${item.publishedAt}T00:00:00.000Z`);
	return Number.isNaN(timestamp) ? fallbackIndex : timestamp;
}

export function sortBansosByNewest(items: BansosItem[] = bansosList) {
	return items
		.map((item, index) => ({ item, index }))
		.sort((a, b) => {
			const dateDiff = itemDateValue(b.item, b.index) - itemDateValue(a.item, a.index);
			if (dateDiff !== 0) return dateDiff;
			return b.index - a.index;
		})
		.map(({ item }) => item);
}

export const latestBansos = (limit = 3, items: BansosItem[] = bansosList) =>
	sortBansosByNewest(items).slice(0, limit);

export const featuredBansos = (limit = 3, items: BansosItem[] = bansosList) =>
	sortBansosByNewest(items)
		.filter((i) => i.featured && i.status !== 'expired')
		.slice(0, limit);

export function recommendedBansosFor(
	currentItem: BansosItem,
	items: BansosItem[] = bansosList,
	limit = 3
) {
	const currentTags = new Set(currentItem.tags);

	return sortBansosByNewest(items)
		.filter((entry) => entry.id !== currentItem.id)
		.filter((entry) => entry.status === 'active')
		.map((entry) => ({
			entry,
			score: entry.tags.filter((tag) => currentTags.has(tag)).length * 10 + (entry.featured ? 2 : 0)
		}))
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map(({ entry }) => entry);
}

export const allBansosTags = Array.from(new Set(bansosList.flatMap((item) => item.tags))).sort(
	(a, b) => a.localeCompare(b)
);

export function getBansosById(id: string) {
	return bansosList.find((item) => item.id === id);
}

export function getBansosByTag(tag: string) {
	return bansosList.filter((item) => item.tags.includes(tag));
}

export function getItemSource(item: BansosItem) {
	return item.source;
}

export function getCommitContributorsForItem(id: string): CommitContributor[] {
	return (commitContributorsData as Record<string, CommitContributor[]>)[id] || [];
}

export function getCommitContributorStats() {
	const map = new Map<string, CommitContributor & { count: number }>();

	for (const contributors of Object.values(
		commitContributorsData as Record<string, CommitContributor[]>
	)) {
		for (const contributor of contributors) {
			const current = map.get(contributor.login);
			if (current) {
				current.count += 1;
			} else {
				map.set(contributor.login, { ...contributor, count: 1 });
			}
		}
	}

	return Array.from(map.values()).sort((a, b) => {
		if (b.count !== a.count) return b.count - a.count;
		return a.login.localeCompare(b.login);
	});
}

export const commitContributorCount = getCommitContributorStats().length;

export function slugifyProvider(provider: string) {
	return provider
		.trim()
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function providerKey(provider: string) {
	return slugifyProvider(provider);
}

function providerWebsiteFrom(item: BansosItem) {
	try {
		const parsed = new URL(item.ctaLink);
		return parsed.origin;
	} catch {
		return item.ctaLink;
	}
}

function faviconUrlFor(url: string) {
	try {
		const parsed = new URL(url);
		return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
	} catch {
		return '';
	}
}

let cachedProviderStats: ProviderSummary[] | null = null;

export function getProviderStats(items: BansosItem[] = bansosList) {
	if (items === bansosList && cachedProviderStats) {
		return cachedProviderStats;
	}

	const map = new Map<string, ProviderSummary>();

	for (const item of normalizeBansosStatuses(items)) {
		const key = providerKey(item.provider);
		const current = map.get(key);
		const websiteUrl = providerWebsiteFrom(item);

		if (current) {
			current.items.push(item);
			current.totalCount += 1;
			current.activeCount += item.status === 'active' ? 1 : 0;
			current.expiredCount += item.status === 'expired' ? 1 : 0;
			current.upcomingCount += item.status === 'upcoming' ? 1 : 0;
			current.tags.push(...item.tags);
		} else {
			map.set(key, {
				name: item.provider,
				slug: key,
				websiteUrl,
				faviconUrl: item.providerLogoUrl || faviconUrlFor(websiteUrl),
				totalCount: 1,
				activeCount: item.status === 'active' ? 1 : 0,
				expiredCount: item.status === 'expired' ? 1 : 0,
				upcomingCount: item.status === 'upcoming' ? 1 : 0,
				tags: [...item.tags],
				items: [item]
			});
		}
	}

	const result = Array.from(map.values())
		.map((provider) => ({
			...provider,
			tags: Array.from(new Set(provider.tags)).sort((a, b) => a.localeCompare(b)),
			items: sortBansosByNewest(provider.items)
		}))
		.sort((a, b) => {
			if (b.activeCount !== a.activeCount) return b.activeCount - a.activeCount;
			if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
			return a.name.localeCompare(b.name);
		});

	if (items === bansosList) {
		cachedProviderStats = result;
	}

	return result;
}

export function getProviderBySlug(slug: string) {
	return getProviderStats().find((provider) => provider.slug === slug);
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
