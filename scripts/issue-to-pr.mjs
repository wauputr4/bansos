import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const eventPath = process.env.GITHUB_EVENT_PATH;
const outputPath = process.env.BANSOS_PAYLOAD_PATH || '.tmp-bansos-issue.json';
const githubOutput = process.env.GITHUB_OUTPUT;

/**
 * Checks if a string is a valid calendar date in YYYY-MM-DD format.
 * @param {string} value The date string to check.
 * @returns {boolean} True if valid calendar date, false otherwise.
 */
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

if (!eventPath) {
	throw new Error('GITHUB_EVENT_PATH is required');
}

const event = JSON.parse(readFileSync(eventPath, 'utf8'));
const issue = event.issue;

if (!issue) {
	throw new Error('This workflow must be triggered by a GitHub issue event');
}

const body = issue.body || '';
const jsonBlock = body.match(/```json\s*([\s\S]*?)```/i);

if (!jsonBlock) {
	throw new Error('Issue body must contain a fenced ```json payload');
}

const payload = JSON.parse(jsonBlock[1]);

if (!payload.id || !payload.title) {
	throw new Error('Issue JSON payload must include id and title');
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.id)) {
	throw new Error('Issue JSON payload id must be kebab-case lowercase, e.g. tokenrouter-credits');
}

if (!payload.publishedAt) {
	const _d = new Date();
	payload.publishedAt = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;
} else if (!isValidCalendarDate(payload.publishedAt)) {
	throw new Error('Issue JSON payload publishedAt must be a valid date in YYYY-MM-DD format');
}

writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n');

if (githubOutput) {
	appendFileSync(githubOutput, `id=${payload.id}\n`);
	appendFileSync(githubOutput, `title=${payload.title.replace(/[\r\n]/g, ' ')}\n`);
}
