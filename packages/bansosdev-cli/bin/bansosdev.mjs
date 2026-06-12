#!/usr/bin/env node

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

function help() {
	console.log(`bansosdev

Usage:
  npx bansosdev add --id my-bansos --title "Promo" --provider "Provider" ...

Modes:
  --mode direct   Trigger trusted GitHub Action commit (needs token)
  --mode issue    Print a prefilled GitHub issue URL for public submission
  --mode json     Print validated JSON payload only

Required:
  --id
  --title
  --provider
  --description
  --benefits "Benefit 1|Benefit 2"
  --validity "Berlaku sampai ..."
  --requirements "Step 1|Step 2"
  --cta-link "https://example.com"
  --tags "Cloud,Gratisan"

Optional:
  --promo-code CODE
  --tips "Tips singkat"
  --contributor-name "Nama"
  --contributor-url "https://example.com"
  --status active|expired|upcoming
  --featured true
  --repo owner/repo
  --token <github_token> (or env BANSOSDEV_GITHUB_TOKEN / GITHUB_TOKEN)
`);
}

function required(args, key) {
	if (!args[key]) throw new Error(`Missing required argument --${key}`);
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

function validateUrl(value, key) {
	try {
		return new URL(value).toString();
	} catch {
		throw new Error(`--${key} must be a valid URL`);
	}
}

function payloadFromArgs(args) {
	const payload = {
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
		(payload.contributorName && !payload.contributorUrl) ||
		(!payload.contributorName && payload.contributorUrl)
	) {
		throw new Error('Use --contributor-name and --contributor-url together');
	}
	if (payload.contributorUrl)
		payload.contributorUrl = validateUrl(payload.contributorUrl, 'contributor-url');

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
	const args = parseArgs(process.argv.slice(2));
	if (!args.command || args.command === 'help' || args.help === 'true') {
		help();
		return;
	}
	if (args.command !== 'add') throw new Error(`Unknown command: ${args.command}`);

	const payload = payloadFromArgs(args);
	const mode = args.mode || 'issue';
	if (mode === 'json') {
		console.log(JSON.stringify(payload, null, 2));
		return;
	}
	if (mode === 'issue') {
		console.log(issueUrl(args, payload));
		return;
	}
	if (mode === 'direct') {
		await dispatchWorkflow(args, payload);
		return;
	}
	throw new Error('--mode must be issue, direct, or json');
}

main().catch((error) => {
	console.error(`bansosdev: ${error.message}`);
	process.exit(1);
});
