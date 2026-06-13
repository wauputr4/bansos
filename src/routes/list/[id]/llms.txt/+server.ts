import { createLlmsResponse } from '$lib/server/llms-content';

export const prerender = true;

export function GET() {
	return createLlmsResponse();
}
