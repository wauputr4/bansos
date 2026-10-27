import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function moduleUrl(code) {
	return (
		'data:text/javascript;base64,' +
		Buffer.from(
			ts.transpileModule(code, {
				compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
			}).outputText
		).toString('base64')
	);
}
const source = readFileSync(new URL('../src/lib/data/bansos.ts', import.meta.url), 'utf8');
const normalization = source.slice(
	source.indexOf('export function normalizeBansosStatuses'),
	source.indexOf('/**\n * Builds the bansos list')
);
const fixture = {
	id: 'kept',
	title: 'Repo title',
	provider: 'Test',
	description: 'Test',
	ctaLink: 'https://example.com',
	benefits: ['Test'],
	requirements: [],
	tags: ['Test'],
	validity: { type: 'uncertain' },
	featured: false,
	status: 'active'
};
const data = moduleUrl(`${normalization}
export const bansosList=${JSON.stringify(['kept', 'archived', 'bad'].map((id) => ({ ...fixture, id })))};
export const getContributorBySlug = slug => slug === 'tester' ? {login:'tester',contributedBansos:['kept','archived','bad']} : null;`);
const catalogSource = readFileSync(
	new URL('../src/lib/server/dynamic-catalog.ts', import.meta.url),
	'utf8'
).replace("'$lib/data/bansos'", JSON.stringify(data));
const catalogUrl = moduleUrl(catalogSource);
const { catalogItems } = await import(catalogUrl);
const rows = [
	{
		id: 'kept',
		state: 'published',
		payload: JSON.stringify({ ...fixture, title: 'Reviewed edit' })
	},
	{ id: 'archived', state: 'archived', payload: '{}' },
	{ id: 'bad', state: 'published', payload: '{broken' },
	{ id: 'bad-shape', state: 'published', payload: '{}' },
	{
		id: 'upcoming',
		state: 'published',
		payload: JSON.stringify({
			...fixture,
			id: 'upcoming',
			status: 'upcoming',
			publishedAt: '2000-01-01'
		})
	},
	{
		id: 'expired',
		state: 'published',
		payload: JSON.stringify({
			...fixture,
			id: 'expired',
			validity: { type: 'fixed', date: '2000-01-01' }
		})
	}
];
const db = { prepare: () => ({ all: async () => ({ results: rows }) }) };
const originalError = console.error;
let warnings = 0;
console.error = () => warnings++;
try {
	const items = await catalogItems(db);
	assert.equal(items.find((i) => i.id === 'kept').title, 'Reviewed edit');
	assert.ok(
		!items.some((i) => ['archived', 'bad', 'bad-shape'].includes(i.id)),
		'invalid overlays cannot resurrect old content'
	);
	assert.equal(items.find((i) => i.id === 'upcoming').status, 'upcoming');
	assert.equal(items.find((i) => i.id === 'expired').status, 'expired');
	const { normalizeBansosStatuses } = await import(data);
	assert.equal(
		normalizeBansosStatuses(items).find((i) => i.id === 'upcoming').status,
		'upcoming',
		'provider renormalization preserves explicit status'
	);
	const profileSource = readFileSync(
		new URL('../src/routes/[slug]/+page.server.ts', import.meta.url),
		'utf8'
	)
		.replace("'@sveltejs/kit'", JSON.stringify(import.meta.resolve('@sveltejs/kit')))
		.replace("'$lib/data/bansos'", JSON.stringify(data))
		.replace("'$lib/server/dynamic-catalog'", JSON.stringify(catalogUrl));
	const { load } = await import(moduleUrl(profileSource));
	const profile = await load({ params: { slug: 'tester' }, platform: { env: { DB: db } } });
	assert.deepEqual(
		profile.bansos.map((i) => i.id),
		['kept']
	);
	assert.deepEqual(profile.contributor.contributedBansos, ['kept']);
	assert.equal(warnings, 4, 'invalid rows omitted without logging their payloads');
} finally {
	console.error = originalError;
}
console.log(
	'PASS: D1-aware contributor visibility, reviewed edits, malformed-row isolation, explicit upcoming status and expiry.'
);
