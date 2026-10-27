import { error, fail, redirect } from '@sveltejs/kit';
import { catalogItem, catalogItems } from '$lib/server/dynamic-catalog';
import { requireDb } from '$lib/server/dynamic-db';
import {
	listingComments,
	deleteComment,
	commentSource,
	listingCommentCount
} from '$lib/server/comments';
import { signedIn, positiveId, mutate, takeRateLimit } from '$lib/server/moderation';
import { readSubmissionForm } from '$lib/server/submission';
import { bansosList, recommendedBansosFor } from '$lib/data/bansos';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const items = await catalogItems(platform?.env.DB);
	const item = items.find((entry) => entry.id === params.id);
	if (!item) error(404, 'Bansos tidak ditemukan.');
	return {
		commentsEnabled: !!platform?.env.DB,
		comments: platform?.env.DB ? await listingComments(platform.env.DB, params.id) : [],
		commentCount: platform?.env.DB ? await listingCommentCount(platform.env.DB, params.id) : 0,
		item,
		recommended: recommendedBansosFor(item, items, 3),
		id: params.id,
		isLegacy: bansosList.some((entry) => entry.id === params.id)
	};
};

export const actions: Actions = {
	comment: async ({ locals, platform, params, request }) => {
		const actor = signedIn(locals);
		const db = requireDb(platform);
		const form = await readSubmissionForm(request);
		const body = String(form.get('body') || '').trim();
		if (!body || body.length > 2000)
			return fail(400, { message: 'Komentar wajib diisi, maksimal 2000 karakter.' });
		if (!(await catalogItem(db, params.id))) error(404, 'Listing tidak ditemukan.');
		await takeRateLimit(db, 'comment', actor.github_id, 5, 60);
		const added = await mutate(
			db,
			db
				.prepare(
					`INSERT INTO comments (listing_id, github_id, body)
		 SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM catalog_items WHERE id = ? AND state = 'archived')
		 AND EXISTS (SELECT 1 FROM users WHERE github_id = ? AND banned_at IS NULL)`
				)
				.bind(params.id, actor.github_id, body, params.id, actor.github_id),
			actor.github_id,
			'comment',
			params.id
		);
		if (!added) return fail(409, { message: 'Listing atau akun berubah. Muat ulang.' });
		redirect(303, `/list/${encodeURIComponent(params.id)}/#comments`);
	},
	deleteComment: async ({ locals, platform, params, request }) => {
		const actor = signedIn(locals);
		const form = await readSubmissionForm(request);
		await deleteComment(
			requireDb(platform),
			actor,
			positiveId(form),
			params.id,
			commentSource(form.get('source'))
		);
		redirect(303, `/list/${encodeURIComponent(params.id)}/#comments`);
	}
};
