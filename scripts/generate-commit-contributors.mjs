import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const dataPath = 'src/lib/data/bansos.json';
const outputPath = 'src/lib/data/commit-contributors.json';

function git(args) {
	return execFileSync('git', args, {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'ignore']
	}).trim();
}

function parseDataAt(rev) {
	try {
		const raw = git(['show', `${rev}:${dataPath}`]);
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

function contributorFrom(commit) {
	const [hash, name, email] = git(['show', '-s', '--format=%H%x00%an%x00%ae', commit]).split('\0');
	const noreply = email.match(/(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
	const login =
		noreply?.[1] ||
		name
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	return {
		login,
		name,
		avatarUrl: `https://github.com/${login}.png?size=96`,
		commitUrl: `https://github.com/wauputr4/bansos/commit/${hash}`
	};
}

function currentContributor() {
	let name = process.env.GITHUB_ACTOR || 'local';
	let email = `${name}@users.noreply.github.com`;

	try {
		name = git(['config', 'user.name']) || name;
		email = git(['config', 'user.email']) || email;
	} catch {
		// Git config is optional for local generation.
	}

	const login =
		process.env.GITHUB_ACTOR ||
		email.match(/(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/)?.[1] ||
		name
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+|-+$/g, '') ||
		'local';

	return {
		login,
		name,
		avatarUrl: `https://github.com/${login}.png?size=96`,
		commitUrl: `https://github.com/wauputr4/bansos/commits?author=${login}`
	};
}

function byId(items) {
	return new Map(items.map((item) => [item.id, JSON.stringify(item)]));
}

function normalizeContributor(contributor) {
	if (!contributor || typeof contributor !== 'object') {
		return null;
	}
	const login = String(contributor.login || '').trim();
	if (!login) {
		return null;
	}
	return {
		login,
		name: String(contributor.name || ''),
		avatarUrl: String(contributor.avatarUrl || ''),
		commitUrl: String(contributor.commitUrl || '')
	};
}

function readCommitContributors() {
	try {
		const raw = readFileSync(outputPath, 'utf8');
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
			const sanitized = {};
			for (const [id, contributors] of Object.entries(parsed)) {
				if (!Array.isArray(contributors)) continue;
				const normalized = [];
				const seen = new Set();
				for (const contributor of contributors) {
					const normalizedContributor = normalizeContributor(contributor);
					if (!normalizedContributor) continue;
					const key = normalizedContributor.login.toLowerCase();
					if (seen.has(key)) continue;
					seen.add(key);
					normalized.push(normalizedContributor);
				}
				if (normalized.length > 0) {
					sanitized[id] = normalized;
				}
			}
			return sanitized;
		}
		return {};
	} catch {
		return {};
	}
}

function mergeContributors(existing, next) {
	const seen = new Set(
		existing.map((entry) => String(entry?.login || '').toLowerCase()).filter(Boolean)
	);
	const merged = [...existing];
	for (const contributor of next) {
		const normalizedContributor = normalizeContributor(contributor);
		if (!normalizedContributor) continue;
		const key = normalizedContributor.login.toLowerCase();
		if (!seen.has(key)) {
			merged.push(normalizedContributor);
			seen.add(key);
		}
	}
	return merged;
}

const commits = git(['log', '--reverse', '--format=%H', '--', dataPath])
	.split('\n')
	.filter(Boolean);
const contributorsByItem = new Map();

for (const commit of commits) {
	const before = byId(parseDataAt(`${commit}^`));
	const after = byId(parseDataAt(commit));
	const contributor = contributorFrom(commit);

	for (const [id, item] of after.entries()) {
		if (before.get(id) === item) continue;
		const current = contributorsByItem.get(id) || [];
		if (!current.some((entry) => entry.login === contributor.login)) {
			current.push(contributor);
		}
		contributorsByItem.set(id, current);
	}
}

const headData = byId(parseDataAt('HEAD'));
const workingTreeData = byId(JSON.parse(readFileSync(dataPath, 'utf8')));
const workingTreeContributor = currentContributor();

for (const [id, item] of workingTreeData.entries()) {
	if (headData.get(id) === item) continue;
	const current = contributorsByItem.get(id) || [];
	if (!current.some((entry) => entry.login === workingTreeContributor.login)) {
		current.push(workingTreeContributor);
	}
	contributorsByItem.set(id, current);
}

const existingContributors = readCommitContributors();
const finalContributors = new Map(Object.entries(existingContributors));

for (const [id, contributors] of contributorsByItem.entries()) {
	const existing = finalContributors.get(id) || [];
	finalContributors.set(id, mergeContributors(existing, contributors));
}

const output = Object.fromEntries(
	[...finalContributors.entries()]
		.filter(([id, contributors]) => contributors.length > 0 && workingTreeData.has(id))
		.sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(outputPath, `${JSON.stringify(output, null, '\t')}\n`);
console.log(`Generated ${outputPath}`);
