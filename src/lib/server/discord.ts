import type { BansosItem } from '$lib/data/bansos';
import type { DynamicDb } from './dynamic-db';

export interface DiscordConfig {
	BANSOS_ENV?: string;
	DISCORD_NOTIFICATIONS_ENABLED?: string;
	DISCORD_WEBHOOK_URL?: string;
	DISCORD_APPROVED_CHANNEL_ID?: string;
	DISCORD_ADMIN_NOTIFICATIONS_ENABLED?: string;
	DISCORD_ADMIN_WEBHOOK_URL?: string;
	DISCORD_ADMIN_CHANNEL_ID?: string;
}

export function discordMessage(item: BansosItem, site: string, revision: boolean) {
	return {
		content: revision ? 'Informasi bansos diperbarui.' : 'Ada bansos developer baru 🚀',
		allowed_mentions: { parse: [] },
		embeds: [
			{
				title: item.title.slice(0, 256),
				url: `${site}/list/${encodeURIComponent(item.id)}/`,
				description: item.description.slice(0, 500),
				color: 1096065,
				fields: [{ name: 'Provider', value: item.provider.slice(0, 1024) }],
				author: { name: (item.contributor?.name || 'Kontributor komunitas').slice(0, 256) }
			}
		]
	};
}

// Hosted staging must never send into a real Discord channel.
export function discordEnabled(config: DiscordConfig) {
	return config.BANSOS_ENV !== 'staging' && config.DISCORD_NOTIFICATIONS_ENABLED === '1';
}

export function reviewDiscordEnabled(config: DiscordConfig) {
	return (
		config.BANSOS_ENV !== 'staging' &&
		config.DISCORD_ADMIN_NOTIFICATIONS_ENABLED === '1' &&
		!!config.DISCORD_ADMIN_WEBHOOK_URL &&
		/^\d+$/.test(config.DISCORD_ADMIN_CHANNEL_ID || '')
	);
}

export function reviewDiscordMessage(
	item: { title: string; provider: string; login: string },
	id: number
) {
	return {
		content: 'Ada permohonan bansos yang perlu ditinjau admin.',
		allowed_mentions: { parse: [] },
		embeds: [
			{
				title: item.title.slice(0, 256),
				url: `https://bansos.dev/admin/#submission-${id}`,
				description: `Diajukan oleh @${item.login}. Belum disetujui atau dipublikasikan.`,
				fields: [{ name: 'Provider', value: item.provider.slice(0, 1024) }],
				color: 15844367
			}
		]
	};
}

export async function deliverDiscord(
	webhook: string,
	payload: unknown,
	transport: typeof fetch = fetch,
	expectedChannelId?: string
) {
	const url = new URL(webhook);
	if (url.origin !== 'https://discord.com' || !/^\/api\/webhooks\/\d+\/[^/]+$/.test(url.pathname))
		throw new Error('Webhook Discord tidak valid.');
	if (expectedChannelId) {
		const metadata = await transport(url, {
			redirect: 'error',
			signal: AbortSignal.timeout(10_000)
		});
		if (!metadata.ok || (await metadata.json()).channel_id !== expectedChannelId)
			throw new Error('Kanal webhook Discord tidak sesuai.');
	}
	url.searchParams.set('wait', 'true');
	const response = await transport(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		redirect: 'error',
		signal: AbortSignal.timeout(10_000)
	});
	return { ok: response.ok, status: response.status };
}

export async function dispatchDiscord(
	db: DynamicDb,
	key: string,
	config: DiscordConfig,
	review = false
) {
	const enabled = review ? reviewDiscordEnabled(config) : discordEnabled(config);
	const webhook = review ? config.DISCORD_ADMIN_WEBHOOK_URL : config.DISCORD_WEBHOOK_URL;
	if (!enabled || !webhook) return;
	// The review channel is explicitly pinned, never inferred from user input or the public webhook.
	if (review && webhook === config.DISCORD_WEBHOOK_URL) return;
	const table = review ? 'admin_notification_outbox' : 'notification_outbox';
	const now = Math.floor(Date.now() / 1000);
	const token = crypto.randomUUID();
	const claimed = await db
		.prepare(
			`UPDATE ${table} SET state = 'sending', lease_until = ?, lease_token = ?, attempts = attempts + 1 WHERE event_key = ? AND next_attempt <= ? AND (state = 'pending' OR (state = 'sending' AND lease_until < ?))`
		)
		.bind(now + 60, token, key, now, now)
		.run();
	if (claimed.meta?.changes !== 1) return;
	const row = await db
		.prepare(
			`SELECT payload, attempts${review ? ', submission_id' : ''} FROM ${table} WHERE event_key = ? AND lease_token = ?`
		)
		.bind(key, token)
		.first<{ payload: string; attempts: number; submission_id?: number }>();
	if (!row) return;
	let status = 'transport_error';
	try {
		const visible = await db
			.prepare(
				review
					? "SELECT s.id FROM submissions s JOIN users u ON u.github_id = s.github_id JOIN admin_notification_outbox n ON n.submission_id = s.id WHERE n.event_key = ? AND n.event_key = 'review:' || s.id || ':' || s.review_version AND s.state = 'pending' AND s.withdrawn_at IS NULL AND u.banned_at IS NULL"
					: "SELECT id FROM catalog_items WHERE id = (SELECT listing_id FROM notification_outbox WHERE event_key = ?) AND state = 'published' AND deleted_at IS NULL"
			)
			.bind(key)
			.first();
		if (!visible && review) {
			await db
				.prepare(
					"UPDATE admin_notification_outbox SET state = 'cancelled', last_error = 'submission_not_pending', lease_token = NULL WHERE event_key = ? AND lease_token = ?"
				)
				.bind(key, token)
				.run();
			return;
		}
		if (!visible) status = 'listing_not_public';
		else {
			const payload = review
				? reviewDiscordMessage(JSON.parse(row.payload), row.submission_id!)
				: JSON.parse(row.payload);
			const response = await deliverDiscord(
				webhook,
				payload,
				fetch,
				review ? config.DISCORD_ADMIN_CHANNEL_ID : config.DISCORD_APPROVED_CHANNEL_ID
			);
			if (response.ok) {
				await db
					.prepare(
						`UPDATE ${table} SET state = 'sent', sent_at = CURRENT_TIMESTAMP, last_error = NULL, lease_token = NULL WHERE event_key = ? AND lease_token = ?`
					)
					.bind(key, token)
					.run();
				return;
			}
			status = `http_${response.status}`;
		}
	} catch {
		/* Do not log webhook URL/token, response bodies, or private payloads. */
	}
	await db
		.prepare(
			`UPDATE ${table} SET state = 'pending', last_error = ?, next_attempt = ?, lease_token = NULL WHERE event_key = ? AND lease_token = ?`
		)
		.bind(status, now + Math.min(3600, 60 * 2 ** Math.min(row.attempts, 6)), key, token)
		.run();
}
