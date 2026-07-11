import { register, init, locale } from 'svelte-i18n';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const ALL_LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'id', name: 'Indonesia' },
	{ code: 'zh', name: '简体中文', hoverName: 'Simplified Chinese' },
	{ code: 'ja', name: '日本語', hoverName: 'Japanese' },
	{ code: 'ko', name: '한국어', hoverName: 'Korean' },
	{ code: 'es', name: 'Español' },
	{ code: 'fr', name: 'Français' },
	{ code: 'de', name: 'Deutsch' },
	{ code: 'ru', name: 'Русский', hoverName: 'Russian' },
	{ code: 'ar', name: 'العربية', hoverName: 'Arabic' },
	{ code: 'hi', name: 'हिन्दी', hoverName: 'Hindi' },
	{ code: 'pt', name: 'Português' }
] as const;

export type SupportedLocale = (typeof ALL_LANGUAGES)[number]['code'];

const i18nFiles = import.meta.glob('./*.json', { eager: true });
export const availableCodes = Object.keys(i18nFiles).map(
	(path) => path.split('/').pop()?.replace('.json', '') || ''
) as SupportedLocale[];

// Re-export t for convenience
export { t } from 'svelte-i18n';

// Persistent locale store
export const currentLocale = writable<SupportedLocale>('id');

availableCodes.forEach((code) => {
	register(code, () => {
		const mod = i18nFiles[`./${code}.json`] as { default?: unknown };
		return Promise.resolve(mod.default || mod);
	});
});

export function isValidLocale(loc: string | null | undefined): loc is SupportedLocale {
	return loc != null && availableCodes.includes(loc as SupportedLocale);
}

function getInitialLocale(): SupportedLocale {
	if (!browser) return 'id';
	const stored = localStorage.getItem('bansos-locale');
	if (isValidLocale(stored)) return stored;
	const sysLang = window.navigator.language.toLowerCase();
	const sysCode = sysLang.split('-')[0];
	if (isValidLocale(sysCode)) return sysCode as SupportedLocale;
	return 'en';
}

init({
	fallbackLocale: 'en',
	initialLocale: getInitialLocale()
});

// Persist locale changes
if (browser) {
	locale.subscribe(($locale) => {
		if (isValidLocale($locale)) {
			localStorage.setItem('bansos-locale', $locale);
			currentLocale.set($locale);
		}
	});
}

export function switchLocale(newLocale: SupportedLocale) {
	if (isValidLocale(newLocale)) {
		locale.set(newLocale);
	}
}
