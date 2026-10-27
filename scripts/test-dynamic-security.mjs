import assert from 'node:assert/strict';

const base = process.env.BANSOS_SMOKE_URL || 'http://127.0.0.1:5198';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'local tests only');
const slug = `security-test-${Date.now()}`;
const req = (path, options = {}) => fetch(new URL(path, base), { redirect: 'manual', ...options });
async function login(role) {
	const r = await req(`/auth/demo?as=${role}`);
	assert.equal(r.status, 303);
	return r.headers.get('set-cookie').split(';')[0];
}
async function post(path, cookie, fields, origin = base) {
	if (/^\/admin\/\?\/(approve|moderate|editSubmission)$/.test(path) && !fields.reviewVersion) {
		const page = await (await req('/admin/', { headers: { Cookie: cookie } })).text();
		const id = fields.submissionId || fields.id;
		const card = page
			.split(/<details\b(?=[^>]*\bclass="review-card\b)[^>]*>/)
			.find((b) => b.includes(`name="submissionId" value="${id}"`));
		fields = {
			...fields,
			reviewVersion: card?.match(/name="reviewVersion" value="(\d+)"/)?.[1] || '1'
		};
	}
	return req(path, {
		method: 'POST',
		headers: {
			Cookie: cookie,
			Origin: origin,
			Accept: 'text/html',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(fields)
	});
}
const user = await login('user');
const other = await login('other');
const admin = await login('admin');
const malformed = await req('/admin/?/approve', {
	method: 'POST',
	headers: { Cookie: admin, Origin: base, Accept: 'text/html', 'Content-Type': 'application/json' },
	body: '{}'
});
assert.ok(
	[400, 415].includes(malformed.status),
	'malformed forms are rejected by parser/framework, not a server error'
);
const payload = {
	id: slug,
	title: 'Security test listing',
	provider: 'Local Test',
	description: 'Disposable local security fixture',
	benefits: 'Local test',
	tags: 'Test',
	ctaLink: 'https://example.com',
	source: 'https://example.com/source',
	validityType: 'uncertain',
	status: 'upcoming'
};
const html = async (path, cookie) => (await req(path, { headers: { Cookie: cookie } })).text();
async function pendingId() {
	const page = await html('/admin/', admin);
	const blocks = page.split(/<details\b(?=[^>]*\bclass="review-card\b)[^>]*>/);
	const block = blocks.find((b) => b.includes(`value="${slug}"`));
	assert.ok(block, 'review card exists');
	const id = block.match(/name="submissionId" value="(\d+)"/);
	assert.ok(id, 'submission id');
	return id[1];
}
async function version() {
	const page = await html(`/admin/?item=${slug}`, admin);
	const match = page.match(/name="version" value="(\d+)"/);
	assert.ok(match, 'catalog version');
	return match[1];
}
async function expectPost(status, path, cookie, fields, origin) {
	const response = await post(path, cookie, fields, origin);
	assert.equal(response.status, status, `${path}: ${await response.text()}`);
}
await expectPost(403, '/contribute/?/create', user, payload, 'https://evil.example');
await expectPost(303, '/contribute/?/create', user, payload);
let pending = await pendingId();
await expectPost(403, '/dashboard/?/revise', other, { ...payload, submissionId: pending });
await expectPost(409, '/dashboard/?/withdraw', other, { id: pending });
await expectPost(403, '/admin/?/approve', user, { id: pending });
assert.ok(
	!(await html('/admin/', admin)).includes(`name="key" value="${slug}:1"`),
	'unapproved listing has no notification event'
);
const viewed = (await html('/admin/', admin))
	.split(/<details\b(?=[^>]*\bclass="review-card\b)[^>]*>/)
	.find((b) => b.includes(`name="submissionId" value="${pending}"`))
	.match(/name="reviewVersion" value="(\d+)"/)[1];
await expectPost(303, '/dashboard/?/revise', user, {
	...payload,
	submissionId: pending,
	description: 'Changed after the admin opened review'
});
await expectPost(409, '/admin/?/approve', admin, { id: pending, reviewVersion: viewed });
assert.equal((await req(`/list/${slug}/`)).status, 404, 'stale reviewed version cannot publish');
await expectPost(303, '/admin/?/approve', admin, { id: pending });
assert.ok(
	(await html('/admin/', admin)).includes(`name="key" value="${slug}:1"`),
	'approval creates durable notification event'
);
assert.equal((await req(`/list/${slug}/`)).status, 200);
assert.ok(
	/class="status-badge status-upcoming(?:\s|")/.test(await html(`/list/${slug}/`, '')),
	'publication is not a promotion start date'
);
assert.match(
	(await req(`/list/${slug}/`)).headers.get('cache-control'),
	/no-store/,
	'anonymous D1 responses cannot be cached'
);
await expectPost(404, '/dashboard/?/archive', other, { id: slug });
await expectPost(404, '/dashboard/?/editPublished', other, {
	...payload,
	version: await version()
});

// Owner edit requires review and does not alter the live listing prematurely.
await expectPost(303, '/dashboard/?/editPublished', user, {
	...payload,
	title: 'Reviewed owner revision',
	version: await version()
});
assert.doesNotMatch(await html(`/list/${slug}/`, ''), /<h1[^>]*>Reviewed owner revision/);
pending = await pendingId();
await expectPost(303, '/admin/?/approve', admin, { id: pending });
assert.match(await html(`/list/${slug}/`, ''), /Reviewed owner revision/);
await expectPost(409, '/admin/?/approve', admin, { id: pending });
const notifications = await html('/admin/', admin);
assert.equal(
	notifications.split(`name="key" value="${slug}:1"`).length - 1,
	1,
	'initial notification deduplicated'
);
assert.equal(
	notifications.split(`name="key" value="${slug}:2"`).length - 1,
	1,
	'approved revision gets one separate event'
);

// Stale edits may not overwrite admin changes or revive removed content.
const oldVersion = await version();
await expectPost(303, '/dashboard/?/editPublished', user, { ...payload, version: oldVersion });
pending = await pendingId();
await expectPost(303, '/admin/?/edit', admin, {
	...payload,
	title: 'Admin changed listing',
	originalId: slug,
	version: oldVersion
});
await expectPost(409, '/admin/?/approve', admin, { id: pending });
await expectPost(409, '/admin/?/edit', admin, {
	...payload,
	originalId: slug,
	version: oldVersion
});
await expectPost(303, '/dashboard/?/withdraw', user, { id: pending });
await expectPost(409, '/admin/?/approve', admin, { id: pending });

// Comment identity is derived from the session, not a submitted user ID.
const xss = '<script>alert("xss")</script> security-marker';
await expectPost(303, `/list/${slug}/?/comment`, user, { body: xss, github_id: '1' });
const commented = await html(`/list/${slug}/`, user);
assert.ok(commented.includes('&lt;script'), 'comment HTML is escaped');
assert.ok(!commented.includes('<script>alert("xss")</script>'));
const commentId = commented.match(/name="id" value="(\d+)"/)[1];
assert.match(commented, /@demo-contributor/);
await expectPost(404, `/list/${slug}/?/deleteComment`, other, { id: commentId });
await expectPost(303, `/list/${slug}/?/deleteComment`, user, { id: commentId });
assert.ok(!(await html(`/list/${slug}/`, '')).includes('security-marker'));
await expectPost(303, '/admin/?/restoreComment', admin, { id: commentId });
await expectPost(303, '/admin/?/deleteComment', admin, { id: commentId });
assert.ok(!(await html(`/list/${slug}/`, '')).includes('security-marker'));

await expectPost(303, '/dashboard/?/editPublished', user, { ...payload, version: await version() });
pending = await pendingId();
await expectPost(303, '/dashboard/?/archive', user, { id: slug });
assert.equal((await req(`/list/${slug}/`)).status, 404);
await expectPost(409, '/admin/?/approve', admin, { id: pending });
await expectPost(303, '/admin/?/restore', admin, { id: slug });
assert.equal((await req(`/list/${slug}/`)).status, 200);
await expectPost(303, '/admin/?/delete', admin, { id: slug });
assert.equal((await req(`/list/${slug}/`)).status, 404);
await expectPost(404, '/dashboard/?/editPublished', user, { ...payload, version: await version() });
await expectPost(303, '/admin/?/restore', admin, { id: slug });
assert.equal((await req(`/list/${slug}/`)).status, 200);

// Duplicate and pending limits remain atomic during concurrent submissions.
const duplicatePayload = { ...payload, id: `${slug}-duplicate` };
const duplicate = await Promise.all([
	post('/contribute/?/create', other, duplicatePayload),
	post('/contribute/?/create', other, duplicatePayload)
]);
assert.equal(duplicate.filter((r) => r.status === 303).length, 1);
// Cancel only this test's pending row, retaining unrelated local records.
const ownDashboard = await html('/dashboard/', other);
const cards = ownDashboard.split(/<details class="submission-card[^"]*">/);
const card = cards.find((c) => c.includes(duplicatePayload.id));
const duplicateId = card.match(/name="submissionId" value="(\d+)"/)[1];
await expectPost(303, '/dashboard/?/withdraw', other, { id: duplicateId });

const batch = await Promise.all(
	Array.from({ length: 5 }, (_, i) =>
		post('/contribute/?/create', other, { ...payload, id: `${slug}-capacity-${i}` })
	)
);
assert.equal(batch.filter((r) => r.status === 303).length, 3, 'at most 3 pending during a race');
assert.equal(batch.filter((r) => r.status === 429).length, 2);
const capacityDashboard = await html('/dashboard/', other);
for (const block of capacityDashboard.split(/<details class="submission-card[^"]*">/)) {
	if (!block.includes(`${slug}-capacity-`)) continue;
	const id = block.match(/name="submissionId" value="(\d+)"/);
	if (id) await expectPost(303, '/dashboard/?/withdraw', other, { id: id[1] });
}

// Ban is effective for existing sessions; rate limit prevents comment floods.
await expectPost(303, '/admin/?/user', admin, { githubId: '3', action: 'ban' });
await expectPost(403, `/list/${slug}/?/comment`, other, { body: 'Blocked' });
await expectPost(303, '/admin/?/user', admin, { githubId: '3', action: 'unban' });
const comments = await Promise.all(
	Array.from({ length: 7 }, (_, i) =>
		post(`/list/${slug}/?/comment`, other, { body: `Rate test ${i}` })
	)
);
assert.equal(comments.filter((r) => r.status === 303).length, 5);
assert.equal(comments.filter((r) => r.status === 429).length, 2);
await expectPost(303, '/admin/?/delete', admin, { id: slug });
const authenticated = await req('/dashboard/', { headers: { Cookie: user } });
assert.match(authenticated.headers.get('cache-control'), /no-store/);
console.log(
	'PASS: CSRF, ownership/IDOR, moderated edits, stale version, cancel/archive/delete/restore, authenticated comments/XSS, comment ownership/admin moderation, duplicate race, ban, comment rate limit, private cache.'
);
