import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { snapshotSql, visibleComments } from './import-discussions.mjs';

assert.deepEqual(
	visibleComments([
		{ id: 'hidden-parent', isMinimized: true },
		{ id: 'hidden-parent-reply', parentId: 'hidden-parent' },
		{ id: 'visible-parent' },
		{ id: 'hidden-reply', parentId: 'visible-parent', isMinimized: true },
		{ id: 'visible-reply', parentId: 'visible-parent' }
	]).map((c) => c.id),
	['visible-parent', 'visible-reply']
);

const sql = new DatabaseSync(':memory:');
sql.exec('PRAGMA foreign_keys=ON');
const migrations = new URL('../migrations/', import.meta.url);
for (const file of readdirSync(migrations)
	.filter((p) => p.endsWith('.sql'))
	.sort())
	sql.exec(readFileSync(new URL(file, migrations), 'utf8'));
const db = {
	prepare(query) {
		let values = [];
		return {
			bind(...args) {
				values = args;
				return this;
			},
			async first() {
				return sql.prepare(query).get(...values) || null;
			},
			async all() {
				return { results: sql.prepare(query).all(...values) };
			},
			async run() {
				return { meta: { changes: Number(sql.prepare(query).run(...values).changes) } };
			}
		};
	},
	async batch(statements) {
		sql.exec('BEGIN');
		try {
			const rows = [];
			for (const s of statements) rows.push(await s.run());
			sql.exec('COMMIT');
			return rows;
		} catch (e) {
			sql.exec('ROLLBACK');
			throw e;
		}
	}
};
function moduleUrl(file, replacements = {}) {
	let code = readFileSync(new URL(file, import.meta.url), 'utf8');
	for (const [from, to] of Object.entries(replacements)) code = code.replaceAll(from, to);
	return (
		'data:text/javascript;base64,' +
		Buffer.from(
			ts.transpileModule(code, {
				compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
			}).outputText
		).toString('base64')
	);
}
const kit = import.meta.resolve('@sveltejs/kit');
const moderation = moduleUrl('../src/lib/server/moderation.ts', {
	"'@sveltejs/kit'": JSON.stringify(kit)
});
const api = await import(
	moduleUrl('../src/lib/server/comments.ts', {
		"'@sveltejs/kit'": JSON.stringify(kit),
		"'./moderation'": JSON.stringify(moderation)
	})
);
sql.exec(
	"INSERT INTO users(github_id,login,display_name) VALUES (1,'owner','Owner'),(2,'other','Other')"
);
const url = 'https://github.com/wauputr4/bansos/discussions/1';
const payload = {
	repository: 'wauputr4/bansos',
	discussions: [
		{
			id: 'D_test',
			listingId: 'test',
			url,
			title: 'list/test/',
			body: 'Original thread',
			createdAt: '2026-01-01T00:00:00Z',
			updatedAt: '2026-01-02T00:00:00Z',
			comments: [
				{
					id: 'C_parent',
					url: url + '#discussioncomment-1',
					body: "x'); DROP TABLE users; --\n<script>bad()</script>",
					createdAt: '2026-01-01T01:00:00Z',
					updatedAt: '2026-01-01T01:00:00Z',
					parentId: null,
					authorId: 1,
					login: 'owner'
				},
				{
					id: 'C_reply',
					url: url + '#discussioncomment-2',
					body: 'Reply'.repeat(800),
					createdAt: '2026-01-01T02:00:00Z',
					updatedAt: '2026-01-01T02:00:00Z',
					parentId: 'C_parent',
					authorId: 2,
					login: 'other'
				}
			]
		}
	]
};
const script = snapshotSql(payload);
sql.exec(script);
sql.exec(script);
assert.equal(sql.prepare('SELECT count(*) n FROM legacy_comments').get().n, 2);
assert.equal(sql.prepare('SELECT count(*) n FROM users').get().n, 2, 'import creates no accounts');
sql.prepare("INSERT INTO comments(listing_id,github_id,body) VALUES ('test',1,'Native')").run();
assert.equal((await api.commentStats(db)).test.comments, 3);
assert.equal(await api.listingCommentCount(db, 'test'), 3);
const rows = await api.listingComments(db, 'test');
assert.equal(rows.find((c) => c.source_id === 'C_reply').parent_login, 'owner');
assert.equal(
	rows.find((c) => c.source_id === 'C_reply').body.length,
	4000,
	'legacy body never truncated to native limit'
);
const parent = rows.find((c) => c.source_id === 'C_parent');
const ordinary = { github_id: 2, role: 'user' };
await assert.rejects(
	api.deleteComment(db, ordinary, parent.id, 'test', 'github'),
	(e) => e.status === 404
);
await assert.rejects(
	api.deleteComment(db, { github_id: 1, role: 'user' }, parent.id, 'different', 'github'),
	(e) => e.status === 404
);
await api.deleteComment(db, { github_id: 1, role: 'user' }, parent.id, 'test', 'github');
assert.equal((await api.commentStats(db)).test.comments, 2);
sql.exec(script);
assert.ok(
	sql.prepare("SELECT deleted_at FROM legacy_comments WHERE source_id='C_parent'").get().deleted_at,
	'reimport preserves local moderation'
);
await api.deleteComment(
	db,
	{ github_id: 1, role: 'admin' },
	rows.find((c) => c.source_id === 'C_reply').id,
	undefined,
	'github'
);
assert.equal((await api.moderationComments(db)).length, 3);
assert.equal(await api.listingCommentCount(db, 'test'), 1);
assert.throws(
	() => api.commentSource('legacy_comments;DROP TABLE users'),
	(e) => e.status === 400
);
assert.throws(() => snapshotSql({ ...payload, repository: 'other/repo' }));
assert.throws(() =>
	snapshotSql({
		...payload,
		discussions: [{ ...payload.discussions[0], url: 'https://evil.example/' }]
	})
);
assert.equal(sql.prepare('PRAGMA foreign_key_check').all().length, 0);
sql.close();
console.log(
	'PASS: all migrations, attributed snapshot, replies, long bodies, SQL escaping, idempotency, D1 counts, author/admin IDOR and moderation preservation.'
);
