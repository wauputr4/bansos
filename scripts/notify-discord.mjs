import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DRY_RUN = process.argv.includes('--dry-run');
const requestedFiles = process.argv.slice(2).filter((arg) => arg !== '--dry-run');
if (!WEBHOOK_URL && !DRY_RUN) {
	console.log('No DISCORD_WEBHOOK_URL provided. Skipping.');
	process.exit(0);
}

let addedFiles = requestedFiles;
if (addedFiles.length === 0) {
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

async function deliver(payload, label) {
	if (DRY_RUN) {
		console.log(JSON.stringify(payload, null, 2));
		return;
	}

	try {
		const response = await fetch(WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(20_000)
		});
		if (!response.ok) {
			console.error(
				`Failed to send webhook for ${label}: ${response.status} ${response.statusText}`
			);
			process.exitCode = 1;
		} else {
			console.log(`Webhook sent for: ${label}`);
		}
	} catch (err) {
		console.error(`Error sending webhook for ${label}:`, err);
		process.exitCode = 1;
	}
}

if (newBansos.length > 5) {
	await deliver(
		{
			content: `<@&1518499313947512832> Ada ${newBansos.length} bansos developer baru 🚀`,
			allowed_mentions: { roles: ['1518499313947512832'] },
			embeds: [
				{
					title: `${newBansos.length} bansos baru tersedia`,
					url: 'https://bansos.dev/list',
					description: '**[Lihat daftar terbaru & cara klaim →](https://bansos.dev/list)**',
					color: 1096065,
					footer: { text: 'Bansos Info • bansos.dev' },
					timestamp: new Date().toISOString()
				}
			]
		},
		`${newBansos.length} bansos baru`
	);
}

const individualBansos = newBansos.length > 5 ? [] : newBansos;
for (const [index, bansos] of individualBansos.entries()) {
	let validity = bansos.validity?.description || bansos.validity?.date;
	if (!validity && bansos.validity?.type === 'forever') validity = 'Selamanya';

	const detailUrl = `https://bansos.dev/list/${bansos.id}`;
	const ctaText = `\n\n**[Lihat detail & cara klaim →](${detailUrl})**`;

	const payload = {
		content: '<@&1518499313947512832> Ada bansos developer baru 🚀',
		allowed_mentions: { roles: ['1518499313947512832'] },
		embeds: [
			{
				title: truncate(bansos.title, 256),
				url: detailUrl,
				description: `${truncate(bansos.description, 500)}${ctaText}`,
				color: 1096065,
				author: {
					name: truncate(`🙌 ${bansos.contributor?.name || 'Kontributor komunitas'}`, 256)
				},
				fields: [
					{
						name: '🏢 Provider',
						value: truncate(bansos.provider || '-', 1024),
						inline: true
					},
					{
						name: '⏳ Masa Berlaku',
						value: truncate(validity || '-', 1024),
						inline: true
					}
				],
				footer: { text: 'Bansos Info • bansos.dev' },
				timestamp: getTimestamp(bansos.publishedAt)
			}
		]
	};

	await deliver(payload, bansos.title);

	if (index < individualBansos.length - 1)
		await new Promise((resolve) => setTimeout(resolve, 2000));
}
