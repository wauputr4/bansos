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
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const BANSOS_DIR = 'src/lib/data/bansos';
const GLOBAL_OUTPUT = join(BANSOS_DIR, 'commit-contributors.json');
const CONTRIBUTOR_FILE = '.contributors.json';

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
		commitUrl: `https://gitlab.com/wauputr4/bansos/commits?author=${login}`,
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
		const log = git(['log', '--format=%H|%an|%ae|%aI', '--reverse', '--follow', '--', filePath]);
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
		commitUrl: `https://gitlab.com/wauputr4/bansos/commits?author=${login}`,
		lastCommitAt: new Date().toISOString()
	};
}

/**
 * Merge contributors: new list into existing, dedup by login.
 */
function mergeContributors(existing, next) {
	const seen = new Set(existing.map((c) => c.login.toLowerCase()).filter(Boolean));
	const merged = [...existing];
	for (const contributor of next) {
		const key = contributor.login.toLowerCase();
		if (!seen.has(key)) {
			merged.push(contributor);
			seen.add(key);
		} else {
			// Update existing with newer info (avatar, lastCommitAt)
			const idx = merged.findIndex((c) => c.login.toLowerCase() === key);
			if (idx !== -1) {
				if (contributor.lastCommitAt > (merged[idx].lastCommitAt || '')) {
					merged[idx].lastCommitAt = contributor.lastCommitAt;
				}
			}
		}
	}
	return merged;
}

/**
 * Generate .contributors.json for a single bansos folder.
 */
function generateForFolder(slug) {
	const indexPath = join(BANSOS_DIR, slug, 'index.json');
	const outputPath = join(BANSOS_DIR, slug, CONTRIBUTOR_FILE);

	if (!existsSync(indexPath)) return [];

	const gitLog = getGitLog(indexPath);
	const contributorMap = new Map();

	for (const entry of gitLog) {
		const key = entry.authorName.toLowerCase() + '|' + entry.authorEmail.toLowerCase();
		if (!contributorMap.has(key)) {
			const contrib = parseContributor(entry.authorName, entry.authorEmail);
			contrib.lastCommitAt = entry.date;
			contributorMap.set(key, contrib);
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

	return contributors;
}

/**
 * Main: generate all contributor files.
 */
function main() {
	console.log('🔍 Generating commit contributors...');
	const slugs = getBansosSlugs();
	console.log(`   Found ${slugs.length} tracked bansos folders`);

	const globalMap = new Map();
	let totalContributors = 0;

	for (const slug of slugs) {
		const contributors = generateForFolder(slug);
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
		process.stdout.write(`   ${slug}: ${contributors.length} contributors\n`);
	}

	// Write global index
	const globalOutput = Object.fromEntries(
		[...globalMap.entries()].sort(([a], [b]) => a.localeCompare(b))
	);

	writeFileSync(GLOBAL_OUTPUT, JSON.stringify(globalOutput, null, '\t') + '\n');
	console.log(`\n✅ Done!`);
	console.log(`   • ${slugs.length} folders processed`);
	console.log(`   • ${totalContributors} total contributor entries`);
	console.log(`   • Per-folder: ${BANSOS_DIR}/<slug>/${CONTRIBUTOR_FILE}`);
	console.log(`   • Global:     ${GLOBAL_OUTPUT}`);
}

main();
