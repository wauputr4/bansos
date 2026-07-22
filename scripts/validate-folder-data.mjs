import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderProfileMarkdown } from '../src/lib/utils/profileMarkdown.js';

const markdownCheck = renderProfileMarkdown(
	'## Profil\n\n[GitHub](https://github.com/example)\n\n[Unsafe](https://example.com/"onmouseover=alert(1))\n\n<script>alert(1)</script>'
);
if (
	!markdownCheck.includes('<h2>Profil</h2>') ||
	markdownCheck.includes('<script>') ||
	markdownCheck.includes('href="https://example.com/"onmouseover')
) {
	throw new Error('Contributor Markdown renderer failed its safety check');
}

const root = 'src/lib/data/bansos';
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const folders = readdirSync(root, { withFileTypes: true })
	.filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'index.json')))
	.map((entry) => entry.name)
	.sort();
const items = folders.map((folder) => readJson(join(root, folder, 'index.json')));
const ids = items.map((item) => item.id);

if (new Set(ids).size !== ids.length) throw new Error('Duplicate bansos IDs found');
for (const [index, folder] of folders.entries()) {
	if (ids[index] !== folder)
		throw new Error(`${folder}/index.json has mismatched id: ${ids[index]}`);
	const contributor = items[index].contributorSlug;
	if (contributor && !existsSync(join(root, 'contributors', contributor, 'manifest.json'))) {
		throw new Error(`${folder} references missing contributor: ${contributor}`);
	}
}

const catalog = readJson(join(root, 'index.json'));
const catalogIds = catalog.items.map((item) => item.id).sort();
if (JSON.stringify(catalogIds) !== JSON.stringify(ids)) {
	throw new Error('bansos/index.json is out of sync with listing folders');
}
const catalogById = new Map(catalog.items.map((item) => [item.id, item]));
for (const item of items) {
	const expected = {
		id: item.id,
		title: item.title,
		provider: item.provider,
		status: item.status,
		tags: item.tags,
		featured: item.featured,
		publishedAt: item.publishedAt,
		contributorSlug: item.contributorSlug || ''
	};
	if (JSON.stringify(catalogById.get(item.id)) !== JSON.stringify(expected)) {
		throw new Error(`bansos/index.json has stale summary data for ${item.id}`);
	}
}

const contributorsRoot = join(root, 'contributors');
const itemById = new Map(items.map((item) => [item.id, item]));
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reservedRootSlugs = new Set([
	...readdirSync('src/routes', { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && !entry.name.startsWith('['))
		.map((entry) => entry.name),
	...readdirSync('static')
]);
for (const entry of readdirSync(contributorsRoot, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;
	const manifest = readJson(join(contributorsRoot, entry.name, 'manifest.json'));
	if (!slugPattern.test(entry.name)) throw new Error(`Invalid contributor slug: ${entry.name}`);
	if (manifest.login !== entry.name) {
		throw new Error(`${entry.name}/manifest.json has mismatched login: ${manifest.login}`);
	}
	if (ids.includes(entry.name)) {
		throw new Error(`Contributor slug conflicts with bansos shortlink: ${entry.name}`);
	}
	if (reservedRootSlugs.has(entry.name)) {
		throw new Error(`Contributor slug conflicts with a reserved root URL: ${entry.name}`);
	}
	for (const id of manifest.contributedBansos || []) {
		if (!ids.includes(id)) throw new Error(`${entry.name} references missing bansos: ${id}`);
		if (itemById.get(id)?.contributorSlug !== entry.name) {
			throw new Error(
				`${entry.name} claims ${id}, but listing credits ${itemById.get(id)?.contributorSlug || 'nobody'}`
			);
		}
	}
	for (const url of [manifest.avatar, ...Object.values(manifest.links || {})].filter(Boolean)) {
		const parsed = new URL(url);
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			throw new Error(`${entry.name} contains unsafe URL: ${url}`);
		}
	}
}

for (const id of ids) {
	if (!slugPattern.test(id)) throw new Error(`Invalid bansos slug: ${id}`);
	if (reservedRootSlugs.has(id)) throw new Error(`Bansos slug conflicts with a root URL: ${id}`);
}

for (const item of items) {
	if (!item.contributorSlug) throw new Error(`${item.id} has no contributorSlug`);
	const manifest = readJson(join(contributorsRoot, item.contributorSlug, 'manifest.json'));
	if (!(manifest.contributedBansos || []).includes(item.id)) {
		throw new Error(`${item.id} is missing from ${item.contributorSlug}/manifest.json`);
	}
}

console.log(`Validated ${ids.length} bansos folders and contributor references`);
