import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async ({ platform }) => {
	const CF_API_TOKEN = platform?.env?.CF_API_TOKEN || process.env.CF_API_TOKEN;
	const CF_ZONE_ID = platform?.env?.CF_ZONE_ID || process.env.CF_ZONE_ID;

	if (!CF_API_TOKEN || !CF_ZONE_ID) {
		return json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
	}

	const query = `
		query GetPageViews($zoneTag: String!, $start: DateTime!) {
			viewer {
				zones(filter: { zoneTag: $zoneTag }) {
					httpRequestsAdaptiveGroups(
						limit: 100
						filter: { datetime_geq: $start }
						orderBy: [count_DESC]
					) {
						dimensions {
							clientRequestPath
						}
						count
					}
				}
			}
		}
	`;

	const oneDayAgo = new Date();
	oneDayAgo.setHours(oneDayAgo.getHours() - 23);
	const dateString = oneDayAgo.toISOString();

	try {
		const cfResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${CF_API_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query,
				variables: {
					zoneTag: CF_ZONE_ID,
					start: dateString
				}
			})
		});

		if (!cfResponse.ok) {
			const errorText = await cfResponse.text();
			return json(
				{ error: `Cloudflare API error: ${cfResponse.status} ${errorText}` },
				{ status: 500 }
			);
		}
		interface CloudflareGraphQLResponse {
			errors?: Array<{
				message: string;
			}>;
			data?: {
				viewer?: {
					zones?: Array<{
						httpRequestsAdaptiveGroups?: Array<{
							dimensions: {
								clientRequestPath?: string;
							};
							count?: number;
						}>;
					}>;
				};
			};
		}

		const result = (await cfResponse.json()) as CloudflareGraphQLResponse;

		if (result.errors && result.errors.length > 0) {
			const errorMsg = result.errors.map((e) => e.message).join(', ');
			console.error('Cloudflare GraphQL errors:', errorMsg);
			return json(
				{ error: `Cloudflare GraphQL error: ${errorMsg}` },
				{ status: 500 }
			);
		}

		const rows = result?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];

		const popularity: Record<string, number> = {};
		for (const row of rows) {
			const path = (row.dimensions.clientRequestPath || '').toLowerCase();
			const views = row.count || 0;
			const match = path.match(/\/list\/([^/]+)/);
			if (match) {
				const bansosId = match[1];
				if (bansosId && bansosId !== 'page' && !bansosId.includes('.')) {
					popularity[bansosId] = (popularity[bansosId] || 0) + views;
				}
			}
		}

		return json(popularity, {
			headers: {
				'Cache-Control': 'public, max-age=3600, s-maxage=3600'
			}
		});
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		console.error('Failed to load popularity data:', errorMessage);
		return json({ error: errorMessage }, { status: 500 });
	}
};
