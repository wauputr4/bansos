import { error } from '@sveltejs/kit';
import { getProviderStats } from '$lib/data/bansos';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return getProviderStats().map((provider) => ({ slug: provider.slug }));
};

export function load({ params }) {
	const provider = getProviderStats().find((entry) => entry.slug === params.slug);

	if (!provider) {
		error(404, 'Provider tidak ditemukan');
	}

	return {
		provider,
		slug: params.slug
	};
}
