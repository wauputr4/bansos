import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async ({ platform }) => {
	const GITHUB_DISCUSS_TOKEN =
		platform?.env?.GITHUB_DISCUSS_TOKEN || process.env.GITHUB_DISCUSS_TOKEN;
	const GISCUS_REPO =
		platform?.env?.VITE_GISCUS_REPO || process.env.VITE_GISCUS_REPO || 'wauputr4/bansos';

	if (!GITHUB_DISCUSS_TOKEN) {
		// Return empty stats gracefully if token is not configured (local dev / preview)
		return json({});
	}

	const [owner, name] = GISCUS_REPO.split('/');
	if (!owner || !name) {
		return json({ error: 'Invalid repository configuration' }, { status: 400 });
	}

	const query = `
		query GetRepoDiscussions($owner: String!, $name: String!) {
			repository(owner: $owner, name: $name) {
				discussions(first: 1000) {
					nodes {
						title
						upvoteCount
						comments {
							totalCount
						}
						reactions {
							totalCount
						}
					}
				}
			}
		}
	`;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

	try {
		const ghResponse = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: `bearer ${GITHUB_DISCUSS_TOKEN}`,
				'Content-Type': 'application/json',
				'User-Agent': 'bansos-dev-agent'
			},
			body: JSON.stringify({
				query,
				variables: { owner, name }
			}),
			signal: controller.signal
		});
		clearTimeout(timeoutId);

		if (!ghResponse.ok) {
			const errorText = await ghResponse.text();
			return json(
				{ error: `GitHub API error: ${ghResponse.status} ${errorText}` },
				{ status: 500 }
			);
		}

		interface GitHubGraphQLResponse {
			data?: {
				repository?: {
					discussions?: {
						nodes?: Array<{
							title: string;
							upvoteCount?: number;
							comments?: {
								totalCount?: number;
							};
							reactions?: {
								totalCount?: number;
							};
						}>;
					};
				};
			};
		}

		const result = (await ghResponse.json()) as GitHubGraphQLResponse;
		const nodes = result?.data?.repository?.discussions?.nodes || [];

		const stats: Record<string, { comments: number; reactions: number }> = {};
		for (const node of nodes) {
			const title = (node.title || '').toLowerCase();
			// Giscus mapping 'pathname' sets the discussion title to the exact page path (e.g. "/list/item-slug").
			// We extract the item-slug (bansosId) using this regex match.
			const match = title.match(/\/list\/([^/]+)/);
			if (match) {
				const bansosId = match[1];
				// Exclude 'page' as it matches catalog pagination subroutes (e.g. "/list/page/2").
				// Exclude items with dots to avoid matching static assets or extension files.
				if (bansosId && bansosId !== 'page' && !bansosId.includes('.')) {
					const comments = node.comments?.totalCount || 0;
					const reactions = (node.reactions?.totalCount || 0) + (node.upvoteCount || 0);
					stats[bansosId] = { comments, reactions };
				}
			}
		}

		return json(stats, {
			headers: {
				'Cache-Control': 'public, max-age=600, s-maxage=600'
			}
		});
	} catch (err) {
		clearTimeout(timeoutId);
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		return json({ error: errorMessage }, { status: 500 });
	}
};
