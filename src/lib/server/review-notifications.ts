import type { DbStatement, DynamicDb } from './dynamic-db';
import { auditStatement } from './moderation';
import { dispatchDiscord, type DiscordConfig } from './discord';

// The submission, audit and private notification event commit atomically.
export async function mutateReview(
	db: DynamicDb,
	statement: DbStatement,
	actorId: number,
	action: string,
	target: string,
	slug: string,
	config: DiscordConfig
) {
	const result = await db.batch([
		statement,
		auditStatement(db, actorId, action, target),
		db
			.prepare(
				`INSERT INTO admin_notification_outbox(event_key,submission_id,payload)
 SELECT 'review:' || s.id || ':' || s.review_version, s.id,
 json_object('title',json_extract(s.payload,'$.title'),'provider',json_extract(s.payload,'$.provider'),'login',u.login)
 FROM submissions s JOIN users u ON u.github_id = s.github_id
 WHERE s.github_id = ? AND json_extract(s.payload,'$.id') = ? AND s.state = 'pending'
 AND s.withdrawn_at IS NULL AND u.banned_at IS NULL AND changes() = 1
 ON CONFLICT(event_key) DO NOTHING`
			)
			.bind(actorId, slug)
	]);
	if (result[0]?.meta?.changes !== 1) return false;
	// Transport/read failure must never turn a committed submission into a reported failure.
	try {
		const row = await db
			.prepare(
				`SELECT 'review:' || id || ':' || review_version AS key FROM submissions
 WHERE github_id = ? AND json_extract(payload,'$.id') = ? AND state = 'pending' AND withdrawn_at IS NULL`
			)
			.bind(actorId, slug)
			.first<{ key: string }>();
		if (row) await dispatchDiscord(db, row.key, config, true);
	} catch {
		/* The durable event remains available for admin retry. No private payload is logged. */
	}
	return true;
}
