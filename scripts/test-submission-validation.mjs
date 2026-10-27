import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Exercise the server-only validator without a running worker or database.
const source = await readFile(new URL('../src/lib/server/submission.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
});
const { readSubmissionForm, parseSubmission } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText.replace(/(['"])@sveltejs\/kit\1/g, JSON.stringify(import.meta.resolve('@sveltejs/kit')))).toString('base64')}`
);
const fields = {
	id: 'validation-test',
	title: 'Validation test',
	provider: 'Test',
	description: 'Local test only',
	benefits: 'Test benefit',
	tags: 'AI',
	ctaLink: 'https://example.com/claim',
	source: 'https://example.com/source',
	validityType: 'fixed',
	validityDate: '2028-02-29'
};
function form(overrides = {}) {
	const result = new FormData();
	for (const [key, value] of Object.entries({ ...fields, ...overrides })) result.set(key, value);
	return result;
}
assert.equal(parseSubmission(form()).validity.date, '2028-02-29');
for (const validityDate of ['2026-02-29', '2026-02-31', '2026-04-31', '2026-13-01']) {
	assert.throws(() => parseSubmission(form({ validityDate })), /Tanggal validitas/);
}
for (const ctaLink of ['javascript:alert(1)', 'https://user:password@example.com/']) {
	assert.throws(() => parseSubmission(form({ ctaLink })), /URL/);
}
const valid = await readSubmissionForm(
	new Request('https://example.com', { method: 'POST', body: form() })
);
assert.equal(valid.get('id'), fields.id, 'multipart forms still parse');

let cancelled = false;
const stream = new ReadableStream({
	pull(controller) {
		controller.enqueue(new Uint8Array(17 * 1024));
	},
	cancel() {
		cancelled = true;
	}
});
await assert.rejects(
	readSubmissionForm(
		new Request('https://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: stream,
			duplex: 'half'
		})
	),
	(cause) => cause.status === 400
);
await assert.rejects(
	readSubmissionForm(
		new Request('https://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: '{}'
		})
	),
	(cause) => cause.status === 400
);
assert.equal(cancelled, true, 'oversized body stops reading without Content-Length');
console.log(
	'PASS: multipart, streamed body limit, strict calendar dates, safe URL protocols and credentials.'
);
