import type { Cookies } from '@sveltejs/kit';
import type { DynamicDb } from './dynamic-db';

export type SessionUser = NonNullable<App.Locals['user']>;

const cookieName = 'bansos_session';
const lifetimeSeconds = 60 * 60 * 24 * 14;

function hex(bytes: Uint8Array) {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hash(token: string) {
	return hex(
		new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))
	);
}

export async function userFromSession(
	db: DynamicDb,
	cookies: Cookies,
	ownerId?: string
): Promise<SessionUser | null> {
	const token = cookies.get(cookieName);
	if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
	const user = await db
		.prepare(
			`SELECT u.github_id, u.login, u.display_name, u.avatar_url, u.role, u.banned_at
			 FROM sessions s JOIN users u ON u.github_id = s.github_id
			 WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP`
		)
		.bind(await hash(token))
		.first<SessionUser>();
	if (!user) return null;
	// A changed OWNER_GITHUB_ID must revoke old admin sessions immediately.
	return { ...user, role: String(user.github_id) === ownerId ? 'admin' : 'user' };
}

export async function startSession(
	db: DynamicDb,
	cookies: Cookies,
	githubId: number,
	secure: boolean
) {
	const token = hex(crypto.getRandomValues(new Uint8Array(32)));
	await db.batch([
		db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP'),
		db
			.prepare(
				"INSERT INTO sessions (token_hash, github_id, expires_at) VALUES (?, ?, datetime('now', '+14 days'))"
			)
			.bind(await hash(token), githubId)
	]);
	cookies.set(cookieName, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		maxAge: lifetimeSeconds
	});
}

export async function endSession(db: DynamicDb | undefined, cookies: Cookies) {
	const token = cookies.get(cookieName);
	if (db && token)
		await db
			.prepare('DELETE FROM sessions WHERE token_hash = ?')
			.bind(await hash(token))
			.run();
	cookies.delete(cookieName, { path: '/' });
}

export async function upsertUser(
	db: DynamicDb,
	profile: { id: number; login: string; name?: string | null; avatar_url?: string | null },
	ownerId?: string
) {
	const role = String(profile.id) === ownerId ? 'admin' : 'user';
	await db
		.prepare(
			`INSERT INTO users (github_id, login, display_name, avatar_url, role)
			 VALUES (?, ?, ?, ?, ?)
			 ON CONFLICT(github_id) DO UPDATE SET
			 login = excluded.login, display_name = excluded.display_name,
			 avatar_url = excluded.avatar_url,
			 role = excluded.role,
			 updated_at = CURRENT_TIMESTAMP`
		)
		.bind(
			profile.id,
			profile.login,
			profile.name || profile.login,
			profile.avatar_url || null,
			role
		)
		.run();
}
