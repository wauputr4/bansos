import { redirect } from '@sveltejs/kit';
import { getAllContributors } from '$lib/data/bansos';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return getAllContributors().map((c) => ({ slug: c.login }));
};

export function load({ params }: { params: Record<string, string> }) {
	throw redirect(301, `/${params.slug}`);
}
