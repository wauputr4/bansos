import { error, fail, redirect } from '@sveltejs/kit';
import { catalogItem, catalogItems, slugTaken } from '$lib/server/dynamic-catalog';
import { requireDb, type DynamicDb } from '$lib/server/dynamic-db';
import {
	parseSubmission,
	readSubmissionForm,
	type SubmissionPayload
} from '$lib/server/submission';
import type { BansosItem } from '$lib/data/bansos';
import type { Actions, PageServerLoad } from './$types';

interface PendingRow {
	id: number;
	github_id: number;
	login: string;
	payload: string;
	state: string;
	updated_at: string;
}

function admin(locals: App.Locals) {
	if (!locals.user) redirect(303, '/auth/github/');
	if (locals.user.role !== 'admin' || locals.user.banned_at) error(403, 'Akses admin diperlukan.');
	return locals.user;
}

function idFrom(form: FormData, key: string) {
	const id = Number(form.get(key));
	if (!Number.isSafeInteger(id) || id <= 0) error(400, 'ID tidak valid.');
	return id;
}

async function audit(db: DynamicDb, actorId: number, action: string, target: string, detail = '') {
	await db
		.prepare('INSERT INTO audit_log (actor_id, action, target, detail) VALUES (?, ?, ?, ?)')
		.bind(actorId, action, target, detail)
		.run();
}

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	admin(locals);
	const db = requireDb(platform);
	const [pending, users, catalog] = await Promise.all([
		db
			.prepare(
				"SELECT s.id, s.github_id, u.login, s.payload, s.state, s.updated_at FROM submissions s JOIN users u ON u.github_id = s.github_id WHERE s.state IN ('pending', 'needs_changes') ORDER BY s.updated_at ASC LIMIT 100"
			)
			.all<PendingRow>(),
		db
			.prepare(
				'SELECT github_id, login, display_name, role, banned_at FROM users ORDER BY created_at DESC LIMIT 100'
			)
			.all<{
				github_id: number;
				login: string;
				display_name: string;
				role: string;
				banned_at: string | null;
			}>(),
		catalogItems(db)
	]);
	return {
		pending: pending.results.map((row) => ({
			...row,
			payload: JSON.parse(row.payload) as SubmissionPayload
		})),
		users: users.results,
		selected: catalog.find((item) => item.id === url.searchParams.get('item')) || null,
		catalog: catalog.map((item) => ({ id: item.id, title: item.title }))
	};
};

export const actions: Actions = {
	editSubmission: async ({ locals, platform, request }) => {
		const actor = admin(locals);
		const db = requireDb(platform);
		let form: FormData;
		try {
			form = await readSubmissionForm(request);
		} catch (cause) {
			return fail(400, { message: cause instanceof Error ? cause.message : 'Form tidak valid.' });
		}
		const id = idFrom(form, 'submissionId');
		const row = await db
			.prepare(
				"SELECT payload FROM submissions WHERE id = ? AND state IN ('pending', 'needs_changes')"
			)
			.bind(id)
			.first<{ payload: string }>();
		if (!row) return fail(409, { message: 'Usulan tidak lagi bisa diedit.' });
		try {
			const payload = parseSubmission(form);
			if (payload.id !== (JSON.parse(row.payload) as SubmissionPayload).id)
				return fail(400, { message: 'Slug tidak dapat diganti saat review.' });
			const result = await db
				.prepare(
					"UPDATE submissions SET payload = ?, state = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND state IN ('pending', 'needs_changes') AND payload = ?"
				)
				.bind(JSON.stringify(payload), id, row.payload)
				.run();
			if (result.meta?.changes !== 1)
				return fail(409, { message: 'Usulan berubah saat diedit. Muat ulang halaman.' });
			await audit(db, actor.github_id, 'edit_submission', `submission:${id}`);
		} catch (cause) {
			return fail(400, { message: cause instanceof Error ? cause.message : 'Data tidak valid.' });
		}
		redirect(303, '/admin/');
	},
	approve: async ({ locals, platform, request }) => {
		const actor = admin(locals);
		const db = requireDb(platform);
		const id = idFrom(await request.formData(), 'id');
		const row = await db
			.prepare(
				"SELECT s.payload, s.github_id, u.login, u.display_name FROM submissions s JOIN users u ON u.github_id = s.github_id WHERE s.id = ? AND s.state = 'pending' AND u.banned_at IS NULL"
			)
			.bind(id)
			.first<{ payload: string; github_id: number; login: string; display_name: string }>();
		if (!row) return fail(409, { message: 'Usulan sudah berubah atau akun diblokir.' });
		const payload = JSON.parse(row.payload) as SubmissionPayload;
		if (await slugTaken(db, payload.id))
			return fail(409, { message: 'Slug sudah digunakan katalog.' });
		const item: BansosItem = {
			...payload,
			featured: false,
			publishedAt: new Date().toISOString().slice(0, 10),
			contributor: { name: row.display_name, url: `https://github.com/${row.login}` }
		};
		const results = await db.batch([
			db
				.prepare(
					"INSERT INTO catalog_items (id, payload, state, submission_id) SELECT ?, ?, 'published', id FROM submissions WHERE id = ? AND state = 'pending' AND payload = ?"
				)
				.bind(payload.id, JSON.stringify(item), id, row.payload),
			db
				.prepare(
					"UPDATE submissions SET state = 'published', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND state = 'pending' AND payload = ?"
				)
				.bind(id, row.payload)
		]);
		if (results[0]?.meta?.changes !== 1 || results[1]?.meta?.changes !== 1)
			return fail(409, { message: 'Usulan berubah saat disetujui. Muat ulang halaman.' });
		await audit(db, actor.github_id, 'approve', payload.id);
		redirect(303, '/admin/');
	},
	moderate: async ({ locals, platform, request }) => {
		const actor = admin(locals);
		const db = requireDb(platform);
		const form = await request.formData();
		const id = idFrom(form, 'id');
		const state = String(form.get('state'));
		const note = String(form.get('note') || '')
			.trim()
			.slice(0, 1000);
		if (!['needs_changes', 'rejected'].includes(state) || !note)
			return fail(400, { message: 'Pilih keputusan dan isi catatan.' });
		const result = await db
			.prepare(
				"UPDATE submissions SET state = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND state = 'pending'"
			)
			.bind(state, note, id)
			.run();
		if (result.meta?.changes !== 1)
			return fail(409, { message: 'Usulan sudah berubah. Muat ulang halaman.' });
		await audit(db, actor.github_id, state, `submission:${id}`, note);
		redirect(303, '/admin/');
	},
	user: async ({ locals, platform, request }) => {
		const actor = admin(locals);
		const db = requireDb(platform);
		const form = await request.formData();
		const id = idFrom(form, 'githubId');
		if (id === actor.github_id) return fail(400, { message: 'Tidak bisa memblokir akun sendiri.' });
		const action = String(form.get('action'));
		if (!['ban', 'unban'].includes(action)) error(400, 'Aksi tidak valid.');
		const result = await db
			.prepare(
				`UPDATE users SET banned_at = ${action === 'ban' ? 'CURRENT_TIMESTAMP' : 'NULL'}, updated_at = CURRENT_TIMESTAMP WHERE github_id = ? AND role != 'admin'`
			)
			.bind(id)
			.run();
		if (result.meta?.changes !== 1)
			return fail(404, { message: 'Akun tidak ditemukan atau tidak dapat diubah.' });
		await audit(db, actor.github_id, action, `user:${id}`);
		redirect(303, '/admin/');
	},
	edit: async ({ locals, platform, request }) => {
		const actor = admin(locals);
		const db = requireDb(platform);
		let form: FormData;
		try {
			form = await readSubmissionForm(request);
		} catch (cause) {
			return fail(400, { message: cause instanceof Error ? cause.message : 'Form tidak valid.' });
		}
		try {
			const payload = parseSubmission(form, true);
			if (payload.id !== form.get('originalId')) {
				return fail(400, { message: 'Slug tidak dapat diganti saat edit listing.' });
			}
			const original = await catalogItem(db, payload.id);
			if (!original) return fail(404, { message: 'Listing tidak ditemukan.' });
			const item: BansosItem = {
				...original,
				...payload,
				featured: form.get('featured') === 'on',
				featuredSince:
					form.get('featured') === 'on'
						? original.featuredSince || new Date().toISOString().slice(0, 10)
						: undefined
			};
			await db
				.prepare(
					"INSERT INTO catalog_items (id, payload, state) VALUES (?, ?, 'published') ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, state = 'published', updated_at = CURRENT_TIMESTAMP"
				)
				.bind(payload.id, JSON.stringify(item))
				.run();
			await audit(db, actor.github_id, 'edit', payload.id);
		} catch (cause) {
			return fail(400, { message: cause instanceof Error ? cause.message : 'Data tidak valid.' });
		}
		redirect(303, '/admin/');
	},
	archive: async ({ locals, platform, request }) => {
		const actor = admin(locals);
		const db = requireDb(platform);
		const id = String((await request.formData()).get('id') || '').trim();
		const item = await catalogItem(db, id);
		if (!item) return fail(404, { message: 'Listing tidak ditemukan.' });
		await db
			.prepare(
				"INSERT INTO catalog_items (id, payload, state) VALUES (?, ?, 'archived') ON CONFLICT(id) DO UPDATE SET state = 'archived', updated_at = CURRENT_TIMESTAMP"
			)
			.bind(id, JSON.stringify(item))
			.run();
		await audit(db, actor.github_id, 'archive', id);
		redirect(303, '/admin/');
	}
};
