import { fail, redirect } from '@sveltejs/kit';
import { catalogItems, slugTaken } from '$lib/server/dynamic-catalog';
import { requireDb } from '$lib/server/dynamic-db';
import {
	parseSubmission,
	readSubmissionForm,
	type SubmissionPayload
} from '$lib/server/submission';
import { signedIn, positiveId, mutate, auditStatement } from '$lib/server/moderation';
import {
	changeVisibility,
	managedListing,
	publicPayload,
	type ManagedListing
} from '$lib/server/listing-management';
import { deleteComment, moderationComments, commentSource } from '$lib/server/comments';
import { env } from '$env/dynamic/private';
import {
	discordMessage,
	dispatchDiscord,
	discordEnabled,
	reviewDiscordEnabled
} from '$lib/server/discord';
import type { BansosItem } from '$lib/data/bansos';
import type { Actions, PageServerLoad } from './$types';

interface PendingRow {
	id: number;
	review_version: number;
	github_id: number;
	login: string;
	display_name: string;
	payload: string;
	state: string;
	updated_at: string;
	revision_of: string | null;
	base_version: number | null;
}
export const load: PageServerLoad = async ({ locals, platform, url }) => {
	const actor = signedIn(locals, true);
	const db = requireDb(platform);
	const [pending, users, catalog, hidden, comments, notifications] = await Promise.all([
		db
			.prepare(
				"SELECT s.*, u.login, u.display_name FROM submissions s JOIN users u ON u.github_id = s.github_id WHERE s.state IN ('pending','needs_changes') AND s.withdrawn_at IS NULL ORDER BY s.id ASC LIMIT 100"
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
		catalogItems(db),
		db
			.prepare(
				"SELECT * FROM catalog_items WHERE state = 'archived' ORDER BY updated_at DESC LIMIT 100"
			)
			.all<ManagedListing>(),
		moderationComments(db),
		db
			.prepare(
				`SELECT event_key, listing_id, state, attempts, last_error, created_at, 'approved' AS kind FROM notification_outbox WHERE state != 'sent'
 UNION ALL SELECT n.event_key, json_extract(s.payload,'$.id') AS listing_id, n.state, n.attempts, n.last_error, n.created_at, 'review' AS kind
 FROM admin_notification_outbox n JOIN submissions s ON s.id = n.submission_id
 WHERE n.state NOT IN ('sent','cancelled') ORDER BY created_at LIMIT 100`
			)
			.all<{
				event_key: string;
				listing_id: string;
				state: string;
				attempts: number;
				last_error: string | null;
				kind: 'approved' | 'review';
			}>()
	]);
	const selected = url.searchParams.get('item')
		? await managedListing(db, url.searchParams.get('item')!)
		: null;
	return {
		pending: pending.results.map((row) => ({
			...row,
			payload: JSON.parse(row.payload) as SubmissionPayload
		})),
		users: users.results.map((user) => ({
			...user,
			role: user.github_id === actor.github_id ? 'admin' : 'user'
		})),
		selected: selected ? publicPayload(selected) : null,
		selectedVersion: selected?.version ?? 0,
		selectedOwner: selected?.owner_github_id ?? null,
		selectedHidden: selected ? selected.state !== 'published' : false,
		catalog: catalog.map((item) => ({ id: item.id, title: item.title })),
		hidden: hidden.results.map((row) => ({
			id: row.id,
			title: publicPayload(row).title,
			deleted: !!row.deleted_at
		})),
		comments,
		notifications: notifications.results,
		discordEnabled: discordEnabled({ ...platform?.env, ...env }),
		reviewDiscordEnabled: reviewDiscordEnabled({ ...platform?.env, ...env })
	};
};

export const actions: Actions = {
	retryNotification: async ({ locals, platform, request }) => {
		signedIn(locals, true);
		const form = await readSubmissionForm(request);
		const key = String(form.get('key') || '');
		const kind = String(form.get('kind') || 'approved');
		if (!['approved', 'review'].includes(kind))
			return fail(400, { message: 'Jenis notifikasi tidak valid.' });
		if (!(kind === 'review' ? reviewDiscordEnabled : discordEnabled)({ ...platform?.env, ...env }))
			return fail(400, { message: 'Pengiriman Discord dimatikan pada lingkungan ini.' });
		await dispatchDiscord(
			requireDb(platform),
			key,
			{ ...platform?.env, ...env },
			kind === 'review'
		);
		redirect(303, '/admin/#notifications');
	},
	restoreComment: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		const db = requireDb(platform);
		const form = await readSubmissionForm(request);
		const id = positiveId(form);
		const source = commentSource(form.get('source'));
		const table = source === 'github' ? 'legacy_comments' : 'comments';
		if (
			!(await mutate(
				db,
				db
					.prepare(
						`UPDATE ${table} SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL`
					)
					.bind(id),
				actor.github_id,
				'restore_comment',
				`${source}:comment:${id}`
			))
		)
			return fail(404, { message: 'Komentar tidak ditemukan.' });
		redirect(303, '/admin/#comments');
	},
	editSubmission: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		const db = requireDb(platform);
		let form: FormData;
		let payload: SubmissionPayload;
		try {
			form = await readSubmissionForm(request);
			payload = parseSubmission(form, true);
		} catch {
			return fail(400, { message: 'Periksa isian dan ukuran form.' });
		}
		const id = positiveId(form, 'submissionId');
		const reviewVersion = positiveId(form, 'reviewVersion');
		const row = await db
			.prepare(
				"SELECT payload FROM submissions WHERE id = ? AND review_version = ? AND state IN ('pending','needs_changes') AND withdrawn_at IS NULL"
			)
			.bind(id, reviewVersion)
			.first<{ payload: string }>();
		if (!row) return fail(409, { message: 'Usulan tidak lagi bisa diedit.' });
		if (payload.id !== JSON.parse(row.payload).id)
			return fail(400, { message: 'Slug tidak dapat diganti.' });
		const changed = await mutate(
			db,
			db
				.prepare(
					"UPDATE submissions SET payload = ?, state = 'pending', review_version = review_version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND payload = ? AND review_version = ? AND state IN ('pending','needs_changes') AND withdrawn_at IS NULL"
				)
				.bind(JSON.stringify(payload), id, row.payload, reviewVersion),
			actor.github_id,
			'edit_submission',
			`submission:${id}`
		);
		if (!changed) return fail(409, { message: 'Usulan berubah. Muat ulang.' });
		redirect(303, '/admin/');
	},
	approve: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		const db = requireDb(platform);
		const form = await readSubmissionForm(request);
		const id = positiveId(form);
		const reviewVersion = positiveId(form, 'reviewVersion');
		const row = await db
			.prepare(
				"SELECT s.*, u.login, u.display_name FROM submissions s JOIN users u ON u.github_id = s.github_id WHERE s.id = ? AND s.review_version = ? AND s.state = 'pending' AND s.withdrawn_at IS NULL AND u.banned_at IS NULL"
			)
			.bind(id, reviewVersion)
			.first<PendingRow>();
		if (!row) return fail(409, { message: 'Usulan sudah berubah atau akun diblokir.' });
		const payload = JSON.parse(row.payload) as SubmissionPayload;
		const previous = row.revision_of ? await managedListing(db, row.revision_of) : null;
		if (
			row.revision_of &&
			(!previous ||
				previous.deleted_at ||
				previous.state !== 'published' ||
				previous.version !== row.base_version ||
				previous.owner_github_id !== row.github_id ||
				payload.id !== row.revision_of)
		)
			return fail(409, {
				message:
					'Listing berubah, diarsipkan, atau pemilik berubah. Batalkan lalu ajukan revisi baru.'
			});
		if (!row.revision_of && (await slugTaken(db, payload.id)))
			return fail(409, { message: 'Slug sudah digunakan.' });
		const item: BansosItem = {
			...(previous ? publicPayload(previous) : {}),
			...payload,
			featured: previous ? publicPayload(previous).featured : false,
			publishedAt: previous
				? publicPayload(previous).publishedAt
				: new Date().toISOString().slice(0, 10),
			contributor: previous
				? publicPayload(previous).contributor
				: { name: row.display_name, url: `https://github.com/${row.login}` }
		};
		const serialized = JSON.stringify(item);
		const nextVersion = previous ? previous.version + 1 : 1;
		const eventKey = `${payload.id}:${nextVersion}`;
		const site =
			(env.BANSOS_ENV || platform?.env.BANSOS_ENV) === 'staging'
				? 'https://bansos-dynamic-staging.pages.dev'
				: 'https://bansos.dev';
		const eligible =
			"SELECT 1 FROM submissions s JOIN users u ON u.github_id = s.github_id WHERE s.id = ? AND s.state = 'pending' AND s.withdrawn_at IS NULL AND s.payload = ? AND s.review_version = ? AND u.banned_at IS NULL";
		const write = previous
			? db
					.prepare(
						`UPDATE catalog_items SET payload = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND version = ? AND state = 'published' AND deleted_at IS NULL AND owner_github_id = ? AND EXISTS (${eligible})`
					)
					.bind(
						serialized,
						payload.id,
						previous.version,
						row.github_id,
						id,
						row.payload,
						reviewVersion
					)
			: db
					.prepare(
						`INSERT INTO catalog_items (id, payload, state, submission_id, owner_github_id) SELECT ?, ?, 'published', ?, ? WHERE EXISTS (${eligible}) ON CONFLICT(id) DO NOTHING`
					)
					.bind(payload.id, serialized, id, row.github_id, id, row.payload, reviewVersion);
		const result = await db.batch([
			write,
			db
				.prepare(
					"UPDATE submissions SET state = 'published', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND state = 'pending' AND withdrawn_at IS NULL AND payload = ? AND review_version = ? AND changes() = 1"
				)
				.bind(id, row.payload, reviewVersion),
			auditStatement(db, actor.github_id, row.revision_of ? 'approve_edit' : 'approve', payload.id),
			db
				.prepare(
					'INSERT INTO notification_outbox (event_key, listing_id, payload) SELECT ?, ?, ? WHERE changes() = 1 ON CONFLICT(event_key) DO NOTHING'
				)
				.bind(eventKey, payload.id, JSON.stringify(discordMessage(item, site, !!row.revision_of)))
		]);
		if (result[0]?.meta?.changes !== 1 || result[1]?.meta?.changes !== 1)
			return fail(409, {
				message: `Usulan berubah saat disetujui (versi target ${nextVersion}). Muat ulang.`
			});
		await dispatchDiscord(db, eventKey, { ...platform?.env, ...env }).catch(() => {});
		redirect(303, '/admin/');
	},
	moderate: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		const db = requireDb(platform);
		const form = await readSubmissionForm(request);
		const id = positiveId(form);
		const state = String(form.get('state'));
		const reviewVersion = positiveId(form, 'reviewVersion');
		const note = String(form.get('note') || '').trim();
		if (!['needs_changes', 'rejected'].includes(state) || !note || note.length > 1000)
			return fail(400, { message: 'Keputusan dan catatan (maks. 1000 karakter) diperlukan.' });
		const changed = await mutate(
			db,
			db
				.prepare(
					"UPDATE submissions SET state = ?, admin_note = ?, review_version = review_version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND review_version = ? AND state = 'pending' AND withdrawn_at IS NULL"
				)
				.bind(state, note, id, reviewVersion),
			actor.github_id,
			state,
			`submission:${id}`
		);
		if (!changed) return fail(409, { message: 'Usulan sudah berubah.' });
		redirect(303, '/admin/');
	},
	user: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		const db = requireDb(platform);
		const form = await readSubmissionForm(request);
		const id = positiveId(form, 'githubId');
		const action = String(form.get('action'));
		if (id === actor.github_id || !['ban', 'unban'].includes(action))
			return fail(400, { message: 'Aksi tidak diizinkan.' });
		const changed = await mutate(
			db,
			db
				.prepare(
					`UPDATE users SET banned_at = ${action === 'ban' ? 'CURRENT_TIMESTAMP' : 'NULL'}, updated_at = CURRENT_TIMESTAMP WHERE github_id = ? AND github_id != ?`
				)
				.bind(id, actor.github_id),
			actor.github_id,
			action,
			`user:${id}`
		);
		if (!changed) return fail(404, { message: 'Akun tidak ditemukan.' });
		redirect(303, '/admin/');
	},
	edit: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		const db = requireDb(platform);
		let form: FormData;
		let payload: SubmissionPayload;
		try {
			form = await readSubmissionForm(request);
			payload = parseSubmission(form, true);
		} catch {
			return fail(400, { message: 'Periksa isian dan ukuran form.' });
		}
		if (payload.id !== form.get('originalId'))
			return fail(400, { message: 'Slug tidak dapat diganti.' });
		const previous = await managedListing(db, payload.id);
		if (!previous || previous.state !== 'published' || previous.deleted_at)
			return fail(404, { message: 'Listing tidak aktif. Pulihkan dulu dari arsip.' });
		if (Number(form.get('version')) !== previous.version)
			return fail(409, { message: 'Listing berubah. Muat ulang.' });
		const owner = String(form.get('ownerId') ?? previous.owner_github_id ?? '').trim();
		const ownerId = owner ? Number(owner) : null;
		if (
			ownerId !== null &&
			(!Number.isSafeInteger(ownerId) ||
				!(await db
					.prepare('SELECT github_id FROM users WHERE github_id = ? AND banned_at IS NULL')
					.bind(ownerId)
					.first()))
		)
			return fail(400, {
				message: 'Pemilik harus akun GitHub yang sudah login dan tidak diblokir.'
			});
		const original = publicPayload(previous);
		const featured = form.get('featured') === 'on';
		const item = {
			...original,
			...payload,
			featured,
			featuredSince: featured
				? original.featuredSince || new Date().toISOString().slice(0, 10)
				: undefined
		};
		const changed = await mutate(
			db,
			db
				.prepare(
					`INSERT INTO catalog_items (id, payload, state, owner_github_id) VALUES (?, ?, 'published', ?)
   ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, owner_github_id = excluded.owner_github_id, version = catalog_items.version + 1, updated_at = CURRENT_TIMESTAMP
   WHERE catalog_items.version = ? AND catalog_items.state = 'published' AND catalog_items.deleted_at IS NULL`
				)
				.bind(payload.id, JSON.stringify(item), ownerId, previous.version),
			actor.github_id,
			'edit',
			payload.id
		);
		if (!changed) return fail(409, { message: 'Listing berubah. Muat ulang.' });
		redirect(303, '/admin/');
	},
	archive: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		await changeVisibility(
			requireDb(platform),
			actor,
			String((await readSubmissionForm(request)).get('id') || ''),
			'archive'
		);
		redirect(303, '/admin/');
	},
	delete: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		await changeVisibility(
			requireDb(platform),
			actor,
			String((await readSubmissionForm(request)).get('id') || ''),
			'delete'
		);
		redirect(303, '/admin/');
	},
	restore: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		await changeVisibility(
			requireDb(platform),
			actor,
			String((await readSubmissionForm(request)).get('id') || ''),
			'restore'
		);
		redirect(303, '/admin/');
	},
	deleteComment: async ({ locals, platform, request }) => {
		const actor = signedIn(locals, true);
		const form = await readSubmissionForm(request);
		await deleteComment(
			requireDb(platform),
			actor,
			positiveId(form),
			undefined,
			commentSource(form.get('source'))
		);
		redirect(303, '/admin/#comments');
	}
};
