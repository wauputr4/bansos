import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, 'src/lib/data/bansos.json');

function parseArgs(argv) {
	const args = {};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg.startsWith('--')) continue;
		const key = arg.slice(2);
		const next = argv[index + 1];
		if (!next || next.startsWith('--')) {
			args[key] = 'true';
			continue;
		}
		args[key] = next;
		index += 1;
	}
	return args;
}

function required(args, key) {
	if (!args[key]) {
		throw new Error(`Missing required argument --${key}`);
	}
	return args[key];
}

function list(value) {
	return String(value || '')
		.split('|')
		.map((item) => item.trim())
		.filter(Boolean);
}

function csv(value) {
	return String(value || '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

function quote(value) {
	return `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function arrayLiteral(values, indent = 3) {
	const pad = '\t'.repeat(indent);
	return `[\n${values.map((value) => `${pad}${quote(value)}`).join(',\n')}\n${'\t'.repeat(indent - 1)}]`;
}

const args = parseArgs(process.argv.slice(2));
const jsonInput = args.json
	? args.json.trim().startsWith('{')
		? JSON.parse(args.json)
		: JSON.parse(readFileSync(join(process.cwd(), args.json), 'utf8'))
	: {};
const mergedArgs = { ...args, ...jsonInput };
const item = {
	id: required(mergedArgs, 'id'),
	title: required(mergedArgs, 'title'),
	provider: required(mergedArgs, 'provider'),
	description: required(mergedArgs, 'description'),
	benefits: Array.isArray(mergedArgs.benefits)
		? mergedArgs.benefits
		: list(required(mergedArgs, 'benefits')),
	promoCode: mergedArgs['promo-code'] || mergedArgs.promoCode,
	validity: required(mergedArgs, 'validity'),
	requirements: Array.isArray(mergedArgs.requirements)
		? mergedArgs.requirements
		: list(required(mergedArgs, 'requirements')),
	tips: mergedArgs.tips,
	contributorName: mergedArgs['contributor-name'] || mergedArgs.contributorName,
	contributorUrl: mergedArgs['contributor-url'] || mergedArgs.contributorUrl,
	ctaLink: mergedArgs['cta-link'] || required(mergedArgs, 'ctaLink'),
	tags: Array.isArray(mergedArgs.tags) ? mergedArgs.tags : csv(required(mergedArgs, 'tags')),
	featured: mergedArgs.featured === true || mergedArgs.featured === 'true',
	status: mergedArgs.status || 'active'
};

if (item.benefits.length === 0) throw new Error('--benefits must contain at least one item');
if (item.requirements.length === 0)
	throw new Error('--requirements must contain at least one item');
if (item.tags.length === 0) throw new Error('--tags must contain at least one item');
if (
	(item.contributorName && !item.contributorUrl) ||
	(!item.contributorName && item.contributorUrl)
) {
	throw new Error('Use --contributor-name and --contributor-url together');
}

const source = readFileSync(dataPath, 'utf8');
const data = JSON.parse(source);

if (data.some((i) => i.id === item.id)) {
	throw new Error(`Bansos id already exists: ${item.id}`);
}

data.push(item);
writeFileSync(dataPath, JSON.stringify(data, null, '\t') + '\n');
console.log(`Added bansos item: ${item.id}`);
