/**
 * bansos.ts — Data layer for bansos.dev
 * Loads bansos data from folder structure (src/lib/data/bansos/<slug>/index.json)
 * and contributor profiles (src/lib/data/bansos/contributors/<login>/manifest.json)
 *
 * Migration guide:
 * - Old `contributor` inline object → `contributorSlug` string (ref to contributors/<slug>/)
 * - Hidden items (hidden: true) are excluded from public lists
 * - commit-contributors.json is replaced by contributor manifests
 */

// ─── Dynamic imports from folder structure ────────────────────────────────

interface BansosModule {
	id?: string;
	title?: string;
	provider?: string;
	description?: string;
	benefits?: string[];
	validity?: { type: string; date?: string; description?: string };
	requirements?: string[];
	ctaLink?: string;
	tags?: string[];
	status?: string;
	featured?: boolean;
	publishedAt?: string;
	contributorSlug?: string;
	hidden?: boolean;
	customUI?: boolean;
}

interface ContributorModule {
	login?: string;
	displayName?: string;
	title?: string;
	bio?: string;
	avatar?: string;
	location?: string;
	pronouns?: string;
	skills?: string[];
	links?: Record<string, string>;
	contributedBansos?: string[];
	hidden?: boolean;
	joinedAt?: string;
}

// Vite glob imports — eager so data is available at module load time
const bansosGlob = import.meta.glob<BansosModule>('./bansos/*/index.json', {
	eager: true,
	import: 'default'
});

const contributorGlob = import.meta.glob<ContributorModule>(
	'./bansos/contributors/*/manifest.json',
	{ eager: true, import: 'default' }
);

// ─── Types ────────────────────────────────────────────────────────────────

export interface BansosItem {
	id: string;
	title: string;
	provider: string;
	providerLogoUrl?: string;
	providerWebsiteUrl?: string;
	/** URL gambar preview/thumbnail utama entry bansos */
	image?: string;
	/** URL gambar galeri tambahan (multiple images untuk detail page) */
	images?: string[];
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
	contributorSlug?: string;
	/** @deprecated Use contributorSlug instead */
	contributor?: {
		name: string;
		url: string;
	};
	source?: string;
	ctaLink: string;
	tags: string[];
	featured: boolean;
	featuredSince?: string;
	featuredUntil?: string;
	status: 'active' | 'expired' | 'upcoming';
	hidden?: boolean;
	customUI?: boolean;
}

export interface Contributor {
	login: string;
	displayName: string;
	title?: string;
	bio?: string;
	avatar?: string;
	location?: string;
	pronouns?: string;
	skills: string[];
	links: Record<string, string>;
	contributedBansos: string[];
	hidden?: boolean;
	joinedAt?: string;
}

export interface ContributorSummary {
	login: string;
	name: string;
	avatar?: string;
	hasGithub: boolean;
	count: number;
	editCount: number;
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

// ─── Utility ─────────────────────────────────────────────────────────────

const DEFAULT_UTM = {
	source: 'bansos.dev',
	medium: 'referral',
	campaign: 'bansos'
} as const;

/**
 * Formats a number to a compact string (e.g. 1100 -> 1.1k)
 */
export function formatNumber(num: number | string): string {
	if (typeof num === 'string') num = parseInt(num, 10);
	if (isNaN(num)) return '0';
	return new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(num);
}

/**
 * Parses and validates a URL string.
 */
function parseAndValidateUrl(url: string): URL | null {
	try {
		const parsed = new URL(url.trim());
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Sanitizes a URL string, returning a fallback if invalid.
 */
export function sanitizeUrl(url: string, fallback = '#') {
	const parsed = parseAndValidateUrl(url);
	return parsed ? parsed.toString() : fallback;
}

/**
 * Appends default UTM parameters to a URL.
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
 */
export function extractProvider(url: string) {
	try {
		const parsed = parseAndValidateUrl(url);
		if (!parsed) return 'Unknown';
		let hostname = parsed.hostname;
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
				parts.pop();
				parts.pop();
			} else {
				parts.pop();
			}
		} else if (parts.length > 1) {
			parts.pop();
		}
		const rootName = parts.pop() || 'Unknown';
		return rootName.charAt(0).toUpperCase() + rootName.slice(1);
	} catch {
		return 'Unknown';
	}
}

// ─── Data loading ─────────────────────────────────────────────────────────

/**
 * Extracts the slug from a glob key path.
 * e.g. './bansos/namecom-domain-app/index.json' → 'namecom-domain-app'
 */
function slugFromPath(path: string): string {
	return path.replace(/^\.\/bansos\//, '').replace(/\/index\.json$/, '');
}

/**
 * Extracts the login from a contributor glob key path.
 * e.g. './bansos/contributors/wauputra/manifest.json' → 'wauputra'
 */
function loginFromPath(path: string): string {
	return path.replace(/^\.\/bansos\/contributors\//, '').replace(/\/manifest\.json$/, '');
}

/**
 * Sanitizes and tracks a bansos item, appending UTM params and resolving provider.
 */
function sanitizeAndTrackBansosItem(item: BansosItem): BansosItem {
	return {
		...item,
		provider: item.provider?.trim() ? item.provider.trim() : extractProvider(item.ctaLink),
		ctaLink: appendDefaultUtmParams(item.ctaLink)
	} as BansosItem;
}

/**
 * Normalizes bansos statuses based on a reference date.
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
			item.validity?.type === 'fixed' &&
			item.validity.date &&
			item.validity.date < todayStr
		) {
			return { ...item, status: 'expired' as const };
		}
		return item;
	});
}

/**
 * Builds the bansos list from the folder structure, filtering out hidden items.
 */
function buildBansosList(): BansosItem[] {
	const items: BansosItem[] = [];

	for (const [path, data] of Object.entries(bansosGlob)) {
		if (!data || !data.title) continue;
		const slug = slugFromPath(path);

		// Skip hidden items (privacy flag)
		if (data.hidden === true) continue;

		const item: BansosItem = {
			id: slug,
			title: data.title as string,
			provider: (data.provider as string) || extractProvider(data.ctaLink as string),
			description: data.description as string,
			benefits: (data.benefits as string[]) || [],
			validity: (data.validity as BansosItem['validity']) || { type: 'uncertain' },
			requirements: (data.requirements as string[]) || [],
			ctaLink: (data.ctaLink as string) || '#',
			tags: (data.tags as string[]) || [],
			featured: (data.featured as boolean) || false,
			status: (data.status as string as BansosItem['status']) || 'active'
		};

		// Optional fields — read from raw data and assign directly
		const rawData = data as unknown as Record<string, unknown>;
		for (const field of [
			'promoCode',
			'tips',
			'publishedAt',
			'source',
			'featuredSince',
			'featuredUntil',
			'providerLogoUrl',
			'providerWebsiteUrl',
			'image',
			'images',
			'contributorSlug',
			'hidden',
			'customUI'
		] as const) {
			const val = rawData[field];
			if (val !== undefined && val !== null && val !== '') {
				const mutableItem = item as unknown as Record<string, unknown>;
				mutableItem[field] = val;
			}
		}

		items.push(item);
	}

	return items;
}

// Build the list at module load time
const rawBansosList = buildBansosList();
export const bansosList: BansosItem[] = normalizeBansosStatuses(
	rawBansosList.map((item) => sanitizeAndTrackBansosItem(item))
);

// ─── Sorting & filtering ──────────────────────────────────────────────────

function itemDateValue(item: BansosItem, fallbackIndex: number) {
	if (!item.publishedAt) return fallbackIndex;
	const timestamp = Date.parse(`${item.publishedAt}T00:00:00.000Z`);
	return Number.isNaN(timestamp) ? fallbackIndex : timestamp;
}

/**
 * Sorts bansos items by newest first.
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
	items
		.filter((i) => i.featured && i.status !== 'expired')
		.sort((a, b) => {
			const aSince = a.featuredSince || '';
			const bSince = b.featuredSince || '';
			if (aSince !== bSince) return bSince.localeCompare(aSince);
			return 0;
		})
		.slice(0, limit);

/**
 * Returns recommended bansos items based on a current item's tags.
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
 * Gets a bansos item by its ID/slug.
 */
export function getBansosById(id: string) {
	return bansosList.find((item) => item.id === id);
}

/**
 * Gets bansos items containing a specific tag.
 */
export function getBansosByTag(tag: string) {
	return bansosList.filter((item) => item.tags.includes(tag));
}

/**
 * Gets the source URL or identifier for an item.
 */
export function getItemSource(item: BansosItem) {
	return item.source;
}

// ─── Contributors ─────────────────────────────────────────────────────────

/**
 * Builds a map of contributors from the folder structure.
 */
function buildContributorMap(): Map<string, Contributor> {
	const map = new Map<string, Contributor>();

	for (const [path, data] of Object.entries(contributorGlob)) {
		if (!data || !data.login) continue;
		const login = loginFromPath(path);

		const links = Object.fromEntries(
			Object.entries(data.links || {})
				.map(([platform, url]) => [platform, sanitizeUrl(url)] as const)
				.filter(([, url]) => url !== '#')
		);
		const github = links.github?.match(/^https:\/\/github\.com\/([^/?#]+)/i)?.[1];
		const explicitAvatar = data.avatar ? sanitizeUrl(data.avatar, '') || undefined : undefined;

		const contributor: Contributor = {
			login: data.login as string,
			displayName: (data.displayName as string) || login,
			title: (data.title as string) || '',
			bio: (data.bio as string) || '',
			avatar: explicitAvatar || (github ? `https://github.com/${github}.png?size=96` : undefined),
			location: data.location as string | undefined,
			pronouns: data.pronouns as string | undefined,
			skills: (data.skills as string[]) || [],
			links,
			contributedBansos: (data.contributedBansos as string[]) || [],
			hidden: (data.hidden as boolean) || false,
			joinedAt: data.joinedAt as string | undefined
		};

		map.set(login, contributor);
	}

	return map;
}

/** Returns a compact two-letter fallback for contributors without an avatar. */
export function getContributorInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts.at(-1)?.[0] || ''}`.toUpperCase();
}

const contributorMap = buildContributorMap();

/**
 * Gets a contributor profile by their login/slug.
 * Hidden contributors are excluded unless `includeHidden` is true.
 */
export function getContributorBySlug(
	login: string,
	includeHidden = false
): Contributor | undefined {
	const contributor = contributorMap.get(login);
	if (!contributor) return undefined;
	if (contributor.hidden && !includeHidden) return undefined;
	return contributor;
}

/**
 * Gets all contributors, optionally including hidden ones.
 */
export function getAllContributors(includeHidden = false): Contributor[] {
	return Array.from(contributorMap.values()).filter((c) => includeHidden || !c.hidden);
}

function githubLogin(contributor: Contributor): string | undefined {
	return contributor.links.github?.match(/^https:\/\/github\.com\/([^/?#]+)/i)?.[1].toLowerCase();
}

export function getContributorProfileSlugForGitLogin(login: string): string | undefined {
	const normalized = login.toLowerCase();
	return getAllContributors().find(
		(contributor) =>
			contributor.login.toLowerCase() === normalized || githubLogin(contributor) === normalized
	)?.login;
}

/**
 * Calculates aggregated contributor statistics from the contributor manifests.
 */
export function getContributorStats(): ContributorSummary[] {
	const stats = new Map<string, ContributorSummary>();
	const commitStats = getCommitContributorStats();

	for (const contributor of getAllContributors()) {
		const count = contributor.contributedBansos.filter((id) => getBansosById(id)).length;
		if (count === 0) continue;
		const login = contributor.login;
		const github = githubLogin(contributor);
		const editCount = commitStats.find(
			(entry) => entry.login.toLowerCase() === (github || login.toLowerCase())
		)?.count;
		stats.set(login, {
			login,
			name: contributor.displayName,
			avatar: contributor.avatar,
			hasGithub: Boolean(github),
			count,
			editCount: editCount || 0
		});
	}

	return Array.from(stats.values()).sort((a, b) => {
		if (a.hasGithub !== b.hasGithub) return a.hasGithub ? -1 : 1;
		if (b.count !== a.count) return b.count - a.count;
		return a.name.localeCompare(b.name);
	});
}

/**
 * Get contributors for a specific bansos item (via contributorSlug).
 */
export function getContributorsForBansos(slug: string): Contributor[] {
	const item = getBansosById(slug);
	if (!item?.contributorSlug) return [];
	const contributor = getContributorBySlug(item.contributorSlug);
	return contributor ? [contributor] : [];
}

// ─── Providers ────────────────────────────────────────────────────────────

/**
 * Slugifies a provider name for URLs and keys.
 */
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
	const parsed = parseAndValidateUrl(item.providerWebsiteUrl || item.ctaLink);
	return parsed ? parsed.origin : '#';
}

function faviconUrlFor(url: string) {
	const parsed = parseAndValidateUrl(url);
	return parsed
		? `${parsed.origin}/favicon.ico`
		: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3C/svg%3E";
}

let cachedProviderStats: ProviderSummary[] | null = null;

/**
 * Calculates aggregated provider statistics.
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
		.sort((a, b) => a.name.localeCompare(b.name));

	if (items === bansosList) {
		cachedProviderStats = result;
	}

	return result;
}

/**
 * Gets provider statistics by slug.
 */
export function getProviderBySlug(slug: string) {
	return getProviderStats().find((provider) => provider.slug === slug);
}

// ─── Contributor count (replaces old commit-contributor count) ────────────

export const commitContributorCount = getAllContributors().length;

// ─── Auto-generated commit contributors from git history ────────────────
// Generated by scripts/generate-commit-contributors.mjs
// Maps bansos slug → array of { login, name, avatarUrl, commitUrl }

interface CommitContributorsIndex {
	[slug: string]: CommitContributorEntry[];
}

interface CommitContributorEntry {
	login: string;
	name: string;
	avatarUrl: string;
	commitUrl: string;
}

const commitContributorsGlob = import.meta.glob<CommitContributorsIndex>(
	'./bansos/commit-contributors.json',
	{ eager: true, import: 'default' }
);

// Extract the data from the glob result
const commitContributorsData: CommitContributorsIndex =
	Object.values(commitContributorsGlob)[0] || {};

/**
 * Get commit contributors for a specific bansos item (from git history).
 */
export function getCommitContributorsForItem(id: string): CommitContributorEntry[] {
	return (commitContributorsData[id] || []).filter(
		(contributor) => !contributor.login.endsWith('[bot]')
	);
}

/**
 * Get aggregated commit contributor stats (from git history).
 */
export function getCommitContributorStats(): (CommitContributorEntry & { count: number })[] {
	const map = new Map<string, CommitContributorEntry & { count: number }>();

	for (const contributors of Object.values(commitContributorsData)) {
		for (const contributor of contributors) {
			if (contributor.login.endsWith('[bot]')) continue;
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

// ─── Deprecated backward compatibility types ──────────────────────────

export interface CommitContributor {
	login: string;
	name: string;
	avatarUrl: string;
	commitUrl: string;
}
