import { bansosList } from '$lib/data/bansos';
import { createLlmsResponse } from '$lib/server/llms-content';

export const prerender = true;

export function entries() {
	return bansosList.map((item) => ({ id: item.id }));
}

export function GET() {
	return createLlmsResponse();
}
