import { bansosList, normalizeBansosStatuses, type BansosItem } from '$lib/data/bansos';
import type { DynamicDb } from './dynamic-db';

interface CatalogRow {
	id: string;
	payload: string;
	state: 'published' | 'archived';
}

export async function catalogItems(db?: DynamicDb): Promise<BansosItem[]> {
	if (!db) return bansosList;
	const rows = (await db.prepare('SELECT id, payload, state FROM catalog_items').all<CatalogRow>())
		.results;
	const merged = new Map(bansosList.map((item) => [item.id, item]));
	for (const row of rows) {
		if (row.state === 'archived') merged.delete(row.id);
		else {
			try {
				const item = JSON.parse(row.payload) as BansosItem;
				if (
					!item ||
					item.id !== row.id ||
					!['title', 'provider', 'description', 'ctaLink'].every(
						(key) => typeof item[key as keyof BansosItem] === 'string'
					) ||
					![item.benefits, item.requirements, item.tags].every(
						(values) => Array.isArray(values) && values.every((value) => typeof value === 'string')
					) ||
					!item.validity ||
					!['fixed', 'uncertain', 'forever'].includes(item.validity.type) ||
					!['active', 'expired', 'upcoming'].includes(item.status)
				)
					throw new Error('Invalid catalog shape');
				merged.set(row.id, { ...item, activateOnPublishedAt: false });
			} catch {
				// Fail closed: do not resurrect an older repo payload that moderation replaced.
				merged.delete(row.id);
				console.error('Invalid catalog overlay omitted.');
			}
		}
	}
	return normalizeBansosStatuses([...merged.values()]);
}

export async function catalogItem(db: DynamicDb | undefined, id: string) {
	const items = await catalogItems(db);
	return items.find((item) => item.id === id);
}

export async function slugTaken(db: DynamicDb, id: string): Promise<boolean> {
	if (bansosList.some((item) => item.id === id)) return true;
	const row = await db.prepare('SELECT id FROM catalog_items WHERE id = ?').bind(id).first();
	return !!row;
}
