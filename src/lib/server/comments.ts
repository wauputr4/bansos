import { error } from '@sveltejs/kit';
import type { DynamicDb } from './dynamic-db';
import type { SessionUser } from './session';
import { mutate } from './moderation';

export interface ListingComment {
	id: number;
	github_id: number | null;
	login: string;
	body: string;
	created_at: string;
	source: 'native' | 'github';
	source_id: string | null;
	source_url: string | null;
	parent_source_id: string | null;
	parent_login?: string | null;
}

const commentRows = `SELECT c.id, c.listing_id, c.github_id, u.login, c.body, c.created_at,
 c.deleted_at, 'native' AS source, NULL AS source_id, NULL AS source_url,
 NULL AS parent_source_id, NULL AS parent_login
 FROM comments c JOIN users u ON u.github_id = c.github_id
 UNION ALL
 SELECT c.id, c.listing_id, c.author_github_id AS github_id, c.author_login AS login,
 c.body, c.created_at, c.deleted_at, 'github' AS source, c.source_id, c.source_url,
 c.parent_source_id, p.author_login AS parent_login
 FROM legacy_comments c LEFT JOIN legacy_comments p ON p.source_id = c.parent_source_id`;

export async function commentStats(db: DynamicDb) {
	const { results } = await db
		.prepare(
			`SELECT listing_id, COUNT(*) AS comments FROM (
 SELECT listing_id FROM comments WHERE deleted_at IS NULL
 UNION ALL SELECT listing_id FROM legacy_comments WHERE deleted_at IS NULL
 ) GROUP BY listing_id`
		)
		.all<{ listing_id: string; comments: number }>();
	return Object.fromEntries(
		results.map((row) => [row.listing_id, { comments: row.comments, reactions: 0 }])
	);
}

export async function listingCommentCount(db: DynamicDb, listingId: string) {
	const row = await db
		.prepare(
			`SELECT
 (SELECT COUNT(*) FROM comments WHERE listing_id = ? AND deleted_at IS NULL) +
 (SELECT COUNT(*) FROM legacy_comments WHERE listing_id = ? AND deleted_at IS NULL) AS total`
		)
		.bind(listingId, listingId)
		.first<{ total: number }>();
	return row?.total || 0;
}

export async function moderationComments(db: DynamicDb) {
	return (
		await db
			.prepare(
				`SELECT * FROM (${commentRows}) ORDER BY datetime(created_at) DESC, source, id DESC LIMIT 100`
			)
			.all<ListingComment & { listing_id: string; deleted_at: string | null }>()
	).results;
}

export function commentSource(value: FormDataEntryValue | null) {
	if (value == null || value === 'native') return 'native';
	if (value === 'github') return 'github';
	error(400, 'Sumber komentar tidak valid.');
}

export async function listingComments(db: DynamicDb, listingId: string) {
	return (
		await db
			.prepare(
				`SELECT * FROM (${commentRows}) WHERE listing_id = ? AND deleted_at IS NULL
 ORDER BY datetime(created_at) DESC, source, id DESC LIMIT 50`
			)
			.bind(listingId)
			.all<ListingComment>()
	).results;
}

export async function deleteComment(
	db: DynamicDb,
	actor: SessionUser,
	id: number,
	listingId?: string,
	source: 'native' | 'github' = 'native'
) {
	const table = source === 'github' ? 'legacy_comments' : 'comments';
	const author = source === 'github' ? 'author_github_id' : 'github_id';
	const changed = await mutate(
		db,
		db
			.prepare(
				`UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ?
	 WHERE id = ? AND deleted_at IS NULL AND (? = 1 OR ${author} = ?) AND (? IS NULL OR listing_id = ?)`
			)
			.bind(
				actor.github_id,
				id,
				actor.role === 'admin' ? 1 : 0,
				actor.github_id,
				listingId ?? null,
				listingId ?? null
			),
		actor.github_id,
		'delete_comment',
		`${source}:comment:${id}`
	);
	if (!changed) error(404, 'Komentar tidak ditemukan atau bukan milikmu.');
}
