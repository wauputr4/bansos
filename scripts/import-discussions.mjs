// One-way, idempotent snapshot. Never mutates GitHub or creates login users/sessions.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const privateDir = path.join(root, '.local-private');
const snapshotPath = path.join(privateDir, 'github-discussions.json');
const sqlPath = path.join(privateDir, 'github-discussions.sql');
const args = process.argv.slice(2);
const repository = 'wauputr4/bansos';
function external(binary, argv) {
	try {
		return execFileSync(binary, argv, {
			cwd: root,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
			maxBuffer: 32 * 1024 * 1024
		});
	} catch {
		throw new Error(
			'External operation failed; credentials, temporary upload URLs and response contents omitted.'
		);
	}
}
function graphql(query, variables = {}) {
	const argv = ['api', 'graphql', '-f', `query=${query}`];
	for (const [key, value] of Object.entries(variables))
		if (value !== null) argv.push('-f', `${key}=${value}`);
	const result = JSON.parse(external('gh', argv));
	assert.ok(!result.errors, 'GitHub export returned GraphQL errors');
	return result.data;
}
const fields =
	'id url body createdAt updatedAt isMinimized minimizedReason author { login ... on User { databaseId } }';
export function visibleComments(comments) {
	const hidden = new Set(comments.filter((c) => c.isMinimized).map((c) => c.id));
	return comments.filter((c) => !hidden.has(c.id) && !hidden.has(c.parentId));
}
function discussionList() {
	const rows = [];
	let cursor = null;
	do {
		const result = graphql(
			`
				query ($cursor: String) {
					repository(owner: "wauputr4", name: "bansos") {
						discussions(first: 50, after: $cursor) {
							nodes {
								id
								title
								url
								body
								createdAt
								updatedAt
								category {
									name
								}
							}
							pageInfo {
								hasNextPage
								endCursor
							}
						}
					}
				}
			`,
			{ cursor }
		).repository.discussions;
		rows.push(...result.nodes);
		cursor = result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null;
	} while (cursor);
	return rows;
}
function connection(id, replies = false) {
	const rows = [];
	let cursor = null;
	do {
		const type = replies ? 'DiscussionComment' : 'Discussion';
		const field = replies ? 'replies' : 'comments';
		const result = graphql(
			`query($id:ID!,$cursor:String) { node(id:$id) { ... on ${type} {
 ${field}(first:100,after:$cursor) { nodes { ${fields} } pageInfo { hasNextPage endCursor } } } } }`,
			{ id, cursor }
		).node[field];
		rows.push(...result.nodes);
		cursor = result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null;
	} while (cursor);
	return rows;
}
// Values are data only; SQL string literals are escaped, including quotes in Markdown.
const literal = (value) => (value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`);
export function snapshotSql(snapshot) {
	assert.equal(snapshot.repository, repository);
	const statements = [];
	for (const discussion of snapshot.discussions) {
		assert.ok(/^https:\/\/github\.com\/wauputr4\/bansos\/discussions\/\d+$/.test(discussion.url));
		statements.push(`INSERT INTO legacy_discussions(source_id,listing_id,source_url,title,body,created_at,source_updated_at)
 VALUES (${[discussion.id, discussion.listingId, discussion.url, discussion.title, discussion.body, discussion.createdAt, discussion.updatedAt].map(literal).join(',')}) ON CONFLICT(source_id) DO NOTHING;`);
		const visible = visibleComments(discussion.comments);
		for (const comment of visible) {
			assert.ok(comment.url.startsWith(discussion.url + '#discussioncomment-'));
			assert.ok(!comment.authorId || Number.isSafeInteger(comment.authorId));
			assert.ok(!comment.parentId || visible.some((c) => c.id === comment.parentId));
			statements.push(`INSERT INTO legacy_comments(source_id,listing_id,discussion_url,source_url,parent_source_id,author_github_id,author_login,body,created_at,source_updated_at)
 VALUES (${[comment.id, discussion.listingId, discussion.url, comment.url, comment.parentId, comment.authorId, comment.login, comment.body, comment.createdAt, comment.updatedAt].map(literal).join(',')}) ON CONFLICT(source_id) DO NOTHING;`);
		}
	}
	return statements.join('\n') + '\n';
}

if (args.includes('--export')) {
	mkdirSync(privateDir, { recursive: true, mode: 0o700 });
	chmodSync(privateDir, 0o700);
	const catalog = JSON.parse(
		readFileSync(path.join(root, 'src/lib/data/bansos/index.json'), 'utf8')
	);
	const ids = new Set(catalog.items.map((item) => item.id));
	const discussions = [],
		skipped = [];
	for (const row of discussionList()) {
		const match = row.title.match(/^\/?list\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
		if (!match || !ids.has(match[1])) {
			skipped.push({ id: row.id, title: row.title });
			continue;
		}
		const comments = [];
		for (const parent of connection(row.id)) {
			const add = (c, parentId = null) =>
				comments.push({
					isMinimized: c.isMinimized,
					id: c.id,
					url: c.url,
					body: c.body,
					createdAt: c.createdAt,
					updatedAt: c.updatedAt,
					parentId,
					authorId: c.author?.databaseId || null,
					login: c.author?.login || 'deleted-user'
				});
			add(parent);
			for (const reply of connection(parent.id, true)) add(reply, parent.id);
		}
		discussions.push({ ...row, listingId: match[1], comments: visibleComments(comments) });
	}
	const snapshot = { repository, exportedAt: new Date().toISOString(), discussions, skipped };
	const json = JSON.stringify(snapshot, null, 2) + '\n';
	writeFileSync(snapshotPath, json, { mode: 0o600 });
	writeFileSync(sqlPath, snapshotSql(snapshot), { mode: 0o600 });
	console.log(
		JSON.stringify({
			discussions: discussions.length,
			comments: discussions.reduce((n, d) => n + d.comments.length, 0),
			replies: discussions.flatMap((d) => d.comments).filter((c) => c.parentId).length,
			skipped: skipped.length,
			sha256: createHash('sha256').update(json).digest('hex')
		})
	);
} else if (args.includes('--apply') || args.includes('--verify')) {
	const target = args[args.indexOf('--target') + 1];
	assert.ok(args.includes('--target') && ['staging', 'production'].includes(target));
	const config = path.join(
		root,
		target === 'staging' ? 'wrangler.staging.jsonc' : 'wrangler.production-migrations.jsonc'
	);
	const cfg = JSON.parse(readFileSync(config, 'utf8'));
	const expected =
		target === 'staging'
			? ['bansos-dynamic-staging', '39db17cd-35c9-4824-b29e-233e281477a2']
			: ['bansos-production', 'c6775352-8ea9-414d-a1d6-61b2a365688b'];
	assert.equal(cfg.d1_databases[0].database_name, expected[0]);
	assert.equal(cfg.d1_databases[0].database_id, expected[1]);
	const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
	assert.ok(readFileSync(sqlPath, 'utf8') === snapshotSql(snapshot), 'snapshot and SQL mismatch');
	if (args.includes('--verify')) {
		const wanted = snapshot.discussions
			.flatMap((d) =>
				d.comments.map((c) => ({
					source_id: c.id,
					listing_id: d.listingId,
					discussion_url: d.url,
					source_url: c.url,
					parent_source_id: c.parentId,
					author_github_id: c.authorId,
					author_login: c.login,
					body: c.body,
					created_at: c.createdAt,
					source_updated_at: c.updatedAt
				}))
			)
			.sort((a, b) => a.source_id.localeCompare(b.source_id));
		const query =
			'SELECT source_id,listing_id,discussion_url,source_url,parent_source_id,author_github_id,author_login,body,created_at,source_updated_at FROM legacy_comments';
		const raw = external(path.join(root, 'node_modules/.bin/wrangler'), [
			'd1',
			'execute',
			expected[0],
			'--remote',
			'--config',
			config,
			'--command',
			query,
			'--json'
		]);
		const rows = JSON.parse(raw.slice(raw.search(/^\[/m)))[0].results.sort((a, b) =>
			a.source_id.localeCompare(b.source_id)
		);
		assert.ok(
			isDeepStrictEqual(rows, wanted),
			'source text/identity/date/thread must match exactly'
		);
		console.log(
			JSON.stringify({
				target,
				verifiedComments: rows.length,
				replies: rows.filter((c) => c.parent_source_id).length,
				exactSnapshotMatch: true
			})
		);
		process.exit(0);
	}
	// Snapshot imports only use INSERT .. DO NOTHING: local moderation wins over reimports.
	const raw = external(path.join(root, 'node_modules/.bin/wrangler'), [
		'd1',
		'execute',
		expected[0],
		'--remote',
		'--config',
		config,
		'--file',
		sqlPath,
		'--json'
	]);
	// File imports print upload progress before JSON, even with --json.
	const start = raw.search(/^\[/m);
	assert.ok(start >= 0, 'Wrangler did not return JSON results');
	const out = JSON.parse(raw.slice(start));
	assert.ok(out.every((r) => r.success));
	console.log(
		JSON.stringify({
			target,
			statements: out.length,
			changes: out.reduce((n, r) => n + (r.meta?.changes || 0), 0)
		})
	);
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
	console.log(
		'Usage: node scripts/import-discussions.mjs --export | --apply|--verify --target staging|production'
	);
}
