import { bansosList, sortBansosByNewest } from '$lib/data/bansos';

const siteUrl = 'https://bansos.dev';

type ValidityInput = {
	type: 'fixed' | 'uncertain' | 'forever' | string;
	date?: string;
	description?: string;
};

function escapeMarkdownLinkText(value: string) {
	return value.replaceAll('[', '\\[').replaceAll(']', '\\]');
}

function compact(value: string) {
	return value.replace(/\s+/g, ' ').trim();
}

function statusLabel(status: string) {
	if (status === 'active') return 'aktif';
	if (status === 'expired') return 'nonaktif';
	if (status === 'upcoming') return 'akan datang';
	return status;
}

function parseValidity(value: unknown): ValidityInput {
	if (typeof value === 'string') {
		return {
			type: 'uncertain',
			description: value
		};
	}

	if (!value || typeof value !== 'object') {
		return { type: 'uncertain' };
	}

	const maybeValidity = value as { type?: unknown; date?: unknown; description?: unknown };

	if (typeof maybeValidity.date === 'string' && maybeValidity.date.trim().length > 0) {
		return {
			type: 'fixed',
			date: maybeValidity.date.trim(),
			description: typeof maybeValidity.description === 'string' ? maybeValidity.description.trim() : undefined
		};
	}

	if (typeof maybeValidity.description === 'string' && maybeValidity.description.trim().length > 0) {
		return {
			type: 'uncertain',
			description: maybeValidity.description.trim()
		};
	}

	if (typeof maybeValidity.type === 'string' && maybeValidity.type.trim().length > 0) {
		return {
			type: maybeValidity.type.trim(),
			description: undefined
		};
	}

	return { type: 'uncertain' };
}

function validityLabel(validity: unknown) {
	const normalized = parseValidity(validity);

	if (normalized.type === 'fixed' && normalized.date) {
		return `berlaku sampai ${normalized.date}`;
	}

	if (normalized.type === 'forever') {
		return 'berlaku tanpa batas khusus';
	}

	if (normalized.description && normalized.description.length > 0) {
		return normalized.description;
	}

	return 'masa berlaku tidak menentu';
}

function pageLink(title: string, path: string, description: string) {
	return `- [${escapeMarkdownLinkText(title)}](${siteUrl}${path}): ${description}`;
}

function externalLink(title: string, url: string, description: string) {
	return `- [${escapeMarkdownLinkText(title)}](${url}): ${description}`;
}

function bansosLink(item: (typeof bansosList)[number]) {
	const tags = item.tags.length ? ` Tags: ${item.tags.join(', ')}.` : '';
	const note = compact(
		`${item.provider}. ${item.description} Status: ${statusLabel(item.status)}, ${validityLabel(item.validity)}.${tags}`
	);

	return pageLink(item.title, `/list/${item.id}/`, note);
}

export function buildLlmsContent() {
	const latestItems = sortBansosByNewest(bansosList);
	const activeItems = latestItems.filter((item) => item.status === 'active');
	const inactiveItems = latestItems.filter((item) => item.status !== 'active');
	const updatedAt = new Date().toISOString().slice(0, 10);

	const content = [
		'# bansos.dev',
		'',
		'> bansos.dev adalah katalog statis berbahasa Indonesia untuk promo, bantuan, kredit gratis, course gratis, dan resource hemat biaya untuk developer.',
		'',
		`File ini digenerate otomatis dari data bansos.dev pada ${updatedAt}. Gunakan halaman detail sebagai sumber ringkas untuk tiap program, dan cek link CTA resmi di halaman tersebut untuk klaim atau verifikasi terbaru.`,
		'',
		'- Situs dibuat sebagai SvelteKit static site dan dideploy ke Cloudflare Pages.',
		'- Data utama berasal dari daftar bansos terstruktur; entry bisa berstatus aktif, nonaktif, atau akan datang.',
		'- Kontribusi publik disarankan lewat CLI `npx bansosdev add` atau lewat Agent Skill `wauputr4/skill-bansos`.',
		'',
		'## Core pages',
		'',
		pageLink('Beranda', '/', 'Ringkasan bansos terbaru dan tagline situs.'),
		pageLink('Daftar bansos', '/list/', 'Halaman katalog lengkap dengan filter tag, status, dan urutan terbaru.'),
		pageLink('Kontribusi', '/contribute/', 'Panduan menambahkan data baru via CLI, issue otomatis, atau Agent Skills.'),
		pageLink('Tentang', '/about/', 'Konteks proyek, tujuan, dan cara bansos.dev memposisikan datanya.'),
		'',
		'## Active bansos',
		'',
		...(activeItems.length ? activeItems.map(bansosLink) : ['- Tidak ada bansos aktif saat ini.']),
		'',
		'## Optional',
		'',
		externalLink('GitHub repository', 'https://github.com/wauputr4/bansos', 'Source code bansos.dev.'),
		externalLink('skill-bansos', 'https://www.skills.sh/wauputr4/skill-bansos', 'Agent Skills untuk membantu AI agent menambah entry bansos.dev atau mengembangkan fitur situs.'),
		...inactiveItems.map(bansosLink)
	].join('\n');

	return `${content}\n`;
}

export function createLlmsResponse() {
	return new Response(buildLlmsContent(), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
