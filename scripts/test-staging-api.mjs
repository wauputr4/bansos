// Explicit maintainer authorization required: this creates a ten-minute test session.
// It does not read browser cookies and is NOT proof that every browser dialog works.
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = root + 'wrangler.staging.jsonc';
const cfg = JSON.parse(readFileSync(config, 'utf8'));
assert.equal(cfg.name, 'bansos-dynamic-staging');
assert.equal(cfg.d1_databases[0].database_id, '39db17cd-35c9-4824-b29e-233e281477a2');
assert.equal(cfg.vars.BANSOS_ENV, 'staging');
assert.equal(cfg.vars.DISCORD_NOTIFICATIONS_ENABLED, '0');
assert.ok(process.argv.includes('--staging-only'));
const mode = process.argv.includes('--admin') ? 'admin' : 'contributor';
const base = 'https://bansos-dynamic-staging.pages.dev';
const slug = 'uji-staging-oauth-20261027';
const actor = 103489788;
function sql(query) {
	try {
		const out = execFileSync(
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
			{ cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
		);
		return JSON.parse(out).flatMap((r) => r.results || []);
	} catch {
		throw new Error(
			'Staging D1 query failed; check database availability. SQL and session material omitted.'
		);
	}
}
assert.equal(
	sql(`SELECT login FROM users WHERE github_id=${actor}`)[0]?.login,
	'wauputr4',
	'real OAuth account must already exist'
);
const token = randomBytes(32).toString('hex');
const hash = createHash('sha256').update(token).digest('hex');
const cookie = `bansos_session=${token}`;
async function request(path, fields, guest = false) {
	const options = {
		redirect: 'manual',
		signal: AbortSignal.timeout(15000),
		headers: { Accept: 'text/html', ...(!guest ? { Cookie: cookie } : {}) }
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
async function post(path, fields, expected = 303) {
	if (/^\/admin\/\?\/(approve|moderate|editSubmission)$/.test(path) && !fields.reviewVersion) {
		const id = Number(fields.submissionId || fields.id);
		fields = {
			...fields,
			reviewVersion: String(
				sql(`SELECT review_version FROM submissions WHERE id=${id}`)[0]?.review_version || 1
			)
		};
	}
	const r = await request(path, fields);
	assert.equal(r.status, expected, `${path} expected ${expected}, received ${r.status}`);
	console.log('PASS', r.status, path);
}
const listing = () => sql(`SELECT * FROM catalog_items WHERE id='${slug}'`)[0];
const pending = () =>
	sql(
		`SELECT id FROM submissions WHERE revision_of='${slug}' AND withdrawn_at IS NULL AND state IN ('pending','needs_changes') ORDER BY id DESC`
	);
const comments = () =>
	sql(`SELECT id,github_id,deleted_at FROM comments WHERE listing_id='${slug}' ORDER BY id DESC`);
function fields(title) {
	const row = listing(),
		p = JSON.parse(row.payload);
	return {
		id: slug,
		title,
		provider: p.provider,
		description: p.description,
		benefits: p.benefits.join('\n'),
		requirements: (p.requirements || []).join('\n'),
		tags: p.tags.join(', '),
		ctaLink: p.ctaLink,
		source: p.source,
		validityType: p.validity.type,
		validityDate: p.validity.date || '',
		validityDescription: p.validity.description || '',
		status: p.status,
		version: String(row.version),
		originalId: slug
	};
}
try {
	sql(
		`INSERT INTO sessions(token_hash,github_id,expires_at) VALUES ('${hash}',${actor},datetime('now','+10 minutes'))`
	);
	const access = await request('/admin/');
	assert.equal(access.status, mode === 'admin' ? 200 : 403, 'configured staging role');
	if (mode === 'contributor') {
		for (const p of pending()) await post('/dashboard/?/withdraw', { id: String(p.id) });
		await post(
			'/dashboard/?/editPublished',
			fields('[UJI STAGING] Revisi pemilik menunggu persetujuan')
		);
		const publicPage = await (await request(`/list/${slug}/`, null, true)).text();
		assert.ok(
			!publicPage.includes('Revisi pemilik menunggu persetujuan'),
			'unapproved edit stays private'
		);
		await post(
			'/dashboard/?/editPublished',
			{ ...fields('Stale edit rejected'), version: '0' },
			409
		);
		await post(`/list/${slug}/?/comment`, {
			body: '<script>alert("uji-api-owner")</script> — teks uji',
			github_id: '999999'
		});
		const own = comments()[0];
		assert.equal(own.github_id, actor, 'identity from session, never form');
		const html = await (await request(`/list/${slug}/`, null, true)).text();
		assert.ok(/&lt;script(?:&gt;|>)/.test(html), 'comment opening tag escaped');
		assert.ok(
			!html.includes('<script>alert("uji-api-owner")</script>'),
			'comment never becomes executable markup'
		);
		await post(`/list/${slug}/?/deleteComment`, { id: String(own.id) });
		assert.ok(comments().find((c) => c.id === own.id).deleted_at, 'owner soft-delete persisted');
		await post(`/list/${slug}/?/comment`, {
			body: 'Komentar untuk moderasi admin — data uji staging'
		});
		await post('/dashboard/?/archive', { id: 'codex-relay' }, 404);
		await post('/dashboard/?/archive', { id: slug });
		assert.equal(
			(await request(`/list/${slug}/`, null, true)).status,
			404,
			'owner archive hides listing'
		);
		assert.equal(pending().length, 0, 'archive withdraws pending revisions');
		await post('/admin/?/restore', { id: slug }, 403);
	} else {
		await post('/admin/?/restore', { id: slug });
		const stale = sql(
			`SELECT id FROM submissions WHERE revision_of='${slug}' AND withdrawn_at IS NOT NULL ORDER BY id DESC LIMIT 1`
		)[0];
		if (stale) await post('/admin/?/approve', { id: String(stale.id) }, 409);
		await post(
			'/dashboard/?/editPublished',
			fields('[UJI STAGING] Revisi pemilik diverifikasi admin')
		);
		const revision = pending()[0];
		assert.ok(revision);
		await post('/admin/?/approve', { id: String(revision.id) });
		await post('/admin/?/approve', { id: String(revision.id) }, 409);
		let page = await (await request(`/list/${slug}/`, null, true)).text();
		assert.ok(page.includes('Revisi pemilik diverifikasi admin'), 'reviewed revision public');
		await post('/admin/?/edit', fields('[UJI STAGING] Edit langsung admin terverifikasi'));
		page = await (await request(`/list/${slug}/`, null, true)).text();
		assert.ok(page.includes('Edit langsung admin terverifikasi'));
		for (const c of comments().filter((c) => !c.deleted_at)) {
			await post('/admin/?/deleteComment', { id: String(c.id) });
			await post('/admin/?/restoreComment', { id: String(c.id) });
			await post('/admin/?/deleteComment', { id: String(c.id) });
		}
		await post('/admin/?/archive', { id: slug });
		assert.equal((await request(`/list/${slug}/`, null, true)).status, 404);
		await post('/admin/?/restore', { id: slug });
		assert.equal((await request(`/list/${slug}/`, null, true)).status, 200);
		await post('/admin/?/delete', { id: slug });
		assert.equal((await request(`/list/${slug}/`, null, true)).status, 404);
		assert.ok(listing().deleted_at, 'recoverable deletion persisted');
		await post('/admin/?/restore', { id: slug });
		assert.equal((await request(`/list/${slug}/`, null, true)).status, 200);
		await post('/admin/?/delete', { id: slug });
		assert.equal(
			(await request(`/list/${slug}/`, null, true)).status,
			404,
			'fixture hidden after test'
		);
		const outbox = sql(`SELECT state,attempts FROM notification_outbox WHERE listing_id='${slug}'`);
		assert.ok(
			outbox.length >= 2 && outbox.every((e) => e.state === 'pending' && e.attempts === 0),
			'durable notifications, no actual Discord delivery'
		);
	}
} finally {
	sql(`DELETE FROM sessions WHERE token_hash='${hash}'`);
	assert.equal(sql(`SELECT count(*) AS n FROM sessions WHERE token_hash='${hash}'`)[0].n, 0);
	console.log('PASS: temporary API test session deleted; no browser cookie read or printed.');
}
console.log(`PASS: hosted ${mode} API checks; real GitHub browser login was verified separately.`);
