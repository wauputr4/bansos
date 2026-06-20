import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { bansosList, getCommitContributorsForItem } from '$lib/data/bansos';

export const prerender = true;

export const entries = () => {
	return bansosList.map((item) => ({ id: item.id }));
};

export async function GET({ params, fetch }) {
	const { id } = params;
	const item = bansosList.find((b) => b.id === id);

	if (!item) {
		return new Response('Not Found', { status: 404 });
	}

	const fontResponse = await fetch('/PlusJakartaSans-Bold.ttf');
	const fontData = await fontResponse.arrayBuffer();

	const contributors = getCommitContributorsForItem(item.id).slice(0, 5);

	// Escape description to prevent HTML parsing errors
	const escapedTitle = item.title
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	const escapedDescription = item.description
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	const escapedProvider = item.provider
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	// Build contributor list HTML
	const contributorsHtml =
		contributors.length > 0
			? `
			<div style="display: flex; align-items: center;">
				<span style="font-size: 18px; color: #9ca3af; display: flex;">
					Kontributor: ${contributors.map((c) => `@${c.login}`).join(', ')}
				</span>
			</div>
		`
			: `
			<div style="display: flex; align-items: center;">
				<span style="font-size: 18px; color: #9ca3af; display: flex;">Kontributor: @wauputr4</span>
			</div>
		`;

	const template = html(`
		<div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #090a0f; color: #f3f4f6; padding: 70px; justify-content: space-between; box-sizing: border-box; border: 2px solid #1f2937;">
			<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
				<span style="font-size: 24px; font-weight: 700; color: #10b981; letter-spacing: 1px; display: flex;">
					BANSOS DEVELOPER
				</span>
				<span style="font-size: 20px; color: #9ca3af; font-family: monospace; display: flex;">
					bansos.dev
				</span>
			</div>

			<div style="display: flex; flex-direction: column; gap: 20px; margin-top: auto; margin-bottom: auto; width: 100%;">
				<h1 style="font-size: 56px; font-weight: 700; line-height: 1.15; margin: 0; color: #ffffff; display: flex;">
					${escapedTitle}
				</h1>
				<p style="font-size: 26px; color: #9ca3af; line-height: 1.4; margin: 0; max-height: 110px; overflow: hidden; display: flex;">
					${escapedDescription}
				</p>
			</div>

			<div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #1f2937; padding-top: 30px; width: 100%;">
				<div style="display: flex; flex-direction: column; gap: 4px;">
					<span style="font-size: 16px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; display: flex;">Provider</span>
					<span style="font-size: 24px; font-weight: 700; color: #38bdf8; display: flex;">${escapedProvider}</span>
				</div>

				${contributorsHtml}
			</div>
		</div>
	`);

	const svg = await satori(template, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: 'Plus Jakarta Sans',
				data: fontData,
				weight: 700,
				style: 'normal'
			}
		]
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: 1200
		}
	});

	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
}
