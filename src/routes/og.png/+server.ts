import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

export const prerender = true;

let fontDataPromise: Promise<ArrayBuffer> | undefined;

function loadFont(fetch: typeof globalThis.fetch) {
	fontDataPromise ??= fetch('/PlusJakartaSans-Bold.ttf').then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to load OG font: ${response.status}`);
		}
		return response.arrayBuffer();
	});
	return fontDataPromise;
}

export async function GET({ fetch }) {
	const fontData = await loadFont(fetch);

	const template = html(`
		<div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #090a0f; color: #f3f4f6; padding: 80px; justify-content: space-between; box-sizing: border-box; border: 2px solid #1f2937;">
			<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: auto; margin-bottom: auto; width: 100%;">
				<div style="display: flex; flex-direction: column; align-items: center; line-height: 1;">
					<div style="display: flex; font-size: 96px; font-weight: 700; letter-spacing: -0.03em;">
						<span style="color: #ffffff; display: flex;">ban</span><span style="color: #10b981; display: flex;">sos</span>
					</div>
					<div style="display: flex; align-items: center; width: 320px; gap: 16px; margin-top: -10px;">
						<div style="display: flex; flex: 1; height: 6px; background-color: #10b981;"></div>
						<span style="font-size: 32px; font-weight: 700; color: #ffffff; display: flex;">.dev</span>
						<div style="display: flex; flex: 1; height: 6px; background-color: #10b981;"></div>
					</div>
				</div>
				
				<p style="font-size: 32px; color: #9ca3af; margin-top: 50px; text-align: center; max-width: 900px; font-weight: 600; line-height: 1.4; display: flex;">
					Bantuan sosial khusus untuk developer jelata di Indonesia. Kumpulan promo gratisan, cloud credits, domain gratis, dan diskon tools coding paling legit.
				</p>
			</div>

			<div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #1f2937; padding-top: 30px; width: 100%;">
				<span style="font-size: 20px; color: #10b981; font-weight: 700; letter-spacing: 1px; display: flex;">
					100% GRATISAN · NO CLICKBAIT · NO RIBET
				</span>
				<span style="font-size: 20px; color: #9ca3af; font-weight: 600; display: flex;">
					gitlab.com/wauputr4/bansos
				</span>
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
