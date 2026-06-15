import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, 'src/lib/data/bansos.json');

function isValidCalendarDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}
	const [year, month, day] = value.split('-').map(Number);
	const parsedDate = new Date(year, month - 1, day);
	return (
		parsedDate.getFullYear() === year &&
		parsedDate.getMonth() === month - 1 &&
		parsedDate.getDate() === day
	);
}

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

const args = parseArgs(process.argv.slice(2));
const jsonInput = args.json
	? args.json.trim().startsWith('{')
		? JSON.parse(args.json)
		: JSON.parse(readFileSync(join(process.cwd(), args.json), 'utf8'))
	: {};
const mergedArgs = { ...args, ...jsonInput };
const validityType =
	mergedArgs['validity-type'] || (mergedArgs.validity && mergedArgs.validity.type);
if (!validityType)
	throw new Error('Missing required argument --validity-type or validity.type in JSON');
if (!['fixed', 'uncertain', 'forever'].includes(validityType)) {
	throw new Error('validity type must be fixed, uncertain, or forever');
}
const validity = { type: validityType };
if (validityType === 'fixed') {
	validity.date = mergedArgs['validity-date'] || (mergedArgs.validity && mergedArgs.validity.date);
	if (!validity.date)
		throw new Error(
			'Missing required argument --validity-date or validity.date in JSON for fixed type'
		);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(validity.date)) {
		throw new Error('validity date must be YYYY-MM-DD');
	}
	const [year, month, day] = validity.date.split('-').map(Number);
	const parsedDate = new Date(year, month - 1, day);
	if (
		parsedDate.getFullYear() !== year ||
		parsedDate.getMonth() !== month - 1 ||
		parsedDate.getDate() !== day
	) {
		throw new Error('validity date is not a valid calendar date');
	}
}
const validityDesc =
	mergedArgs['validity-desc'] || (mergedArgs.validity && mergedArgs.validity.description);
if (validityDesc) {
	validity.description = validityDesc;
}

const contributorName =
	mergedArgs['contributor-name'] || mergedArgs.contributorName || mergedArgs.contributor?.name;
const contributorUrl =
	mergedArgs['contributor-url'] || mergedArgs.contributorUrl || mergedArgs.contributor?.url;
const publishedAt =
	mergedArgs['published-at'] || mergedArgs.publishedAt || new Date().toISOString().slice(0, 10);

if (!isValidCalendarDate(publishedAt)) {
	throw new Error('publishedAt must be a valid YYYY-MM-DD date');
}

const item = {
	id: required(mergedArgs, 'id'),
	title: required(mergedArgs, 'title'),
	provider: required(mergedArgs, 'provider'),
	description: required(mergedArgs, 'description'),
	benefits: Array.isArray(mergedArgs.benefits)
		? mergedArgs.benefits
		: list(required(mergedArgs, 'benefits')),
	promoCode: mergedArgs['promo-code'] || mergedArgs.promoCode,
	validity: validity,
	requirements: Array.isArray(mergedArgs.requirements)
		? mergedArgs.requirements
		: list(required(mergedArgs, 'requirements')),
	tips: mergedArgs.tips,
	publishedAt,
	source: mergedArgs.source,
	contributor:
		contributorName && contributorUrl
			? {
					name: contributorName,
					url: contributorUrl
				}
			: undefined,
	ctaLink: mergedArgs['cta-link'] || required(mergedArgs, 'ctaLink'),
	tags: Array.isArray(mergedArgs.tags) ? mergedArgs.tags : csv(required(mergedArgs, 'tags')),
	featured: mergedArgs.featured === true || mergedArgs.featured === 'true',
	status: mergedArgs.status || 'active'
};

if (item.benefits.length === 0) throw new Error('--benefits must contain at least one item');
if (item.requirements.length === 0)
	throw new Error('--requirements must contain at least one item');
if (item.tags.length === 0) throw new Error('--tags must contain at least one item');
if ((contributorName && !contributorUrl) || (!contributorName && contributorUrl)) {
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
