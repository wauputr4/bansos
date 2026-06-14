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

const output = Object.fromEntries(
	[...contributorsByItem.entries()].sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(outputPath, `${JSON.stringify(output, null, '\t')}\n`);
console.log(`Generated ${outputPath}`);
