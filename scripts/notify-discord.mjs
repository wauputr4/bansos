import fs from 'fs';
import { execSync } from 'child_process';

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
if (!WEBHOOK_URL) {
	console.log('No DISCORD_WEBHOOK_URL provided. Skipping.');
	process.exit(0);
}

const currentData = JSON.parse(fs.readFileSync('src/lib/data/bansos.json', 'utf8'));

let prevData = [];
try {
	const prevFile = execSync('git show HEAD~1:src/lib/data/bansos.json', { encoding: 'utf8' });
	prevData = JSON.parse(prevFile);
} catch (err) {
	console.error('Could not read previous bansos.json:', err.message);
	console.error('Aborting to prevent webhook spam (fallback triggers all bansos).');
	process.exit(0);
}

const prevIds = new Set(prevData.map((b) => b.id));
const newBansos = currentData.filter((b) => !prevIds.has(b.id));

if (newBansos.length === 0) {
	console.log('No new bansos found.');
	process.exit(0);
}

const truncate = (str, max) => {
	if (!str) return '';
	return str.length > max ? str.slice(0, max - 3) + '...' : str;
};

const getTimestamp = (dateStr) => {
	if (!dateStr) return new Date().toISOString();
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return new Date().toISOString();
		return date.toISOString();
	} catch {
		return new Date().toISOString();
	}
};

for (const bansos of newBansos) {
	let validity = bansos.validity?.description || bansos.validity?.date;
	if (!validity && bansos.validity?.type === 'forever') validity = 'Selamanya';

	const benefitsList = bansos.benefits?.map((b) => `• ${b}`).join('\n') || '-';
	const requirementsList = bansos.requirements?.map((r) => `• ${r}`).join('\n') || '-';
	const tagsList = bansos.tags?.map((t) => `\`${t}\``).join(', ') || '-';

	const ctaText = `\n\n**🔗 [Klaim Bansos di Sini](https://bansos.dev/list/${bansos.id})**`;
	const maxDescLen = 4096 - ctaText.length;

	const payload = {
		content:
			'Panggilan untuk <@&1518499313947512832>! 🚨 Ada info bansos baru nih, langsung sikat! 🚀',
		allowed_mentions: { roles: ['1518499313947512832'] },
		embeds: [
			{
				title: truncate(bansos.title, 256),
				url: `https://bansos.dev/list/${bansos.id}`,
				description: `${truncate(bansos.description, maxDescLen)}${ctaText}`,
				color: 5814783,
				author: {
					name: truncate(`🙌 Kontributor: ${bansos.contributor?.name || 'Anonim'}`, 256),
					url: bansos.contributor?.url || 'https://bansos.dev'
				},
				fields: [
					{
						name: '🏢 Provider',
						value: truncate(bansos.provider || '-', 1024),
						inline: false
					},
					{
						name: '🎁 Keuntungan',
						value: truncate(benefitsList, 1024),
						inline: false
					},
					{
						name: '📝 Syarat & Ketentuan',
						value: truncate(requirementsList, 1024),
						inline: false
					},
					{
						name: '🎟️ Kode Promo',
						value: bansos.promoCode ? truncate(`\`${bansos.promoCode}\``, 1024) : '-',
						inline: true
					},
					{
						name: '⏳ Masa Berlaku',
						value: truncate(validity || '-', 1024),
						inline: true
					},
					{
						name: '📌 Status',
						value: `**${bansos.status || 'active'}**`,
						inline: true
					},
					{
						name: '💡 Catatan / Tips',
						value: truncate(bansos.tips || '-', 1024),
						inline: false
					},
					{
						name: '🏷️ Tags',
						value: truncate(tagsList, 1024),
						inline: false
					}
				],
				footer: { text: 'Bansos Info • bansos.dev' },
				timestamp: getTimestamp(bansos.publishedAt)
			}
		]
	};

	try {
		const response = await fetch(WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!response.ok) {
			console.error(
				`Failed to send webhook for ${bansos.title}: ${response.status} ${response.statusText}`
			);
		} else {
			console.log(`Webhook sent for: ${bansos.title}`);
		}
	} catch (err) {
		console.error(`Error sending webhook for ${bansos.title}:`, err);
	}

	// Sleep 2 seconds between webhooks to respect Discord rate limits
	await new Promise((r) => setTimeout(r, 2000));
}
