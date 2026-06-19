// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	const __BUILD_DATE__: string;

	interface Window {
		dataLayer: unknown[];
		gtag?: (...args: unknown[]) => void;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				CF_API_TOKEN?: string;
				CF_ZONE_ID?: string;
			};
		}
	}
}

export {};
