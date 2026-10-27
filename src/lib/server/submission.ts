import type { BansosItem } from '$lib/data/bansos';
import { error } from '@sveltejs/kit';

export type SubmissionPayload = Pick<
	BansosItem,
	| 'id'
	| 'title'
	| 'provider'
	| 'description'
	| 'benefits'
	| 'requirements'
	| 'ctaLink'
	| 'source'
	| 'tags'
	| 'validity'
	| 'promoCode'
	| 'status'
>;

const maxSubmissionBytes = 32 * 1024;

export async function readSubmissionForm(request: Request): Promise<FormData> {
	const length = Number(request.headers.get('content-length'));
	if (length > maxSubmissionBytes) error(400, 'Form terlalu besar (maksimal 32 KB).');
	// Bound the actual stream too: Content-Length may be absent or inaccurate.
	const reader = request.body?.getReader();
	const chunks: Uint8Array[] = [];
	let bytes = 0;
	if (reader) {
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				bytes += value.byteLength;
				if (bytes > maxSubmissionBytes) {
					await reader.cancel();
					error(400, 'Form terlalu besar (maksimal 32 KB).');
				}
				chunks.push(value);
			}
		} finally {
			reader.releaseLock();
		}
	}
	const body = new Uint8Array(bytes);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	let form: FormData;
	try {
		form = await new Response(body, {
			headers: { 'Content-Type': request.headers.get('content-type') || '' }
		}).formData();
	} catch {
		error(400, 'Content-Type atau format form tidak valid.');
	}
	let size = 0;
	for (const [key, value] of form) {
		if (typeof value !== 'string') error(400, 'Lampiran file tidak didukung.');
		size += key.length + value.length;
		if (size > maxSubmissionBytes) error(400, 'Form terlalu besar (maksimal 32 KB).');
	}
	return form;
}

function required(form: FormData, key: string, max: number): string {
	const value = String(form.get(key) || '').trim();
	if (!value || value.length > max)
		throw new Error(`${key} wajib diisi (maksimal ${max} karakter).`);
	return value;
}

function lines(value: FormDataEntryValue | null, maxItems: number): string[] {
	return String(value || '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.slice(0, maxItems);
}

function validUrl(value: string): string {
	const url = new URL(value);
	if (
		!['http:', 'https:'].includes(url.protocol) ||
		!url.hostname.includes('.') ||
		url.username ||
		url.password
	) {
		throw new Error('URL harus HTTP(S) dan punya hostname valid.');
	}
	return url.toString();
}

export function parseSubmission(form: FormData, allowExpired = false): SubmissionPayload {
	const id = required(form, 'id', 90).toLowerCase();
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Slug harus kebab-case.');
	const benefits = lines(form.get('benefits'), 20);
	if (!benefits.length || benefits.some((value) => value.length > 350)) {
		throw new Error('Isi minimal satu benefit, maksimal 350 karakter per baris.');
	}
	const requirements = lines(form.get('requirements'), 20);
	if (requirements.some((value) => value.length > 350)) {
		throw new Error('Syarat klaim maksimal 350 karakter per baris.');
	}
	const tags = String(form.get('tags') || '')
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean)
		.slice(0, 12);
	if (!tags.length || tags.some((tag) => tag.length > 40)) {
		throw new Error('Isi minimal satu tag, maksimal 40 karakter per tag.');
	}
	const validityType = String(form.get('validityType') || 'uncertain');
	if (!['fixed', 'uncertain', 'forever'].includes(validityType)) {
		throw new Error('Tipe validitas tidak valid.');
	}
	const validityDate = String(form.get('validityDate') || '').trim();
	if (
		validityType === 'fixed' &&
		(!/^\d{4}-\d{2}-\d{2}$/.test(validityDate) ||
			Number.isNaN(Date.parse(`${validityDate}T00:00:00Z`)) ||
			new Date(`${validityDate}T00:00:00Z`).toISOString().slice(0, 10) !== validityDate)
	) {
		throw new Error('Tanggal validitas wajib diisi dengan format YYYY-MM-DD.');
	}
	const status = String(form.get('status') || 'active');
	if (!['active', 'upcoming', ...(allowExpired ? ['expired'] : [])].includes(status))
		throw new Error('Status tidak valid.');
	try {
		return {
			id,
			title: required(form, 'title', 160),
			provider: required(form, 'provider', 100),
			description: required(form, 'description', 1000),
			benefits,
			requirements,
			ctaLink: validUrl(required(form, 'ctaLink', 2000)),
			source: validUrl(required(form, 'source', 2000)),
			tags,
			promoCode: String(form.get('promoCode') || '')
				.trim()
				.slice(0, 100),
			validity: {
				type: validityType as BansosItem['validity']['type'],
				...(validityType === 'fixed' ? { date: validityDate } : {}),
				description: String(form.get('validityDescription') || '')
					.trim()
					.slice(0, 300)
			},
			status: status as BansosItem['status']
		};
	} catch (error) {
		if (error instanceof TypeError)
			throw new Error('URL klaim atau sumber tidak valid.', { cause: error });
		throw error;
	}
}
