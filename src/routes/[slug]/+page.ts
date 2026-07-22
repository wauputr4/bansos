import { redirect, error } from '@sveltejs/kit';
import {
	bansosList,
	getContributorBySlug,
	getBansosById,
	getAllContributors
} from '$lib/data/bansos';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return [
		...getAllContributors().map((contributor) => ({ slug: contributor.login })),
		...bansosList.map((item) => ({ slug: item.id }))
	];
};

export function load({ params }: { params: Record<string, string> }) {
	const { slug } = params;

	// Skip reserved slugs that are handled by explicit routes
	const reserved = [
		'list',
		'about',
		'terms',
		'contribute',
		'providers',
		'contributor',
		'api',
		'og.png',
		'sitemap.xml',
		'schema',
		'index.json',
		'contributors'
	];
	if (reserved.includes(slug)) {
		throw error(404, 'Halaman tidak ditemukan');
	}

	// Check if slug matches a contributor → redirect to canonical contributor page
	const contributor = getContributorBySlug(slug);
	if (contributor) {
		throw redirect(301, `/contributor/${slug}`);
	}

	// Check if slug matches a bansos item → redirect to detail page
	const bansosItem = getBansosById(slug);
	if (bansosItem) {
		throw redirect(301, `/list/${slug}`);
	}

	throw error(404, 'Halaman tidak ditemukan');
}
