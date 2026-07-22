/**
 * generate-commit-contributors.mjs
 *
 * Auto-generates commit contributor data from git history.
 *
 * Output:
 *   1. Per folder:   src/lib/data/bansos/<slug>/.contributors.json
 *   2. Global index: src/lib/data/bansos/commit-contributors.json
 *
 * Hanya melacak file yang tidak di-gitignore.
 * Script ini jalan di prebuild.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BANSOS_DIR = 'src/lib/data/bansos';
const GLOBAL_OUTPUT = join(BANSOS_DIR, 'commit-contributors.json');
const HISTORY_OUTPUT = join(BANSOS_DIR, 'commit-history.json');
const CONTRIBUTOR_FILE = '.contributors.json';
const LEGACY_DATA = 'src/lib/data/bansos.json';
const LEGACY_CONTRIBUTORS = 'src/lib/data/commit-contributors.json';
const HISTORY_START = git([
	'log',
	'-S',
	"const BANSOS_DIR = 'src/lib/data/bansos';",
	'-1',
	'--format=%H',
	'--',
	'scripts/generate-commit-contributors.mjs'
]);

function readJson(filePath, fallback) {
	try {
		return JSON.parse(readFileSync(filePath, 'utf8'));
	} catch {
		return fallback;
	}
}

const legacySlugs = new Set(readJson(LEGACY_DATA, []).map((item) => item.id));
const legacyContributors = readJson(LEGACY_CONTRIBUTORS, {});

function git(args) {
	return execFileSync('git', args, {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'ignore']
	}).trim();
}

/**
 * Check if a path is tracked by git (not gitignored).
 * Empty output = not tracked (gitignored or outside repo).
 */
function isGitTracked(filePath) {
	try {
		const result = git(['ls-files', '--error-unmatch', filePath]);
		return result.length > 0;
	} catch {
		return false;
	}
}

/**
 * Normalize contributor from git log output.
 */
function parseContributor(authorName, authorEmail) {
	const noreply = authorEmail.match(/(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
	const login =
		noreply?.[1] ||
		authorName
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+|-+$/g, '');

	return {
		login,
		name: authorName,
		avatarUrl: `https://github.com/${login}.png?size=96`,
		commitUrl: `https://github.com/wauputr4/bansos/commits?author=${login}`,
		lastCommitAt: '' // will be filled from latest commit
	};
}

/**
 * Get all bansos folders that have index.json and are git-tracked.
 */
function getBansosSlugs() {
	const slugs = [];
	if (!existsSync(BANSOS_DIR)) return slugs;

	const entries = readdirSync(BANSOS_DIR, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (entry.name === 'contributors' || entry.name === 'schema') continue;
		const indexPath = join(BANSOS_DIR, entry.name, 'index.json');
		if (existsSync(indexPath) && isGitTracked(indexPath)) {
			slugs.push(entry.name);
		}
	}
	return slugs.sort();
}

/**
 * Get git log for a specific file path.
 * Returns array of { hash, authorName, authorEmail, date }
 */
function getGitLog(filePath) {
	try {
		const log = git([
			'log',
			`${HISTORY_START}..HEAD`,
			'--format=%H|%an|%ae|%aI',
			'--reverse',
			'--follow',
			'--',
			filePath
		]);
		if (!log) return [];

		return log
			.split('\n')
			.filter(Boolean)
			.map((line) => {
				const [hash, authorName, authorEmail, date] = line.split('|');
				return { hash, authorName, authorEmail, date };
			});
	} catch {
		return [];
	}
}

function getLatestFolderCommit(slug) {
	try {
		const output = git([
			'log',
			'-1',
			'--format=%H|%aI',
			'--',
			join(BANSOS_DIR, slug, 'index.json'),
			join(BANSOS_DIR, slug, 'README.md')
		]);
		if (!output) return null;
		const [hash, date] = output.split('|');
		return {
			hash,
			date,
			url: `https://github.com/wauputr4/bansos/commit/${hash}`
		};
	} catch {
		return null;
	}
}

function existedBefore(commit, filePath) {
	try {
		git(['cat-file', '-e', `${commit}^:${filePath}`]);
		return true;
	} catch {
		return false;
	}
}

/**
 * Get current working tree author info.
 */
function getWorkingTreeAuthor() {
	let name = 'local';
	let email = 'local@localhost';

	try {
		name = git(['config', 'user.name']) || name;
		email = git(['config', 'user.email']) || email;
	} catch {
		// git config optional
	}

	const noreply = email.match(/(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
	const login =
		process.env.GITHUB_ACTOR ||
		noreply?.[1] ||
		name
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+|-+$/g, '') ||
		'local';

	return {
		login,
		name,
		avatarUrl: `https://github.com/${login}.png?size=96`,
		commitUrl: `https://github.com/wauputr4/bansos/commits?author=${login}`,
		lastCommitAt: new Date().toISOString()
	};
}

/**
 * Generate .contributors.json for a single bansos folder.
 */
function generateForFolder(slug) {
	const indexPath = join(BANSOS_DIR, slug, 'index.json');
	const outputPath = join(BANSOS_DIR, slug, CONTRIBUTOR_FILE);

	if (!existsSync(indexPath)) return { contributors: [], latestCommit: null };

	const gitLog = getGitLog(indexPath);
	const contributorMap = new Map();

	for (const contributor of legacyContributors[slug] || []) {
		contributorMap.set(contributor.login.toLowerCase(), { ...contributor, lastCommitAt: '' });
	}

	// Folder legacy yang baru dibuat setelah cutoff adalah hasil sync migrasi, bukan edit asli.
	if (legacySlugs.has(slug) && gitLog[0] && !existedBefore(gitLog[0].hash, indexPath)) {
		gitLog.shift();
	}

	for (const entry of gitLog) {
		const contributor = parseContributor(entry.authorName, entry.authorEmail);
		const key = contributor.login.toLowerCase();
		if (!contributorMap.has(key)) {
			contributor.lastCommitAt = entry.date;
			contributorMap.set(key, contributor);
		} else {
			// Update lastCommitAt if newer
			const existing = contributorMap.get(key);
			if (entry.date > existing.lastCommitAt) {
				existing.lastCommitAt = entry.date;
			}
		}
	}

	// Add working tree changes (uncommitted)
	const workingTreeAuthor = getWorkingTreeAuthor();
	try {
		const status = git(['status', '--porcelain', indexPath]);
		if (status) {
			const key = workingTreeAuthor.login.toLowerCase();
			if (!contributorMap.has(key)) {
				contributorMap.set(key, {
					...workingTreeAuthor,
					lastCommitAt: new Date().toISOString()
				});
			}
		}
	} catch {
		// git status optional
	}

	const contributors = Array.from(contributorMap.values());

	if (contributors.length > 0) {
		// Sort by lastCommitAt descending
		contributors.sort((a, b) => (b.lastCommitAt || '').localeCompare(a.lastCommitAt || ''));
		writeFileSync(outputPath, JSON.stringify(contributors, null, '\t') + '\n');
	} else if (existsSync(outputPath)) {
		// Remove empty contributor file
		writeFileSync(outputPath, '[]\n');
	}

	return { contributors, latestCommit: getLatestFolderCommit(slug) };
}

/**
 * Main: generate all contributor files.
 */
function main() {
	console.log('🔍 Generating commit contributors...');
	const slugs = getBansosSlugs();
	console.log(`   Found ${slugs.length} tracked bansos folders`);

	const globalMap = new Map();
	const historyMap = new Map();
	let totalContributors = 0;

	for (const slug of slugs) {
		const { contributors, latestCommit } = generateForFolder(slug);
		if (contributors.length > 0) {
			globalMap.set(
				slug,
				contributors.map((c) => ({
					login: c.login,
					name: c.name,
					avatarUrl: c.avatarUrl,
					commitUrl: c.commitUrl
				}))
			);
			totalContributors += contributors.length;
		}
		if (latestCommit) historyMap.set(slug, latestCommit);
		process.stdout.write(`   ${slug}: ${contributors.length} contributors\n`);
	}

	// Write global index
	const globalOutput = Object.fromEntries(
		[...globalMap.entries()].sort(([a], [b]) => a.localeCompare(b))
	);

	writeFileSync(GLOBAL_OUTPUT, JSON.stringify(globalOutput, null, '\t') + '\n');
	writeFileSync(HISTORY_OUTPUT, JSON.stringify(Object.fromEntries(historyMap), null, '\t') + '\n');
	console.log(`\n✅ Done!`);
	console.log(`   • ${slugs.length} folders processed`);
	console.log(`   • ${totalContributors} total contributor entries`);
	console.log(`   • Per-folder: ${BANSOS_DIR}/<slug>/${CONTRIBUTOR_FILE}`);
	console.log(`   • Global:     ${GLOBAL_OUTPUT}`);
	console.log(`   • History:    ${HISTORY_OUTPUT}`);
}

main();
