import { error, redirect } from '@sveltejs/kit';
import { getContributorBySlug } from '$lib/data/bansos';
import { catalogItems } from '$lib/server/dynamic-catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const { slug } = params;
	const items = await catalogItems(platform?.env.DB);
	const contributor = getContributorBySlug(slug);
	if (contributor) {
		const ids = new Set(contributor.contributedBansos);
		const github = `https://github.com/${contributor.login}`.toLowerCase();
		const bansos = items.filter(
			(item) =>
				ids.has(item.id) ||
				(typeof item.contributor?.url === 'string' && item.contributor.url.toLowerCase() === github)
		);
		return {
			contributor: { ...contributor, contributedBansos: bansos.map((item) => item.id) },
			bansos,
			slug,
			standaloneProfile: true
		};
	}
	if (items.some((item) => item.id === slug)) redirect(301, `/list/${slug}`);
	error(404, 'Halaman tidak ditemukan');
};
