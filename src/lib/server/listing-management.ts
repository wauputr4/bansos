import { error } from '@sveltejs/kit';
import { bansosList, type BansosItem } from '$lib/data/bansos';
import type { DynamicDb } from './dynamic-db';
import { auditStatement } from './moderation';
import type { SessionUser } from './session';

export interface ManagedListing {
	id: string;
	payload: string;
	state: string;
	owner_github_id: number | null;
	deleted_at: string | null;
	version: number;
}

export async function managedListing(db: DynamicDb, id: string): Promise<ManagedListing | null> {
	const row = await db
		.prepare('SELECT * FROM catalog_items WHERE id = ?')
		.bind(id)
		.first<ManagedListing>();
	if (row) return row;
	const original = bansosList.find((item) => item.id === id);
	return original
		? {
				id,
				payload: JSON.stringify(original),
				state: 'published',
				owner_github_id: null,
				deleted_at: null,
				version: 0
			}
		: null;
}

export async function changeVisibility(
	db: DynamicDb,
	actor: SessionUser,
	id: string,
	action: 'archive' | 'delete' | 'restore',
	ownerOnly = false
) {
	const row = await managedListing(db, id);
	if (!row || (ownerOnly && (row.owner_github_id !== actor.github_id || row.deleted_at)))
		error(404, 'Listing tidak ditemukan.');
	if (ownerOnly && action !== 'archive') error(403, 'Aksi tidak diizinkan.');
	const state = action === 'restore' ? 'published' : 'archived';
	const deletedAt = action === 'delete' ? new Date().toISOString() : null;
	const statements = [
		db
			.prepare(
				`INSERT INTO catalog_items (id, payload, state, deleted_at, version)
			VALUES (?, ?, ?, ?, 1) ON CONFLICT(id) DO UPDATE SET state = excluded.state,
			deleted_at = excluded.deleted_at, version = catalog_items.version + 1, updated_at = CURRENT_TIMESTAMP
			WHERE catalog_items.version = ?`
			)
			.bind(id, row.payload, state, deletedAt, row.version),
		auditStatement(db, actor.github_id, action, id)
	];
	if (action !== 'restore')
		statements.push(
			db
				.prepare(
					`UPDATE submissions SET withdrawn_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
		 WHERE revision_of = ? AND state IN ('pending', 'needs_changes') AND withdrawn_at IS NULL
		 AND EXISTS (SELECT 1 FROM catalog_items WHERE id = ? AND state = 'archived')`
				)
				.bind(id, id)
		);
	const result = await db.batch(statements);
	if (result[0]?.meta?.changes !== 1) error(409, 'Listing berubah. Muat ulang halaman.');
}

export function publicPayload(row: ManagedListing) {
	return JSON.parse(row.payload) as BansosItem;
}
