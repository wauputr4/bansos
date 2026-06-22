const CACHE_KEY = 'bansos_favicon_cache';

let memoryCache: Record<string, string> | null = null;

function loadCache() {
	if (memoryCache !== null) return;
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		memoryCache = {};
		return;
	}
	try {
		memoryCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
	} catch {
		memoryCache = {};
	}
}

function saveCache() {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !memoryCache) return;
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
	} catch {
		// ignore
	}
}

function isValidUrl(url: string): boolean {
	if (!url || url === '#') return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function getCachedFavicon(domainUrl: string): string | null {
	if (!isValidUrl(domainUrl)) return null;
	loadCache();
	return memoryCache ? memoryCache[domainUrl] || null : null;
}

export function setCachedFavicon(domainUrl: string, resolvedUrl: string) {
	if (!isValidUrl(domainUrl)) return;
	loadCache();
	if (memoryCache && memoryCache[domainUrl] !== resolvedUrl) {
		memoryCache[domainUrl] = resolvedUrl;
		saveCache();
	}
}

export function handleFaviconFallback(e: Event, websiteUrl: string) {
	if (!isValidUrl(websiteUrl)) return;
	const target = e.currentTarget as HTMLImageElement;
	if (!target.dataset.fallback) {
		target.dataset.fallback = 'iconhorse';
		try {
			const hostname = new URL(websiteUrl).hostname;
			target.src = `https://icon.horse/icon/${hostname}`;
		} catch {
			target.dataset.fallback = 'google';
			target.src = `https://www.google.com/s2/favicons?domain=${websiteUrl}&sz=128`;
		}
	} else if (target.dataset.fallback === 'iconhorse') {
		target.dataset.fallback = 'google';
		try {
			const hostname = new URL(websiteUrl).hostname;
			target.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
		} catch {
			// Silently fail if all fallbacks are exhausted
		}
	}
}
