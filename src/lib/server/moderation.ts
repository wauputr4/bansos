import { error, redirect } from '@sveltejs/kit';
import type { DbStatement, DynamicDb } from './dynamic-db';

export function signedIn(locals: App.Locals, requireAdmin = false) {
	if (!locals.user) redirect(303, '/auth/github/');
	if (locals.user.banned_at) error(403, 'Akun ini diblokir.');
	if (requireAdmin && locals.user.role !== 'admin') error(403, 'Akses admin diperlukan.');
	return locals.user;
}

export function positiveId(form: FormData, key = 'id') {
	const id = Number(form.get(key));
	if (!Number.isSafeInteger(id) || id <= 0) error(400, 'ID tidak valid.');
	return id;
}

// D1 batch is atomic. Log only when the immediately preceding mutation changed a row.
export function auditStatement(db: DynamicDb, actorId: number, action: string, target: string) {
	return db
		.prepare('INSERT INTO audit_log (actor_id, action, target) SELECT ?, ?, ? WHERE changes() = 1')
		.bind(actorId, action, target);
}

export async function mutate(
	db: DynamicDb,
	statement: DbStatement,
	actorId: number,
	action: string,
	target: string
) {
	const result = await db.batch([statement, auditStatement(db, actorId, action, target)]);
	return result[0]?.meta?.changes === 1;
}

export async function takeRateLimit(
	db: DynamicDb,
	scope: string,
	userId: number,
	maximum: number,
	seconds: number
) {
	const now = Math.floor(Date.now() / 1000);
	const bucket = Math.floor(now / seconds);
	const result = await db
		.prepare(
			'INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 WHERE count < ?'
		)
		.bind(`${scope}:${userId}:${bucket}`, (bucket + 1) * seconds, maximum)
		.run();
	if (result.meta?.changes !== 1) error(429, 'Terlalu banyak permintaan. Coba lagi nanti.');
	await db
		.prepare(
			'DELETE FROM rate_limits WHERE key IN (SELECT key FROM rate_limits WHERE expires_at < ? LIMIT 100)'
		)
		.bind(now - 3600)
		.run();
}
