#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

const DEFAULT_OWNER = 'wauputr4';
const DEFAULT_REPO = 'bansos';
const WORKFLOW_ID = 'add-bansos.yml';

function parseArgs(argv) {
	const [command, ...rest] = argv;
	const args = { command };
	for (let index = 0; index < rest.length; index += 1) {
		const arg = rest[index];
		if (!arg.startsWith('--')) continue;
		const key = arg.slice(2);
		const next = rest[index + 1];
		if (!next || next.startsWith('--')) {
			args[key] = 'true';
			continue;
		}
		args[key] = next;
		index += 1;
	}
	return args;
}

function parseJsonPayload(jsonInput) {
	if (!jsonInput) {
		return {};
	}

	const trimmed = String(jsonInput).trim();
	const content = trimmed.startsWith('{')
		? trimmed
		: readFileSync(isAbsolute(trimmed) ? trimmed : join(process.cwd(), trimmed), 'utf8');

	try {
		return JSON.parse(content);
	} catch (error) {
		throw new Error('--json must be valid JSON string or path to a JSON file', { cause: error });
	}
}

function mergePayloadInput(args) {
	const jsonPayload = parseJsonPayload(args.json);
	const mergedArgs = { ...jsonPayload, ...args };

	if (jsonPayload.validity) {
		if (!mergedArgs['validity-type'] && jsonPayload.validity.type) {
			mergedArgs['validity-type'] = jsonPayload.validity.type;
		}
		if (!mergedArgs['validity-date'] && jsonPayload.validity.date) {
			mergedArgs['validity-date'] = jsonPayload.validity.date;
		}
		if (!mergedArgs['validity-desc'] && jsonPayload.validity.description) {
			mergedArgs['validity-desc'] = jsonPayload.validity.description;
		}
	}

	if (jsonPayload.contributor) {
		if (!mergedArgs['contributor-name'] && jsonPayload.contributor.name) {
			mergedArgs['contributor-name'] = jsonPayload.contributor.name;
		}
		if (!mergedArgs['contributor-url'] && jsonPayload.contributor.url) {
			mergedArgs['contributor-url'] = jsonPayload.contributor.url;
		}
	}

	if (!mergedArgs['cta-link'] && jsonPayload.ctaLink) {
		mergedArgs['cta-link'] = jsonPayload.ctaLink;
	}
	if (!mergedArgs['published-at'] && jsonPayload.publishedAt) {
		mergedArgs['published-at'] = jsonPayload.publishedAt;
	}

	return mergedArgs;
}

function help() {
	console.log(`bansosdev

Usage:
  npx bansosdev add --id my-bansos --title "Promo" --provider "Provider" ...

Modes:
  --mode direct   Trigger trusted GitHub Action commit (needs token)
  --mode issue    Print a prefilled GitHub issue URL; valid issues become PRs automatically
  --mode json     Print validated JSON payload only

Required:
  --id
  --title
  --provider
  --description
  --benefits "Benefit 1|Benefit 2"
  --validity-type fixed|uncertain|forever
  --requirements "Step 1|Step 2"
  --cta-link "https://example.com"
  --tags "Cloud,Gratisan"

Optional:
  --json <path-or-json-string>  Read payload from JSON string or JSON file.
  --validity-date YYYY-MM-DD (required if type is fixed)
  --validity-desc "Description"
  --published-at YYYY-MM-DD
  --promo-code CODE
  --tips "Tips singkat"
  --source "https://example.com/source atau teks sumber"
  --contributor-name "Nama"
  --contributor-url "https://example.com"
  --status active|expired|upcoming
  --featured true
  --repo owner/repo
  --token <github_token> (or env BANSOSDEV_GITHUB_TOKEN / GITHUB_TOKEN)
`);
}

function required(args, key) {
	if (!args[key]) {
		throw new Error(`Missing required argument --${key}`);
	}
	return args[key];
}

function list(value) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item || '').trim()).filter(Boolean);
	}

	return String(value || '')
		.split('|')
		.map((item) => item.trim())
		.filter(Boolean);
}

function csv(value) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item || '').trim()).filter(Boolean);
	}

	return String(value || '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

function validateUrl(value, key) {
	let parsed;
	try {
		parsed = new URL(value);
	} catch (error) {
		throw new Error(`--${key} must be a valid URL`, { cause: error });
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw new Error(`--${key} must use http: or https: protocol`);
	}

	return parsed.toString();
}

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

function payloadFromArgs(args) {
	const validityType = required(args, 'validity-type');
	if (!['fixed', 'uncertain', 'forever'].includes(validityType)) {
		throw new Error('--validity-type must be fixed, uncertain, or forever');
	}
	const validity = { type: validityType };
	if (validityType === 'fixed') {
		validity.date = required(args, 'validity-date');
		if (!/^\d{4}-\d{2}-\d{2}$/.test(validity.date)) {
			throw new Error('--validity-date must be YYYY-MM-DD');
		}
		const [year, month, day] = validity.date.split('-').map(Number);
		const parsedDate = new Date(year, month - 1, day);
		if (
			parsedDate.getFullYear() !== year ||
			parsedDate.getMonth() !== month - 1 ||
			parsedDate.getDate() !== day
		) {
			throw new Error('--validity-date is not a valid calendar date');
		}
	}
	if (args['validity-desc']) {
		validity.description = args['validity-desc'];
	}
	const publishedAt = args['published-at'] || new Date().toISOString().slice(0, 10);
	if (!isValidCalendarDate(publishedAt)) {
		throw new Error('--published-at must be a valid YYYY-MM-DD date');
	}

	const contributorName =
		args['contributor-name'] || args.contributorName || (args.contributor && args.contributor.name);
	const contributorUrl =
		args['contributor-url'] || args.contributorUrl || (args.contributor && args.contributor.url);
	const source = args.source && String(args.source).trim() ? String(args.source).trim() : undefined;

	const payload = {
		id: required(args, 'id'),
		title: required(args, 'title'),
		provider: required(args, 'provider'),
		description: required(args, 'description'),
		benefits: list(required(args, 'benefits')),
		promoCode: args['promo-code'],
		validity: validity,
		requirements: list(required(args, 'requirements')),
		tips: args.tips,
		source,
		publishedAt,
		contributor:
			contributorName && contributorUrl
				? {
						name: contributorName,
						url: contributorUrl
					}
				: undefined,
		ctaLink: validateUrl(required(args, 'cta-link'), 'cta-link'),
		tags: csv(required(args, 'tags')),
		featured: args.featured === 'true',
		status: args.status || 'active'
	};

	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.id)) {
		throw new Error('--id must be kebab-case lowercase, e.g. tokenrouter-credits');
	}
	if (!['active', 'expired', 'upcoming'].includes(payload.status)) {
		throw new Error('--status must be active, expired, or upcoming');
	}
	if (payload.benefits.length === 0) throw new Error('--benefits must contain at least one item');
	if (payload.requirements.length === 0)
		throw new Error('--requirements must contain at least one item');
	if (payload.tags.length === 0) throw new Error('--tags must contain at least one item');
	if (
		(args['contributor-name'] && !args['contributor-url']) ||
		(!args['contributor-name'] && args['contributor-url'])
	) {
		throw new Error('Use --contributor-name and --contributor-url together');
	}
	if (payload.contributor && payload.contributor.url) {
		payload.contributor.url = validateUrl(payload.contributor.url, 'contributor-url');
	}

	return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function repoFromArgs(args) {
	const repo = args.repo || `${DEFAULT_OWNER}/${DEFAULT_REPO}`;
	const [owner, name] = repo.split('/');
	if (!owner || !name) throw new Error('--repo must use owner/repo format');
	return { owner, name };
}

function issueUrl(args, payload) {
	const { owner, name } = repoFromArgs(args);
	const body = [
		'## Bansos submission',
		'',
		'```json',
		JSON.stringify(payload, null, 2),
		'```'
	].join('\n');
	const params = new URLSearchParams({
		title: `Tambah bansos: ${payload.title}`,
		body,
		labels: 'submission,bansos'
	});
	return `https://github.com/${owner}/${name}/issues/new?${params.toString()}`;
}

async function dispatchWorkflow(args, payload) {
	const token = args.token || process.env.BANSOSDEV_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error('Direct mode needs --token or BANSOSDEV_GITHUB_TOKEN/GITHUB_TOKEN');
	}
	const { owner, name } = repoFromArgs(args);
	const response = await fetch(
		`https://api.github.com/repos/${owner}/${name}/actions/workflows/${WORKFLOW_ID}/dispatches`,
		{
			method: 'POST',
			headers: {
				accept: 'application/vnd.github+json',
				authorization: `Bearer ${token}`,
				'content-type': 'application/json',
				'user-agent': 'bansosdev-cli'
			},
			body: JSON.stringify({
				ref: args.ref || 'main',
				inputs: {
					payload: JSON.stringify(payload)
				}
			})
		}
	);
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`GitHub workflow dispatch failed (${response.status}): ${text}`);
	}
	console.log(`Triggered ${owner}/${name} workflow ${WORKFLOW_ID}`);
}

async function main() {
	const argv = process.argv.slice(2);
	const args = parseArgs(argv);
	if (
		!args.command ||
		args.command === 'help' ||
		args.command === '--help' ||
		args.command === '-h' ||
		args.help === 'true' ||
		argv.includes('-h')
	) {
		help();
		return;
	}
	if (args.command !== 'add') throw new Error(`Unknown command: ${args.command}`);

	const mergedArgs = mergePayloadInput(args);
	const payload = payloadFromArgs(mergedArgs);
	const mode = args.mode || 'issue';
	if (mode === 'json') {
		console.log(JSON.stringify(payload, null, 2));
		return;
	}
	if (mode === 'issue') {
		console.log(issueUrl(mergedArgs, payload));
		return;
	}
	if (mode === 'direct') {
		await dispatchWorkflow(mergedArgs, payload);
		return;
	}
	throw new Error('--mode must be issue, direct, or json');
}

main().catch((error) => {
	console.error(`bansosdev: ${error.message}`);
	process.exit(1);
});
