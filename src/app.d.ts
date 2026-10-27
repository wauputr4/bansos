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
		interface Locals {
			user: {
				github_id: number;
				login: string;
				display_name: string;
				avatar_url: string | null;
				role: 'user' | 'admin';
				banned_at: string | null;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB?: import('$lib/server/dynamic-db').DynamicDb;
				GITHUB_CLIENT_ID?: string;
				GITHUB_CLIENT_SECRET?: string;
				GITHUB_CALLBACK_URL?: string;
				OWNER_GITHUB_ID?: string;
				BANSOS_LOCAL_DEMO?: string;
				BANSOS_ENV?: string;
				DISCORD_NOTIFICATIONS_ENABLED?: string;
				DISCORD_WEBHOOK_URL?: string;
				DISCORD_APPROVED_CHANNEL_ID?: string;
				DISCORD_ADMIN_NOTIFICATIONS_ENABLED?: string;
				DISCORD_ADMIN_WEBHOOK_URL?: string;
				DISCORD_ADMIN_CHANNEL_ID?: string;
				CF_API_TOKEN?: string;
				CF_ZONE_ID?: string;
				GITHUB_DISCUSS_TOKEN?: string;
				VITE_GISCUS_REPO?: string;
			};
		}
	}
}

export {};
