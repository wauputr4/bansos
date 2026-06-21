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

/**
 * Parses and validates a URL string.
 * @param url The URL string to parse.
 * @returns The parsed URL object or null if invalid/not http(s).
 */
function parseAndValidateUrl(url: string): URL | null {
	try {
		const parsed = new URL(url.trim());
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Sanitizes a URL string, returning a fallback if invalid.
 * @param url The URL string to sanitize.
 * @param fallback The fallback string (default: '#').
 * @returns The sanitized URL string.
 */
export function sanitizeUrl(url: string, fallback = '#') {
	const parsed = parseAndValidateUrl(url);
	return parsed ? parsed.toString() : fallback;
}

/**
 * Appends default UTM parameters to a URL.
 * @param url The URL string to process.
 * @returns The URL string with UTM parameters appended.
 */
function appendDefaultUtmParams(url: string) {
	const safeUrl = sanitizeUrl(url);
	if (safeUrl === '#') return safeUrl;

	try {
		const parsed = new URL(safeUrl);
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
		return safeUrl;
	}
}

/**
 * Extracts the provider (hostname) from a URL.
 * @param url The URL string to process.
 * @returns The extracted provider string or 'Unknown'.
 */
export function extractProvider(url: string) {
	try {
		const parsed = parseAndValidateUrl(url);
		if (!parsed) return 'Unknown';
		let hostname = parsed.hostname;

		// Strip common known subdomains first so we don't accidentally treat them as root domains later
		hostname = hostname.replace(
			/^(?:www\.|platform\.|console\.|docs\.|dash\.|api\.|app\.|auth\.|login\.)+/i,
			''
		);

		const parts = hostname.split('.');

		if (parts.length > 2) {
			const secondToLast = parts[parts.length - 2];
			const isTwoPartTld = [
				'co',
				'com',
				'org',
				'net',
				'edu',
				'gov',
				'mil',
				'ac',
				'go',
				'or'
			].includes(secondToLast);
			if (isTwoPartTld) {
				parts.pop(); // Remove the country code (e.g., 'uk')
				parts.pop(); // Remove the second level TLD (e.g., 'co')
			} else {
				parts.pop(); // Remove single TLD (e.g., 'com')
			}
		} else if (parts.length > 1) {
			parts.pop(); // Remove single TLD
		}

		const rootName = parts.pop() || 'Unknown';
		return rootName.charAt(0).toUpperCase() + rootName.slice(1);
	} catch {
		return 'Unknown';
	}
}

/**
 * Sanitizes and tracks a bansos item, appending UTM params and using explicit provider if available.
 * @param item The bansos item.
 * @returns The fully sanitized bansos item.
 */
export function sanitizeAndTrackBansosItem(item: BansosItem): BansosItem {
	const sanitizedItem = {
		...item,
		provider: item.provider?.trim() ? item.provider.trim() : extractProvider(item.ctaLink),
		ctaLink: appendDefaultUtmParams(item.ctaLink)
	};

	if (sanitizedItem.contributor?.url) {
		sanitizedItem.contributor = {
			...sanitizedItem.contributor,
			url: sanitizeUrl(sanitizedItem.contributor.url)
		};
	}

	return sanitizedItem as BansosItem;
}

/**
 * Normalizes bansos statuses based on a reference date.
 * @param items The list of bansos items.
 * @param referenceDate The date to use as reference (default: today).
 * @returns The list of bansos items with normalized statuses.
 */
export function normalizeBansosStatuses(items: BansosItem[], referenceDate = new Date()) {
	const dateToUse = Number.isNaN(referenceDate.getTime()) ? new Date() : referenceDate;
	const yyyy = dateToUse.getFullYear();
	const mm = String(dateToUse.getMonth() + 1).padStart(2, '0');
	const dd = String(dateToUse.getDate()).padStart(2, '0');
	const todayStr = `${yyyy}-${mm}-${dd}`;

	return items.map((item) => {
		if (item.status === 'upcoming' && item.publishedAt && item.publishedAt <= todayStr) {
			return { ...item, status: 'active' as const };
		}

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
	(bansosData as BansosItem[]).map((item) => sanitizeAndTrackBansosItem(item))
);

/**
 * Retrieves the timestamp value for an item's published date.
 * @param item The bansos item.
 * @param fallbackIndex The fallback index if date is missing or invalid.
 * @returns The timestamp value.
 */
function itemDateValue(item: BansosItem, fallbackIndex: number) {
	if (!item.publishedAt) return fallbackIndex;
	const timestamp = Date.parse(`${item.publishedAt}T00:00:00.000Z`);
	return Number.isNaN(timestamp) ? fallbackIndex : timestamp;
}

/**
 * Sorts bansos items by newest first.
 * @param items The list of bansos items.
 * @returns The sorted list of bansos items.
 */
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

/**
 * Returns recommended bansos items based on a current item's tags.
 * @param currentItem The item to base recommendations on.
 * @param items The list of bansos items.
 * @param limit The maximum number of recommendations.
 * @returns The recommended bansos items.
 */
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

/**
 * Gets a bansos item by its ID.
 * @param id The item ID.
 * @returns The matched bansos item or undefined.
 */
export function getBansosById(id: string) {
	return bansosList.find((item) => item.id === id);
}

/**
 * Gets bansos items containing a specific tag.
 * @param tag The tag to filter by.
 * @returns The matched bansos items.
 */
export function getBansosByTag(tag: string) {
	return bansosList.filter((item) => item.tags.includes(tag));
}

/**
 * Gets the source URL or identifier for an item.
 * @param item The bansos item.
 * @returns The source string.
 */
export function getItemSource(item: BansosItem) {
	return item.source;
}

/**
 * Gets commit contributors for a specific bansos item.
 * @param id The item ID.
 * @returns The list of commit contributors.
 */
export function getCommitContributorsForItem(id: string): CommitContributor[] {
	return (commitContributorsData as Record<string, CommitContributor[]>)[id] || [];
}

/**
 * Calculates aggregated commit contributor stats.
 * @returns An array of contributors sorted by contribution count.
 */
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

/**
 * Slugifies a provider name for URLs and keys.
 * @param provider The provider name.
 * @returns The slugified provider name.
 */
export function slugifyProvider(provider: string) {
	return provider
		.trim()
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique key for a provider.
 * @param provider The provider name.
 * @returns The provider key.
 */
function providerKey(provider: string) {
	return slugifyProvider(provider);
}

/**
 * Extracts the provider website URL from an item.
 * @param item The bansos item.
 * @returns The website origin URL or '#'.
 */
function providerWebsiteFrom(item: BansosItem) {
	const parsed = parseAndValidateUrl(item.ctaLink);
	return parsed ? parsed.origin : '#';
}

/**
 * Generates a Google favicon URL for a given URL.
 * @param url The website URL.
 * @returns The favicon image URL.
 */
function faviconUrlFor(url: string) {
	const parsed = parseAndValidateUrl(url);
	return parsed ? `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128` : '';
}

let cachedProviderStats: ProviderSummary[] | null = null;

/**
 * Calculates aggregated provider statistics.
 * @param items The list of bansos items.
 * @returns The calculated provider summaries.
 */
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
			return a.name.localeCompare(b.name);
		});

	if (items === bansosList) {
		cachedProviderStats = result;
	}

	return result;
}

/**
 * Gets provider statistics by slug.
 * @param slug The provider slug.
 * @returns The matching provider summary or undefined.
 */
export function getProviderBySlug(slug: string) {
	return getProviderStats().find((provider) => provider.slug === slug);
}

/**
 * Generates a unique key for a contributor.
 * @param name The contributor name.
 * @param url The contributor URL.
 * @returns The generated key.
 */
function contributorKey(name: string, url: string) {
	return `${name.trim().toLowerCase()}::${normalizeContributorUrl(url)}`;
}

/**
 * Normalizes a contributor URL.
 * @param url The URL string.
 * @returns The normalized URL string.
 */
function normalizeContributorUrl(url: string) {
	const parsed = parseAndValidateUrl(url);
	if (!parsed) return '#';
	return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}${parsed.search}${parsed.hash}`;
}

/**
 * Calculates aggregated contributor statistics.
 * @returns An array of contributor summaries sorted by count.
 */
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
