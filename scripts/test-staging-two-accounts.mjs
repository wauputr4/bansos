// Maintainer-authorized staging test. Uses real OAuth-created identities, never browser cookies.
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setDefaultAutoSelectFamilyAttemptTimeout } from 'node:net';
setDefaultAutoSelectFamilyAttemptTimeout(3000);
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const config = root + 'wrangler.staging.jsonc';
const cfg = JSON.parse(readFileSync(config, 'utf8'));
assert.ok(process.argv.includes('--staging-only'));
assert.equal(cfg.name, 'bansos-dynamic-staging');
assert.equal(cfg.d1_databases[0].database_id, '39db17cd-35c9-4824-b29e-233e281477a2');
assert.equal(cfg.vars.OWNER_GITHUB_ID, '103489788');
assert.equal(cfg.vars.DISCORD_NOTIFICATIONS_ENABLED, '0');
const base = 'https://bansos-dynamic-staging.pages.dev';
const admin = 103489788,
	contributor = 167214031;
function sql(query) {
	for (let attempt = 0; attempt < 3; attempt++)
		try {
			return JSON.parse(
				execFileSync(
					root + 'node_modules/.bin/wrangler',
					[
						'd1',
						'execute',
						'bansos-dynamic-staging',
						'--remote',
						'--config',
						config,
						'--json',
						'--command',
						query
					],
					{
						cwd: root,
						encoding: 'utf8',
						stdio: ['ignore', 'pipe', 'pipe'],
						timeout: 20000,
						env: {
							...process.env,
							NODE_OPTIONS:
								'--dns-result-order=ipv4first --network-family-autoselection-attempt-timeout=3000'
						}
					}
				)
			).flatMap((r) => r.results || []);
		} catch {
			if (attempt === 2) throw new Error('Staging query failed; SQL/session material omitted.');
		}
}
assert.equal(sql(`SELECT login FROM users WHERE github_id=${admin}`)[0]?.login, 'wauputr4');
assert.equal(
	sql(`SELECT login FROM users WHERE github_id=${contributor}`)[0]?.login,
	'penadigital00'
);
const sessions = new Map();
const suffix = Date.now();
const ledger = root + `.local-private/session-ledger-${suffix}.json`;
mkdirSync(root + '.local-private', { recursive: true, mode: 0o700 });
const fixtures = [
	{ id: `uji-dua-akun-admin-${suffix}`, actor: admin },
	{ id: `uji-dua-akun-user-${suffix}`, actor: contributor }
];
async function request(actor, path, fields) {
	const options = {
		redirect: 'manual',
		signal: AbortSignal.timeout(20000),
		headers: {
			Accept: 'text/html',
			...(actor ? { Cookie: `bansos_session=${sessions.get(actor).token}` } : {})
		}
	};
	if (fields)
		Object.assign(options, {
			method: 'POST',
			body: new URLSearchParams(fields),
			headers: {
				...options.headers,
				Origin: base,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
	return fetch(base + path, options);
}
async function expect(actor, path, fields, status = 303) {
	if (
		actor === admin &&
		/^\/admin\/\?\/(approve|moderate|editSubmission)$/.test(path) &&
		!fields.reviewVersion
	) {
		const id = Number(fields.submissionId || fields.id);
		fields = {
			...fields,
			reviewVersion: String(
				sql(`SELECT review_version FROM submissions WHERE id=${id}`)[0]?.review_version || 1
			)
		};
	}
	const r = await request(actor, path, fields);
	if (r.status !== status) {
		const body = await r.text();
		console.log('Unexpected test response', {
			path,
			status: r.status,
			contentType: r.headers.get('content-type'),
			challenge: r.headers.get('cf-mitigated'),
			title: body.match(/<title>([^<]*)<\/title>/)?.[1],
			formAlert: body.match(/role="alert"[^>]*>([^<]*)/)?.[1]
		});
	}
	assert.equal(r.status, status, `${path} status`);
	console.log('PASS', status, path.split('?')[0]);
	return r;
}
function fields(id, title) {
	return {
		id,
		title,
		provider: 'Uji Staging',
		description: 'Fixture uji isolasi dua akun GitHub nyata. Bukan program atau promo sungguhan.',
		benefits: 'Uji akses saja',
		requirements: 'Khusus pengujian staging',
		tags: 'Test,Staging',
		ctaLink: 'https://example.com/staging',
		source: 'https://example.com',
		validityType: 'uncertain',
		validityDate: '',
		validityDescription: 'Fixture staging',
		status: 'active'
	};
}
const item = (id) => sql(`SELECT * FROM catalog_items WHERE id='${id}'`)[0];
async function stats() {
	return (await request(null, '/api/discussion-stats')).json();
}
try {
	for (const actor of [admin, contributor]) {
		const token = randomBytes(32).toString('hex'),
			hash = createHash('sha256').update(token).digest('hex');
		sessions.set(actor, { token, hash });
		writeFileSync(
			ledger,
			JSON.stringify({ fixtures, hashes: [...sessions.values()].map((s) => s.hash) }),
			{ mode: 0o600 }
		);
		sql(
			`INSERT OR IGNORE INTO sessions(token_hash,github_id,expires_at) VALUES ('${hash}',${actor},datetime('now','+10 minutes'))`
		);
	}
	if (process.argv.includes('--cleanup-existing-tests')) {
		for (const p of sql(
			"SELECT id,github_id,json_extract(payload,'$.id') AS slug FROM submissions WHERE state IN ('pending','needs_changes') AND withdrawn_at IS NULL"
		)) {
			if (
				/^uji-dua-akun-(admin|user)-[0-9]+$/.test(p.slug) &&
				[admin, contributor].includes(p.github_id)
			)
				await expect(p.github_id, '/dashboard/?/withdraw', { id: String(p.id) });
		}
	}
	await expect(contributor, '/admin/', null, 403);
	await expect(contributor, '/api/admin-notifications', null, 403);
	await expect(contributor, '/admin/?/approve', { id: '1' }, 403);
	const baseline = (await (await request(admin, '/api/admin-notifications')).json()).pending;
	for (const f of fixtures) {
		await expect(f.actor, '/contribute/?/create', fields(f.id, '[UJI DUA AKUN] ' + f.id));
		const sub = sql(
			`SELECT id,github_id FROM submissions WHERE json_extract(payload,'$.id')='${f.id}'`
		)[0];
		assert.equal(sub.github_id, f.actor);
		const reviewedVersion = sql(`SELECT review_version FROM submissions WHERE id=${sub.id}`)[0]
			.review_version;
		const reviewEvent = sql(
			`SELECT state,attempts,payload FROM admin_notification_outbox WHERE event_key='review:${sub.id}:1'`
		)[0];
		assert.equal(reviewEvent?.state, 'pending', 'review event persisted atomically');
		assert.equal(reviewEvent.attempts, 0, 'staging never starts Discord transport');
		assert.deepEqual(Object.keys(JSON.parse(reviewEvent.payload)).sort(), [
			'login',
			'provider',
			'title'
		]);
		await expect(null, `/list/${f.id}/`, null, 404);
		await expect(contributor, '/admin/?/approve', { id: String(sub.id) }, 403);
		assert.equal(
			(await (await request(admin, '/api/admin-notifications')).json()).pending,
			baseline + 1
		);
		await expect(f.actor, '/dashboard/?/revise', {
			...fields(f.id, '[UJI DUA AKUN] ' + f.id),
			submissionId: String(sub.id),
			description: 'Fixture changed after admin viewed it. Not a real promo.'
		});
		await expect(
			admin,
			'/admin/?/approve',
			{ id: String(sub.id), reviewVersion: String(reviewedVersion) },
			409
		);
		await expect(admin, '/admin/?/approve', { id: String(sub.id) });
		assert.equal(item(f.id).owner_github_id, f.actor);
		await expect(null, `/list/${f.id}/`, null, 200);
	}
	const [a, b] = fixtures;
	assert.ok(
		(await (await request(null, '/wauputr4/')).text()).includes(a.id),
		'profile includes newly approved contribution'
	);
	await expect(contributor, '/dashboard/?/archive', { id: a.id }, 404);
	await expect(
		contributor,
		'/dashboard/?/editPublished',
		{ ...fields(a.id, 'Attempt ownership bypass'), version: '1', originalId: a.id },
		404
	);
	const dashboard = await (await request(contributor, '/dashboard/')).text();
	assert.ok(dashboard.includes(b.id) && !dashboard.includes(a.id), 'dashboard isolates owners');
	await expect(contributor, `/list/${b.id}/?/comment`, {
		body: 'Komentar kontributor — uji dua akun',
		github_id: String(admin)
	});
	await expect(admin, `/list/${b.id}/?/comment`, { body: 'Komentar admin — uji dua akun' });
	const comments = sql(`SELECT id,github_id FROM comments WHERE listing_id='${b.id}' ORDER BY id`);
	assert.equal(comments[0].github_id, contributor, 'forged actor ignored');
	await expect(contributor, `/list/${b.id}/?/deleteComment`, { id: String(comments[1].id) }, 404);
	assert.equal((await stats())[b.id].comments, 2);
	await expect(contributor, `/list/${b.id}/?/deleteComment`, { id: String(comments[0].id) });
	assert.equal((await stats())[b.id].comments, 1);
	await expect(admin, '/admin/?/restoreComment', { id: String(comments[0].id) });
	assert.equal((await stats())[b.id].comments, 2);
	const revisionTitle = '[UJI DUA AKUN] Revisi menunggu persetujuan';
	await expect(contributor, '/dashboard/?/editPublished', {
		...fields(b.id, revisionTitle),
		version: String(item(b.id).version),
		originalId: b.id
	});
	assert.ok(!(await (await request(null, `/list/${b.id}/`)).text()).includes(revisionTitle));
	const revision = sql(
		`SELECT id FROM submissions WHERE revision_of='${b.id}' AND state='pending' AND withdrawn_at IS NULL`
	)[0];
	assert.equal(
		sql(
			`SELECT count(*) n FROM admin_notification_outbox WHERE submission_id=${revision.id} AND attempts=0 AND state='pending'`
		)[0].n,
		1,
		'revision queues its own private event without Discord transport'
	);
	await expect(admin, '/admin/?/approve', { id: String(revision.id) });
	assert.ok((await (await request(null, `/list/${b.id}/`)).text()).includes(revisionTitle));
	const legacy = sql(
		`SELECT id,listing_id FROM legacy_comments WHERE author_github_id=${admin} AND deleted_at IS NULL LIMIT 1`
	)[0];
	if (legacy) {
		await expect(
			contributor,
			`/list/${legacy.listing_id}/?/deleteComment`,
			{ id: String(legacy.id), source: 'github' },
			404
		);
		await expect(admin, '/admin/?/deleteComment', { id: String(legacy.id), source: 'github' });
		await expect(admin, '/admin/?/restoreComment', { id: String(legacy.id), source: 'github' });
	}
	await expect(contributor, '/dashboard/?/archive', { id: b.id });
	await expect(null, `/list/${b.id}/`, null, 404);
	await expect(admin, '/admin/?/restore', { id: b.id });
	await expect(null, `/list/${b.id}/`, null, 200);
	assert.equal((await (await request(admin, '/api/admin-notifications')).json()).pending, baseline);
} finally {
	try {
		for (const f of fixtures) {
			for (const p of sql(
				`SELECT id FROM submissions WHERE json_extract(payload,'$.id')='${f.id}' AND github_id=${f.actor} AND state IN ('pending','needs_changes') AND withdrawn_at IS NULL`
			))
				await expect(f.actor, '/dashboard/?/withdraw', { id: String(p.id) });
			const row = item(f.id);
			if (row && !row.deleted_at) await expect(admin, '/admin/?/delete', { id: f.id });
			if (f.actor === admin)
				assert.ok(
					!(await (await request(null, '/wauputr4/')).text()).includes(f.id),
					'deleted listing is absent from contributor profile'
				);
			for (const c of sql(
				`SELECT id FROM comments WHERE listing_id='${f.id}' AND deleted_at IS NULL`
			))
				await expect(admin, '/admin/?/deleteComment', { id: String(c.id) });
		}
	} finally {
		for (const { hash } of sessions.values()) {
			sql(`DELETE FROM sessions WHERE token_hash='${hash}'`);
			assert.equal(sql(`SELECT count(*) n FROM sessions WHERE token_hash='${hash}'`)[0].n, 0);
		}
		if (sessions.size) rmSync(ledger, { force: true });
		console.log(
			'PASS temporary sessions removed; fixtures recoverably hidden; no browser cookies read.'
		);
	}
}
console.log(
	'PASS two real OAuth identities, admin separation, private dashboard, ownership, moderated revision, comments/counts, archive/restore and durable private events with no staging transport.'
);
