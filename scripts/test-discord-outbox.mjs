import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/server/discord.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
});
const { discordMessage, discordEnabled, deliverDiscord, dispatchDiscord } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
const sql = new DatabaseSync(':memory:');
for (const name of [
	'0001_dynamic_catalog.sql',
	'0002_unique_submission_slug.sql',
	'0003_ownership_comments.sql',
	'0004_notification_outbox.sql',
	'0005_legacy_comments.sql',
	'0006_admin_notifications.sql'
]) {
	sql.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
}
const db = {
	async batch(statements) {
		sql.exec('BEGIN');
		try {
			const results = [];
			for (const s of statements) results.push(await s.run());
			sql.exec('COMMIT');
			return results;
		} catch (e) {
			sql.exec('ROLLBACK');
			throw e;
		}
	},
	prepare(query) {
		let values = [];
		return {
			bind(...args) {
				values = args;
				return this;
			},
			async run() {
				return { meta: { changes: Number(sql.prepare(query).run(...values).changes) } };
			},
			async first() {
				return sql.prepare(query).get(...values) || null;
			}
		};
	}
};
const config = {
	DISCORD_NOTIFICATIONS_ENABLED: '1',
	DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/123/mock-token'
};
const item = {
	id: 'test',
	title: '@everyone Test',
	description: 'Test only',
	provider: 'Test',
	contributor: { name: 'Test' }
};
const payload = discordMessage(item, 'https://example.com', false);
assert.deepEqual(payload.allowed_mentions, { parse: [] });
assert.equal(discordEnabled({ ...config, BANSOS_ENV: 'staging' }), false);
let calls = 0;
const original = globalThis.fetch;
globalThis.fetch = async (url, options) => {
	calls++;
	assert.equal(new URL(url).searchParams.get('wait'), 'true');
	assert.equal(options.redirect, 'error');
	assert.deepEqual(JSON.parse(options.body).allowed_mentions, { parse: [] });
	return new Response('{}', { status: 200 });
};
try {
	await assert.rejects(deliverDiscord('https://evil.example/webhook', payload));
	assert.equal(calls, 0, 'reject webhook SSRF');
	sql.prepare("INSERT INTO catalog_items(id,payload) VALUES ('test',?)").run(JSON.stringify(item));
	sql
		.prepare(
			"INSERT INTO notification_outbox(event_key,listing_id,payload) VALUES ('test:1','test',?)"
		)
		.run(JSON.stringify(payload));
	await dispatchDiscord(db, 'test:1', { ...config, BANSOS_ENV: 'staging' });
	assert.equal(calls, 0, 'staging never calls real transport');
	await Promise.all([dispatchDiscord(db, 'test:1', config), dispatchDiscord(db, 'test:1', config)]);
	assert.equal(calls, 1, 'one lease for concurrent dispatch');
	assert.equal(
		sql.prepare("SELECT state FROM notification_outbox WHERE event_key='test:1'").get().state,
		'sent'
	);
	await dispatchDiscord(db, 'test:1', config);
	assert.equal(calls, 1, 'sent events not resent');
	sql
		.prepare(
			"INSERT INTO notification_outbox(event_key,listing_id,payload) VALUES ('test:2','test',?)"
		)
		.run(JSON.stringify(payload));
	globalThis.fetch = async () => new Response('{}', { status: 429 });
	await dispatchDiscord(db, 'test:2', config);
	const retry = sql.prepare("SELECT * FROM notification_outbox WHERE event_key='test:2'").get();
	assert.equal(retry.state, 'pending');
	assert.equal(retry.last_error, 'http_429');
	assert.ok(retry.next_attempt > Date.now() / 1000);
	globalThis.fetch = async () => {
		throw new Error('private-token-must-not-be-stored');
	};
	sql.exec("UPDATE notification_outbox SET next_attempt=0 WHERE event_key='test:2'");
	await dispatchDiscord(db, 'test:2', config);
	assert.equal(
		sql.prepare("SELECT last_error FROM notification_outbox WHERE event_key='test:2'").get()
			.last_error,
		'transport_error'
	);
	// Private review notifications are separate, pinned to a private channel and atomic with the submission.
	const encodeModule = (code) =>
		`data:text/javascript;base64,${Buffer.from(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText).toString('base64')}`;
	const moderation = encodeModule(
		(await readFile(new URL('../src/lib/server/moderation.ts', import.meta.url), 'utf8')).replace(
			"'@sveltejs/kit'",
			JSON.stringify(import.meta.resolve('@sveltejs/kit'))
		)
	);
	const helper = encodeModule(
		(await readFile(new URL('../src/lib/server/review-notifications.ts', import.meta.url), 'utf8'))
			.replace("'./moderation'", JSON.stringify(moderation))
			.replace(
				"'./discord'",
				JSON.stringify(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
			)
	);
	const { mutateReview } = await import(helper);
	const privateConfig = {
		...config,
		DISCORD_ADMIN_NOTIFICATIONS_ENABLED: '1',
		DISCORD_ADMIN_WEBHOOK_URL: 'https://discord.com/api/webhooks/456/private-mock',
		DISCORD_ADMIN_CHANNEL_ID: '1517926770651959306'
	};
	const pendingPayload = JSON.stringify({
		id: 'private-review-test',
		title: '@everyone pending review',
		provider: 'Test',
		description: 'private-description-not-for-discord'
	});
	sql.exec(
		"INSERT INTO users(github_id,login,display_name) VALUES (1,'reviewer','Reviewer'),(2,'contributor','Contributor')"
	);
	let privatePosts = 0,
		metadataReads = 0;
	globalThis.fetch = async (url, options) => {
		assert.ok(new URL(url).pathname.includes('/456/'), 'review never uses public webhook');
		if (!options.method) {
			metadataReads++;
			return new Response(JSON.stringify({ channel_id: privateConfig.DISCORD_ADMIN_CHANNEL_ID }));
		}
		privatePosts++;
		const body = JSON.parse(options.body);
		assert.deepEqual(body.allowed_mentions, { parse: [] });
		assert.ok(!options.body.includes('private-description-not-for-discord'));
		assert.match(body.embeds[0].url, /^https:\/\/bansos\.dev\/admin\/#submission-\d+$/);
		return new Response('{}');
	};
	const write = db
		.prepare("INSERT INTO submissions(github_id,payload,state) VALUES (2,?,'pending')")
		.bind(pendingPayload);
	assert.equal(
		await mutateReview(db, write, 2, 'submit', 'private-review-test', 'private-review-test', {
			...privateConfig,
			BANSOS_ENV: 'staging'
		}),
		true
	);
	assert.equal(privatePosts, 0);
	assert.equal(metadataReads, 0, 'staging makes no metadata/POST call');
	const queued = sql.prepare('SELECT * FROM admin_notification_outbox').get();
	assert.equal(queued.attempts, 0);
	await Promise.all([
		dispatchDiscord(db, queued.event_key, privateConfig, true),
		dispatchDiscord(db, queued.event_key, privateConfig, true)
	]);
	assert.equal(privatePosts, 1);
	assert.equal(metadataReads, 1);
	await dispatchDiscord(db, queued.event_key, privateConfig, true);
	assert.equal(privatePosts, 1, 'sent private event is not resent');
	const revision = db
		.prepare('UPDATE submissions SET review_version=review_version+1 WHERE id=?')
		.bind(queued.submission_id);
	assert.equal(
		await mutateReview(db, revision, 2, 'revise', 'private-review-test', 'private-review-test', {
			...privateConfig,
			BANSOS_ENV: 'staging'
		}),
		true
	);
	const next = sql
		.prepare('SELECT * FROM admin_notification_outbox WHERE event_key!=?')
		.get(queued.event_key);
	globalThis.fetch = async (_url, options) => {
		assert.ok(!options.method, 'wrong channel must not POST');
		return new Response(JSON.stringify({ channel_id: '1518282972359430286' }));
	};
	await dispatchDiscord(db, next.event_key, privateConfig, true);
	assert.equal(
		sql.prepare('SELECT state FROM admin_notification_outbox WHERE event_key=?').get(next.event_key)
			.state,
		'pending'
	);
	sql.exec(
		"UPDATE submissions SET state='published'; UPDATE admin_notification_outbox SET next_attempt=0"
	);
	await dispatchDiscord(db, next.event_key, privateConfig, true);
	assert.equal(
		sql.prepare('SELECT state FROM admin_notification_outbox WHERE event_key=?').get(next.event_key)
			.state,
		'cancelled',
		'handled review never sent later'
	);
	const previous = sql.prepare('SELECT count(*) n FROM admin_notification_outbox').get().n;
	assert.equal(
		await mutateReview(
			db,
			db.prepare('UPDATE submissions SET review_version=2 WHERE id=-1'),
			2,
			'revise',
			'none',
			'private-review-test',
			privateConfig
		),
		false
	);
	assert.equal(sql.prepare('SELECT count(*) n FROM admin_notification_outbox').get().n, previous);
	sql.exec(
		"CREATE TRIGGER fail_review BEFORE INSERT ON admin_notification_outbox BEGIN SELECT RAISE(ABORT,'test rollback'); END;"
	);
	const before = sql.prepare('SELECT count(*) n FROM submissions').get().n;
	await assert.rejects(
		mutateReview(
			db,
			db
				.prepare("INSERT INTO submissions(github_id,payload,state) VALUES (2,?,'pending')")
				.bind(JSON.stringify({ id: 'rollback-review', title: 'Test', provider: 'Test' })),
			2,
			'submit',
			'rollback-review',
			'rollback-review',
			privateConfig
		)
	);
	assert.equal(
		sql.prepare('SELECT count(*) n FROM submissions').get().n,
		before,
		'queue failure rolls back submission'
	);
} finally {
	globalThis.fetch = original;
	sql.close();
}
console.log(
	'PASS: six migrations, disabled staging, no ping/SSRF, public/private isolation, pinned channel, atomic review events, cancellation, lease deduplication, retry/backoff and redacted errors. No Discord network requests.'
);
