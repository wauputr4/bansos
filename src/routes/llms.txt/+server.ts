import { createLlmsResponse } from '$lib/server/llms-content';

export const prerender = true;

export async function GET() {
	return createLlmsResponse();
}
