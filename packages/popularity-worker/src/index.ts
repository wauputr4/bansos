export interface Env {
	CF_API_TOKEN: string;
	CF_ZONE_ID: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const corsHeaders = {
			'Access-Control-Allow-Origin': 'https://bansos.dev',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Content-Type': 'application/json'
		};

		// Handle CORS preflight OPTIONS request
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Cache response at the Cloudflare Edge for 10 minutes to prevent hitting API quotas
		const cacheKey = new Request(request.url, request);
		const cache = caches.default;
		const cachedResponse = await cache.match(cacheKey);
		if (cachedResponse) {
			return cachedResponse;
		}

		if (!env.CF_API_TOKEN || !env.CF_ZONE_ID) {
			return new Response(
				JSON.stringify({ error: 'Worker environment variables not configured' }),
				{ status: 500, headers: corsHeaders }
			);
		}

		// Cloudflare GraphQL Analytics Query: Fetch pageviews for request paths starting with /list/ in the last 7 days
		const query = `
			query GetPageViews($zoneTag: String!, $date: Date!) {
				viewer {
					zones(filter: { zoneTag: $zoneTag }) {
						httpRequests1mGroups(
							limit: 100
							filter: { date_geq: $date }
							orderBy: [sum_pageViews_DESC]
						) {
							dimensions {
								clientRequestPath
							}
							sum {
								pageViews
							}
						}
					}
				}
			}
		`;

		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		const dateString = oneWeekAgo.toISOString().split('T')[0];

		try {
			const cfResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.CF_API_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query,
					variables: {
						zoneTag: env.CF_ZONE_ID,
						date: dateString
					}
				})
			});

			if (!cfResponse.ok) {
				const errorText = await cfResponse.text();
				throw new Error(`Cloudflare API error: ${cfResponse.status} ${errorText}`);
			}

			const result = (await cfResponse.json()) as any;
			const rows = result?.data?.viewer?.zones?.[0]?.httpRequests1mGroups || [];

			// Process paths and aggregate pageview counts for each bansos ID
			const popularity: Record<string, number> = {};
			for (const row of rows) {
				const path = (row.dimensions.clientRequestPath || '').toLowerCase();
				const views = row.sum.pageViews || 0;
				// Match paths like /list/rumahweb-free-domain-xyz or /list/rumahweb-free-domain-xyz/
				const match = path.match(/\/list\/([^/]+)/);
				if (match) {
					const bansosId = match[1];
					// Skip pagination and static assets if they accidentally match
					if (bansosId && bansosId !== 'page' && !bansosId.includes('.')) {
						popularity[bansosId] = (popularity[bansosId] || 0) + views;
					}
				}
			}

			const finalResponse = new Response(JSON.stringify(popularity), {
				headers: corsHeaders
			});

			// Cache the response at Cloudflare Edge for 10 minutes (600 seconds)
			finalResponse.headers.append('Cache-Control', 's-maxage=600');
			ctx.waitUntil(cache.put(cacheKey, finalResponse.clone()));

			return finalResponse;
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
				status: 500,
				headers: corsHeaders
			});
		}
	}
};
