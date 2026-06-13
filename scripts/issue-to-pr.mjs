import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const eventPath = process.env.GITHUB_EVENT_PATH;
const outputPath = process.env.BANSOS_PAYLOAD_PATH || '.tmp-bansos-issue.json';
const githubOutput = process.env.GITHUB_OUTPUT;

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

if (!payload.publishedAt) {
	payload.publishedAt = new Date().toISOString().slice(0, 10);
}

writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n');

if (githubOutput) {
	appendFileSync(githubOutput, `id=${payload.id}\n`);
	appendFileSync(githubOutput, `title=${payload.title.replace(/\n/g, ' ')}\n`);
}
