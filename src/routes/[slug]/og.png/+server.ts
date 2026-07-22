import { Buffer } from 'node:buffer';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { getAllContributors, getContributorBySlug, getContributorInitials } from '$lib/data/bansos';

export const prerender = true;

let fontDataPromise: Promise<ArrayBuffer> | undefined;

function loadFont(fetch: typeof globalThis.fetch) {
	fontDataPromise ??= fetch('/PlusJakartaSans-Bold.ttf').then((response) => {
		if (!response.ok) throw new Error(`Failed to load OG font: ${response.status}`);
		return response.arrayBuffer();
	});
	return fontDataPromise;
}

const escapeHtml = (value: string) =>
	value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function loadAvatar(fetch: typeof globalThis.fetch, avatar?: string) {
	if (!avatar) return '';
	try {
		const response = await fetch(avatar.replace('size=96', 'size=256'), {
			signal: AbortSignal.timeout(5000)
		});
		const contentType = response.headers.get('content-type') || '';
		if (!response.ok || !contentType.startsWith('image/')) return '';
		return `data:${contentType};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;
	} catch {
		return '';
	}
}

export const entries = () => getAllContributors().map(({ login }) => ({ slug: login }));

export async function GET({ params, fetch }) {
	const contributor = getContributorBySlug(params.slug);
	if (!contributor) return new Response('Not Found', { status: 404 });

	const [fontData, avatar] = await Promise.all([
		loadFont(fetch),
		loadAvatar(fetch, contributor.avatar)
	]);
	const name = escapeHtml(contributor.displayName);
	const username = escapeHtml(contributor.login);
	const count = contributor.contributedBansos.length;
	const avatarHtml = avatar
		? `<img src="${avatar}" width="184" height="184" style="width: 184px; height: 184px; border-radius: 92px; object-fit: cover; border: 6px solid #10b981;" />`
		: `<div style="display: flex; width: 184px; height: 184px; border-radius: 92px; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f766e, #7c3aed); border: 6px solid #10b981; color: #ffffff; font-size: 68px; font-weight: 700;">${escapeHtml(getContributorInitials(contributor.displayName))}</div>`;

	const template = html(`
		<div style="display: flex; width: 1200px; height: 630px; padding: 70px; box-sizing: border-box; background: linear-gradient(135deg, #07130f 0%, #090a0f 52%, #111827 100%); color: #ffffff; border: 2px solid #1f2937;">
			<div style="display: flex; flex-direction: column; justify-content: space-between; width: 100%;">
				<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
					<span style="display: flex; color: #10b981; font-size: 23px; font-weight: 700; letter-spacing: 2px;">COMMUNITY CONTRIBUTOR</span>
					<span style="display: flex; color: #9ca3af; font-size: 21px; font-weight: 700;">bansos.dev</span>
				</div>

				<div style="display: flex; align-items: center; gap: 48px; width: 100%;">
					${avatarHtml}
					<div style="display: flex; flex-direction: column; gap: 14px; flex: 1;">
						<h1 style="display: flex; margin: 0; color: #ffffff; font-size: 58px; line-height: 1.1; font-weight: 700;">${name}</h1>
						<span style="display: flex; color: #34d399; font-size: 30px; font-weight: 700;">@${username}</span>
						<span style="display: flex; color: #d1d5db; font-size: 26px; font-weight: 700; margin-top: 8px;">${count} bansos dibagikan</span>
					</div>
				</div>

				<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 2px solid #1f2937; padding-top: 28px;">
					<span style="display: flex; color: #ffffff; font-size: 25px; font-weight: 700;">CEK BANSOSKU →</span>
					<span style="display: flex; color: #9ca3af; font-size: 19px; font-weight: 700;">bansos.dev/${username}</span>
				</div>
			</div>
		</div>
	`);

	const svg = await satori(template, {
		width: 1200,
		height: 630,
		fonts: [{ name: 'Plus Jakarta Sans', data: fontData, weight: 700, style: 'normal' }]
	});
	const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
}
