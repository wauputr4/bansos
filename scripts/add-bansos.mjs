import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, 'src/lib/data/bansos.ts');

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
const item = {
	id: required(args, 'id'),
	title: required(args, 'title'),
	provider: required(args, 'provider'),
	description: required(args, 'description'),
	benefits: list(required(args, 'benefits')),
	promoCode: args['promo-code'],
	validity: required(args, 'validity'),
	requirements: list(required(args, 'requirements')),
	tips: args.tips,
	contributorName: args['contributor-name'],
	contributorUrl: args['contributor-url'],
	ctaLink: required(args, 'cta-link'),
	tags: csv(required(args, 'tags')),
	featured: args.featured === 'true',
	status: args.status || 'active'
};

if (item.benefits.length === 0) throw new Error('--benefits must contain at least one item');
if (item.requirements.length === 0) throw new Error('--requirements must contain at least one item');
if (item.tags.length === 0) throw new Error('--tags must contain at least one item');
if ((item.contributorName && !item.contributorUrl) || (!item.contributorName && item.contributorUrl)) {
	throw new Error('Use --contributor-name and --contributor-url together');
}

const source = readFileSync(dataPath, 'utf8');
if (source.includes(`id: '${item.id}'`)) {
	throw new Error(`Bansos id already exists: ${item.id}`);
}

const objectLiteral = `\n\t,\n\t{\n\t\tid: ${quote(item.id)},\n\t\ttitle: ${quote(item.title)},\n\t\tprovider: ${quote(item.provider)},\n\t\tdescription: ${quote(item.description)},\n\t\tbenefits: ${arrayLiteral(item.benefits)},${item.promoCode ? `\n\t\tpromoCode: ${quote(item.promoCode)},` : ''}\n\t\tvalidity: ${quote(item.validity)},\n\t\trequirements: ${arrayLiteral(item.requirements)},${item.tips ? `\n\t\ttips: ${quote(item.tips)},` : ''}${item.contributorName ? `\n\t\tcontributor: {\n\t\t\tname: ${quote(item.contributorName)},\n\t\t\turl: ${quote(item.contributorUrl)}\n\t\t},` : ''}\n\t\tctaLink: ${quote(item.ctaLink)},\n\t\ttags: ${arrayLiteral(item.tags)},\n\t\tfeatured: ${item.featured},\n\t\tstatus: ${quote(item.status)}\n\t}`;

const marker = '\n];';
if (!source.includes(marker)) {
	throw new Error('Could not find bansosList closing marker');
}

writeFileSync(dataPath, source.replace(marker, `${objectLiteral}${marker}`));
console.log(`Added bansos item: ${item.id}`);
