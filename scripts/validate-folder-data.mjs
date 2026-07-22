import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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

const catalogIds = readJson(join(root, 'index.json'))
	.items.map((item) => item.id)
	.sort();
if (JSON.stringify(catalogIds) !== JSON.stringify(ids)) {
	throw new Error('bansos/index.json is out of sync with listing folders');
}

const contributorsRoot = join(root, 'contributors');
for (const entry of readdirSync(contributorsRoot, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;
	const manifest = readJson(join(contributorsRoot, entry.name, 'manifest.json'));
	for (const id of manifest.contributedBansos || []) {
		if (!ids.includes(id)) throw new Error(`${entry.name} references missing bansos: ${id}`);
	}
	for (const url of [manifest.avatar, ...Object.values(manifest.links || {})].filter(Boolean)) {
		const parsed = new URL(url);
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			throw new Error(`${entry.name} contains unsafe URL: ${url}`);
		}
	}
}

console.log(`Validated ${ids.length} bansos folders and contributor references`);
