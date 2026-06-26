import { register, init, locale } from 'svelte-i18n';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Import translations synchronously for SSR
import id from './id.json';
import en from './en.json';

// Re-export t for convenience (locale is already imported above)
export { t } from 'svelte-i18n';

// Persistent locale store
export const currentLocale = writable<string>('id');

register('id', () => Promise.resolve(id));
register('en', () => Promise.resolve(en));

init({
	fallbackLocale: 'id',
	initialLocale:
		browser && localStorage.getItem('bansos-locale') ? localStorage.getItem('bansos-locale')! : 'id'
});

// Persist locale changes
if (browser) {
	locale.subscribe(($locale) => {
		if ($locale) {
			localStorage.setItem('bansos-locale', $locale);
			currentLocale.set($locale);
		}
	});
}

export function switchLocale(newLocale: 'id' | 'en') {
	locale.set(newLocale);
}
