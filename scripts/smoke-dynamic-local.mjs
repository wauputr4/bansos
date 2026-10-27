import assert from 'node:assert/strict';

const base = process.env.BANSOS_SMOKE_URL || 'http://127.0.0.1:5197';
const slug = `simulasi-lokal-${Date.now()}`;

async function request(path, options = {}) {
	return fetch(new URL(path, base), { redirect: 'manual', ...options });
}

async function login(role) {
	const response = await request(`/auth/demo?as=${role}`);
	assert.equal(response.status, 303, `${role} demo login`);
	const cookie = response.headers.get('set-cookie')?.split(';')[0];
	assert.ok(cookie?.startsWith('bansos_session='));
	return cookie;
}

async function post(path, cookie, fields) {
	if (/^\/admin\/\?\/(approve|moderate|editSubmission)$/.test(path) && !fields.reviewVersion) {
		const page = await (await request('/admin/', { headers: { Cookie: cookie } })).text();
		const id = fields.submissionId || fields.id;
		const card = page
			.split(/<details\b(?=[^>]*\bclass="review-card\b)[^>]*>/)
			.find((b) => b.includes(`name="submissionId" value="${id}"`));
		fields = {
			...fields,
			reviewVersion: card?.match(/name="reviewVersion" value="(\d+)"/)?.[1] || '1'
		};
	}
	return request(path, {
		method: 'POST',
		headers: {
			Cookie: cookie,
			Origin: base,
			Accept: 'text/html',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(fields)
	});
}

const guestContribute = await request('/contribute/');
assert.equal(guestContribute.status, 200, 'contribute page public');
const guestHtml = await guestContribute.text();
assert.match(guestHtml, /Masuk untuk mengirim usulan/);
assert.doesNotMatch(guestHtml, /name="title"/, 'guest cannot see submission fields');
for (const channel of ['Discord', 'Telegram']) {
	const button = [...guestHtml.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].find((match) =>
		match[2].includes(channel)
	);
	assert.ok(button, `${channel} channel visible`);
	assert.match(button[1], /\bdisabled\b/, `${channel} channel disabled`);
}
assert.doesNotMatch(guestHtml, /Git Clone|npx CLI/, 'removed channels are absent');
assert.doesNotMatch(guestHtml, /AI Agent|Submit via Email/, 'old contribution channels removed');
const guestSubmit = await post('/contribute/?/create', '', { title: 'Ditolak' });
assert.equal(guestSubmit.status, 303, 'guest cannot submit');
assert.match(guestSubmit.headers.get('location') || '', /\/auth\/github\?next=contribute/);
const userCookie = await login('user');
const contributorForm = await request('/contribute/', { headers: { Cookie: userCookie } });
assert.equal(contributorForm.status, 200, 'contributor form');
assert.match(await contributorForm.text(), /Kirim untuk review/);
const dashboard = await request('/dashboard/', { headers: { Cookie: userCookie } });
assert.equal(dashboard.status, 200, 'user dashboard');

const payload = {
	id: slug,
	title: 'Simulasi Bansos Lokal',
	provider: 'Simulasi',
	description: 'Uji alur publikasi dinamis tanpa perubahan produksi.',
	benefits: 'Akses uji lokal',
	requirements: 'Akun baru',
	ctaLink: 'https://example.com/claim',
	source: 'https://example.com/source',
	tags: 'AI, Test',
	validityType: 'uncertain',
	validityDescription: 'Simulasi',
	status: 'active'
};
const oversized = await post('/contribute/?/create', userCookie, {
	...payload,
	description: 'x'.repeat(33 * 1024)
});
assert.ok([400, 413].includes(oversized.status), 'oversized form rejected');
const created = await post('/contribute/?/create', userCookie, payload);
assert.equal(created.status, 303, `submit: ${await created.text()}`);
assert.match(created.headers.get('location') || '', /\/dashboard\/\?submitted=1/);
const duplicate = await post('/contribute/?/create', userCookie, payload);
assert.equal(duplicate.status, 400, 'duplicate pending slug rejected');
const pendingDashboard = await request('/dashboard/', { headers: { Cookie: userCookie } });
assert.match(await pendingDashboard.text(), /Simulasi Bansos Lokal/);

const adminCookie = await login('admin');
const admin = await request('/admin/', { headers: { Cookie: adminCookie } });
assert.equal(admin.status, 200, 'admin dashboard');
const html = await admin.text();
const nearby = html
	.split(/<details\b(?=[^>]*\bclass="review-card\b)[^>]*>/)
	.find((block) => block.includes(`value="${slug}"`));
assert.ok(nearby, 'submission appears in review queue');
const submissionId = nearby.match(/name="id" value="(\d+)"/);
assert.ok(submissionId, 'approve action has submission ID');

const requestedChanges = await post('/admin/?/moderate', adminCookie, {
	id: submissionId[1],
	state: 'needs_changes',
	note: 'Perjelas deskripsi uji.'
});
assert.equal(requestedChanges.status, 303, 'admin requests revision');
const revisionDashboard = await request('/dashboard/', { headers: { Cookie: userCookie } });
assert.match(await revisionDashboard.text(), /Perjelas deskripsi uji/);
const revised = await post('/dashboard/?/revise', userCookie, {
	...payload,
	submissionId: submissionId[1],
	description: 'Deskripsi simulasi sudah diperjelas untuk review lokal.'
});
assert.equal(revised.status, 303, 'contributor revision');

const adminEdited = await post('/admin/?/editSubmission', adminCookie, {
	...payload,
	submissionId: submissionId[1],
	title: 'Simulasi Bansos Lokal — Disunting Admin',
	description: 'Deskripsi simulasi sudah diperjelas untuk review lokal.'
});
assert.equal(adminEdited.status, 303, 'admin edits submission');
const reviewAfterEdit = await request('/admin/', { headers: { Cookie: adminCookie } });
assert.match(await reviewAfterEdit.text(), /Simulasi Bansos Lokal — Disunting Admin/);

const approved = await post('/admin/?/approve', adminCookie, { id: submissionId[1] });
assert.equal(approved.status, 303, `approve: ${await approved.text()}`);
const staleRevision = await post('/dashboard/?/revise', userCookie, {
	...payload,
	submissionId: submissionId[1]
});
assert.equal(staleRevision.status, 403, 'published submission cannot be revised');
const staleModeration = await post('/admin/?/moderate', adminCookie, {
	id: submissionId[1],
	state: 'rejected',
	note: 'Late moderation'
});
assert.equal(staleModeration.status, 409, 'published submission cannot be moderated');

const detail = await request(`/list/${slug}/`);
assert.equal(detail.status, 200, 'new detail published without rebuild');
assert.match(await detail.text(), /Simulasi Bansos Lokal — Disunting Admin/);
const listing = await request('/list/');
assert.equal(listing.status, 200);
assert.match(await listing.text(), new RegExp(slug));
const provider = await request('/providers/simulasi/');
assert.equal(provider.status, 200);
assert.match(await provider.text(), new RegExp(slug));
const sitemap = await request('/sitemap.xml');
assert.equal(sitemap.status, 200);
assert.match(await sitemap.text(), new RegExp(slug));

const edited = await post('/admin/?/edit', adminCookie, {
	...payload,
	originalId: slug,
	version: '1',
	title: 'Simulasi Bansos Diedit'
});
assert.equal(edited.status, 303, `edit: ${await edited.text()}`);
const editedDetail = await request(`/list/${slug}/`);
assert.match(await editedDetail.text(), /Simulasi Bansos Diedit/);

const banned = await post('/admin/?/user', adminCookie, { githubId: '2', action: 'ban' });
assert.equal(banned.status, 303);
const blockedDashboard = await request('/dashboard/', { headers: { Cookie: userCookie } });
assert.equal(blockedDashboard.status, 403, 'banned user cannot submit');
const unbanned = await post('/admin/?/user', adminCookie, { githubId: '2', action: 'unban' });
assert.equal(unbanned.status, 303);
const restoredDashboard = await request('/dashboard/', { headers: { Cookie: userCookie } });
assert.equal(restoredDashboard.status, 200, 'unbanned user restored');

const archived = await post('/admin/?/archive', adminCookie, { id: slug });
assert.equal(archived.status, 303, `archive: ${await archived.text()}`);
const gone = await request(`/list/${slug}/`);
assert.equal(gone.status, 404, 'archived listing removed from public catalog');

const logout = await post('/auth/logout', userCookie, {});
assert.equal(logout.status, 303, 'contributor logout');
const signedOutDashboard = await request('/dashboard/', { headers: { Cookie: userCookie } });
assert.equal(signedOutDashboard.status, 303, 'signed-out dashboard requires login');

console.log(
	'PASS: guest gate, disabled channels, demo login, form limit, duplicate slug, submit, request/revise, admin edit/approve, stale actions, catalog/provider/sitemap, published edit, ban/unban, archive, logout.'
);
