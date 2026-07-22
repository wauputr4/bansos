#!/usr/bin/env node
/**
 * add-bansos.mjs — nambah bansos baru ke folder structure
 *
 * Cara pake:
 *   node scripts/add-bansos.mjs                        # interactive mode
 *   node scripts/add-bansos.mjs --title "Foo Credits"  # CLI mode
 *
 * Auto:
 *   1. Bikin folder bansos/<slug>/
 *   2. Generate index.json
 *   3. Auto-generate README.md
 *   4. Update contributor manifest (kalo contributor baru)
 *   5. Update commit contributors tracking
 *   6. Update index.json ringan
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BANSOS_DIR = join(ROOT, 'src/lib/data/bansos');
const CONTRIBUTORS_DIR = join(BANSOS_DIR, 'contributors');

// ─── Helpers ──────────────────────────────────────────────────────────────

function slugify(text) {
	return text
		.toLowerCase()
		.trim()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function ask(query) {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) =>
		rl.question(query, (a) => {
			rl.close();
			resolve(a.trim());
		})
	);
}

function formatDate(offset = 0) {
	const d = new Date();
	d.setDate(d.getDate() + offset);
	return d.toISOString().split('T')[0];
}

function split(value, separator) {
	return String(value || '')
		.split(separator)
		.map((item) => item.trim())
		.filter(Boolean);
}

function required(args, key) {
	if (!args[key]) throw new Error(`--${key} wajib diisi`);
	return args[key];
}

function validateDate(value, field) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
		throw new Error(`--${field} harus tanggal YYYY-MM-DD yang valid`);
	}
}

function generateReadme(item) {
	const statusEmoji = { active: '✅', expired: '❌', upcoming: '⏳' };
	const emoji = statusEmoji[item.status] || '📦';
	const lines = [
		`# ${emoji} ${item.title}`,
		'',
		`**Provider:** ${item.provider}`,
		'',
		item.description,
		'',
		`> **Status:** ${item.status === 'active' ? 'Aktif' : item.status === 'expired' ? 'Kadaluwarsa' : 'Segera Hadir'}`,
		''
	];

	if (item.validity?.type === 'fixed' && item.validity?.date) {
		lines.push(`⏰ **Berlaku sampai:** ${item.validity.date}`, '');
	} else if (item.validity?.description) {
		lines.push(`⏰ **Info Waktu:** ${item.validity.description}`, '');
	}

	if (item.promoCode) lines.push(`🏷️ **Promo Code:** \`${item.promoCode}\``, '');
	if (item.benefits?.length) {
		lines.push('## Keuntungan', '', ...item.benefits.map((b) => `- ${b}`), '');
	}
	if (item.requirements?.length) {
		lines.push('## Persyaratan', '', ...item.requirements.map((r) => `- ${r}`), '');
	}
	if (item.tips) lines.push('## Tips', '', item.tips, '');
	if (item.ctaLink) lines.push('---', '', `[🔗 Klaim Bansos Ini](${item.ctaLink})`, '');
	if (item.tags?.length) lines.push('', `🏷️ Tags: ${item.tags.join(' · ')}`);
	if (item.contributorSlug) lines.push('', `✏️ Dikontribusikan oleh \`${item.contributorSlug}\``);
	lines.push('', '---', '', '*[bansos.dev](https://bansos.dev) — Open Source Catalog*');
	return lines.join('\n');
}

function getExistingContributors() {
	if (!existsSync(CONTRIBUTORS_DIR)) return [];
	return readdirSync(CONTRIBUTORS_DIR, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => e.name);
}

function getExistingBansosSlugs() {
	return readdirSync(BANSOS_DIR, { withFileTypes: true })
		.filter(
			(e) =>
				e.isDirectory() &&
				!['contributors', 'schema'].includes(e.name) &&
				existsSync(join(BANSOS_DIR, e.name, 'index.json'))
		)
		.map((e) => e.name);
}

// ─── Interactive input ────────────────────────────────────────────────────

async function interactiveInput() {
	console.log('\n📦 Tambah Bansos Baru\n');

	const title = await ask('Judul bansos: ');
	if (!title) {
		console.log('❌ Judul wajib diisi');
		process.exit(1);
	}

	let slug = await ask(`Slug (enter buat auto: "${slugify(title)}"): `);
	if (!slug) slug = slugify(title);

	// Cek duplikat
	const existing = getExistingBansosSlugs();
	if (existing.includes(slug)) {
		console.log(`⚠️  Slug "${slug}" sudah ada!`);
		const confirm = await ask('Tetap pake slug ini? (y/N): ');
		if (confirm.toLowerCase() !== 'y') process.exit(0);
	}

	const provider = await ask('Nama provider: ');
	const description = await ask('Deskripsi singkat: ');

	const ctaLink = await ask('Link CTA/daftar: ');
	const tagsRaw = await ask('Tags (pisah koma, misal: AI Credits, Free Tier): ');
	const tags = tagsRaw
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);

	const status = (await ask('Status (active/expired/upcoming) [active]: ')) || 'active';

	const promoCode = await ask('Promo code (enter skip): ');

	const benefitCount = parseInt((await ask('Jumlah benefit/keuntungan [0]: ')) || '0');
	const benefits = [];
	for (let i = 1; i <= benefitCount; i++) {
		const b = await ask(`  Benefit #${i}: `);
		if (b) benefits.push(b);
	}

	// Contributor
	const existingContribs = getExistingContributors();
	let contributorSlug = '';
	let contributorName = '';
	let contributorUrl = '';
	if (existingContribs.length > 0) {
		console.log('\nContributor yang ada:');
		existingContribs.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
		const ans = await ask('Pilih nomor contributor, atau ketik login baru (enter skip): ');
		const num = parseInt(ans);
		if (ans && !isNaN(num) && num > 0 && num <= existingContribs.length) {
			contributorSlug = existingContribs[num - 1];
		} else if (ans) {
			contributorSlug = slugify(ans);
			contributorName = (await ask('Nama tampilan contributor: ')) || ans;
			contributorUrl = await ask('URL GitHub/website contributor (opsional): ');
		}
	} else {
		const login = await ask('Login contributor baru: ');
		contributorSlug = slugify(login);
		if (contributorSlug) {
			contributorName = (await ask('Nama tampilan contributor: ')) || login;
			contributorUrl = await ask('URL GitHub/website contributor (opsional): ');
		}
	}

	// Featured
	const featuredAns = await ask('Featured? (y/N): ');
	const featured = featuredAns.toLowerCase() === 'y';

	return {
		title,
		slug,
		provider,
		description,
		ctaLink,
		tags,
		status,
		promoCode,
		benefits,
		contributorSlug,
		contributorName,
		contributorUrl,
		featured
	};
}

// ─── Parse CLI args ──────────────────────────────────────────────────────

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith('--')) continue;
		const key = arg.slice(2);
		const next = argv[i + 1];
		if (!next || next.startsWith('--')) {
			args[key] = true;
			continue;
		}
		args[key] = next;
		i++;
	}
	return args;
}

function validateCliInput(args) {
	const slug = args.id || args.slug || slugify(required(args, 'title'));
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new Error('--id/--slug harus berupa slug huruf kecil, angka, dan tanda hubung');
	}

	const validityType = args['validity-type'] || 'uncertain';
	if (!['fixed', 'uncertain', 'forever'].includes(validityType)) {
		throw new Error('--validity-type harus fixed, uncertain, atau forever');
	}
	const validity = { type: validityType };
	if (validityType === 'fixed') {
		validity.date = required(args, 'validity-date');
		validateDate(validity.date, 'validity-date');
	}
	if (args['validity-desc']) validity.description = args['validity-desc'];

	const publishedAt = args['published-at'] || formatDate();
	validateDate(publishedAt, 'published-at');
	const today = formatDate();
	const status =
		args.status ||
		(publishedAt > today
			? 'upcoming'
			: validityType === 'fixed' && validity.date < today
				? 'expired'
				: 'active');
	if (!['active', 'expired', 'upcoming'].includes(status)) {
		throw new Error('--status harus active, expired, atau upcoming');
	}
	const ctaLink = args['cta-link'] || args.ctaLink;
	const parsedCta = new URL(required({ ctaLink }, 'ctaLink'));
	if (!['http:', 'https:'].includes(parsedCta.protocol)) {
		throw new Error('--cta-link harus URL HTTP(S)');
	}

	const contributorName = args['contributor-name'] || args.contributor || '';
	const contributorSlug = slugify(args['contributor-slug'] || contributorName);
	if (!contributorSlug) {
		throw new Error('--contributor-slug wajib diisi untuk atribusi contributor');
	}
	if (!existsSync(join(CONTRIBUTORS_DIR, contributorSlug, 'manifest.json')) && !contributorName) {
		throw new Error('--contributor-name wajib untuk submit pertama contributor');
	}
	return {
		title: required(args, 'title'),
		slug,
		provider: required(args, 'provider'),
		description: required(args, 'description'),
		ctaLink,
		tags: split(required(args, 'tags'), ','),
		status,
		promoCode: args['promo-code'] || args.promoCode || '',
		benefits: split(required(args, 'benefits'), '|'),
		requirements: split(required(args, 'requirements'), '|'),
		validity,
		publishedAt,
		tips: args.tips || '',
		source: args.source || '',
		contributorSlug,
		contributorName,
		contributorUrl: args['contributor-url'] || '',
		featured: args.featured === 'true'
	};
}

// ─── Contributor manifest ────────────────────────────────────────────────

function getOrCreateContributor(slug, displayName = slug, url = '') {
	const dir = join(CONTRIBUTORS_DIR, slug);
	const manifestPath = join(dir, 'manifest.json');

	if (existsSync(manifestPath)) {
		return JSON.parse(readFileSync(manifestPath, 'utf-8'));
	}

	// Create minimal manifest
	const manifest = {
		login: slug,
		displayName,
		bio: '',
		title: '',
		skills: [],
		links: url ? { [url.includes('github.com') ? 'github' : 'website']: url } : {},
		contributedBansos: [],
		hidden: false,
		joinedAt: formatDate()
	};

	mkdirSync(dir, { recursive: true });
	writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
	writeFileSync(
		join(dir, 'README.md'),
		`# ${displayName}\n\nKontributor komunitas [bansos.dev](https://bansos.dev).\n`,
		'utf8'
	);
	console.log(`  👤 Created contributors/${slug}/manifest.json`);
	return manifest;
}

// ─── Main ────────────────────────────────────────────────────────────────

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const isInteractive = !args.title;

	const input = isInteractive ? await interactiveInput() : validateCliInput(args);
	const {
		title,
		slug,
		provider,
		description,
		ctaLink,
		tags,
		status,
		promoCode,
		benefits,
		featured
	} = input;
	let { contributorSlug } = input;

	console.log(`\n🚀 Creating bansos: ${slug}...`);

	// 1. Buat folder
	const itemDir = join(BANSOS_DIR, slug);
	if (existsSync(join(itemDir, 'index.json'))) throw new Error(`Bansos sudah ada: ${slug}`);
	mkdirSync(itemDir, { recursive: true });

	// 2. Handle contributor
	if (contributorSlug) {
		const manifest = getOrCreateContributor(
			contributorSlug,
			input.contributorName,
			input.contributorUrl
		);
		if (!manifest.contributedBansos.includes(slug)) {
			manifest.contributedBansos.push(slug);
			manifest.contributedBansos.sort();
			writeFileSync(
				join(CONTRIBUTORS_DIR, contributorSlug, 'manifest.json'),
				JSON.stringify(manifest, null, '\t') + '\n'
			);
		}
	}

	// 3. Build index.json
	const indexData = {
		id: slug,
		title,
		provider,
		description,
		benefits: benefits || [],
		validity: input.validity || { type: 'uncertain', description: '' },
		requirements: input.requirements || [],
		ctaLink,
		tags: tags || [],
		status,
		featured: !!featured,
		publishedAt: input.publishedAt || formatDate()
	};

	if (promoCode) indexData.promoCode = promoCode;
	if (input.tips) indexData.tips = input.tips;
	if (input.source) indexData.source = input.source;
	if (contributorSlug) indexData.contributorSlug = contributorSlug;

	writeFileSync(join(itemDir, 'index.json'), JSON.stringify(indexData, null, '\t') + '\n');
	console.log(`  ✅ ${slug}/index.json`);

	// 4. Generate README.md
	const readme = generateReadme(indexData);
	writeFileSync(join(itemDir, 'README.md'), readme, 'utf-8');
	console.log(`  📝 ${slug}/README.md (auto-generated)`);

	// 5. Update lightweight index.json
	const indexJsonPath = join(BANSOS_DIR, 'index.json');
	if (existsSync(indexJsonPath)) {
		const indexData = JSON.parse(readFileSync(indexJsonPath, 'utf-8'));
		indexData.total += 1;
		indexData.items.push({
			id: slug,
			title,
			provider,
			status,
			tags,
			featured: !!featured,
			publishedAt: indexData.publishedAt,
			contributorSlug: contributorSlug || ''
		});
		indexData.items.sort((a, b) => a.id.localeCompare(b.id));
		writeFileSync(indexJsonPath, JSON.stringify(indexData, null, '\t') + '\n');
		console.log(`  📋 index.json updated`);
	}

	// 6. Run commit-contributors generator
	try {
		execSync('node scripts/generate-commit-contributors.mjs', { cwd: ROOT, stdio: 'pipe' });
		console.log(`  🔄 Commit contributors regenerated`);
	} catch {
		console.log(`  ⚠️  Commit contributors generator skipped`);
	}

	console.log(`\n✅ Done! Folder: src/lib/data/bansos/${slug}/`);
	console.log(`   • index.json   — data bansos`);
	console.log(`   • README.md    — landing page`);
	if (contributorSlug)
		console.log(`   • Contributor: contributors/${contributorSlug}/manifest.json`);
	console.log();

	if (isInteractive) {
		const open = await ask('Buka folder? (y/N): ');
		if (open.toLowerCase() === 'y') {
			console.log(`\n   cd src/lib/data/bansos/${slug}/`);
		}
	}
}

main().catch((e) => {
	console.error('❌', e.message);
	process.exit(1);
});
