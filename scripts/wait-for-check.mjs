const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const sha = process.env.GITHUB_SHA;

function readPositiveMs(name, fallback) {
	const raw = process.env[name];
	if (raw === undefined) return fallback;

	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error(`${name} must be a positive number.`);
	}
	return value;
}

const checkName = process.env.DEPLOY_CHECK_NAME || 'Cloudflare Pages';
const maxWaitMs = readPositiveMs('DEPLOY_MAX_WAIT_MS', 12 * 60 * 1000);
const pollMs = readPositiveMs('DEPLOY_POLL_MS', 10_000);

if (!token || !repository || !sha) {
	throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_SHA are required.');
}

const url = `https://api.github.com/repos/${repository}/commits/${sha}/check-runs?per_page=100`;
const deadline = Date.now() + maxWaitMs;

while (Date.now() < deadline) {
	const response = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'User-Agent': 'bansos-deploy-waiter',
			'X-GitHub-Api-Version': '2022-11-28'
		},
		signal: AbortSignal.timeout(20_000)
	});

	if (!response.ok) {
		throw new Error(`Could not read check runs: ${response.status} ${response.statusText}`);
	}

	const { check_runs: checkRuns } = await response.json();
	const deployment = checkRuns.find(
		(check) =>
			check.name === checkName &&
			check.app?.slug === 'cloudflare-workers-and-pages' &&
			typeof check.output?.summary === 'string' &&
			!check.output.summary.includes('Branch Preview URL')
	);

	if (deployment?.status === 'completed') {
		if (deployment.conclusion === 'success') {
			console.log(`${checkName} succeeded. Discord notification can be sent.`);
			process.exit(0);
		}

		throw new Error(`${checkName} completed with conclusion: ${deployment.conclusion}`);
	}

	console.log(
		deployment
			? `${checkName} is ${deployment.status}; waiting...`
			: `${checkName} has not started; waiting...`
	);
	await new Promise((resolve) => setTimeout(resolve, pollMs));
}

throw new Error(`Timed out waiting for ${checkName} after ${Math.round(maxWaitMs / 1000)}s.`);
