import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
if (!WEBHOOK_URL) {
	console.log('No DISCORD_WEBHOOK_URL provided. Skipping.');
	process.exit(0);
}

let addedFiles = [];
try {
	addedFiles = execFileSync(
		'git',
		[
			'diff',
			'--diff-filter=A',
			'--name-only',
			'HEAD~1',
			'HEAD',
			'--',
			'src/lib/data/bansos/*/index.json'
		],
		{ encoding: 'utf8' }
	)
		.trim()
		.split('\n')
		.filter(Boolean);
} catch (err) {
	console.error('Could not detect newly added bansos folders:', err.message);
	process.exit(0);
}

const newBansos = addedFiles.map((file) => {
	const bansos = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (!bansos.contributorSlug) return bansos;
	const manifestPath = path.join(
		'src/lib/data/bansos/contributors',
		bansos.contributorSlug,
		'manifest.json'
	);
	if (!fs.existsSync(manifestPath)) return bansos;
	const contributor = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	return {
		...bansos,
		contributor: {
			name: contributor.displayName,
			url: contributor.links?.github || contributor.links?.website || 'https://bansos.dev'
		}
	};
});

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
				color: 1096065,
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
