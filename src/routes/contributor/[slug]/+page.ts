import { error } from '@sveltejs/kit';
import { getContributorBySlug, getBansosById, getAllContributors } from '$lib/data/bansos';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return getAllContributors().map((c) => ({ slug: c.login }));
};

export function load({ params }: { params: Record<string, string> }) {
	const contributor = getContributorBySlug(params.slug);

	if (!contributor) {
		throw error(404, 'Kontributor tidak ditemukan');
	}

	// Load the bansos items they contributed to
	const bansos = contributor.contributedBansos
		.map((id) => getBansosById(id))
		.filter((b): b is NonNullable<typeof b> => b !== undefined);

	return {
		contributor,
		bansos,
		slug: params.slug
	};
}
