export interface DbStatement {
	bind(...values: (string | number | null)[]): DbStatement;
	first<T>(): Promise<T | null>;
	all<T>(): Promise<{ results: T[] }>;
	run(): Promise<DbResult>;
}

export interface DbResult {
	meta?: { changes?: number };
}

export interface DynamicDb {
	prepare(query: string): DbStatement;
	batch(statements: DbStatement[]): Promise<DbResult[]>;
}

export function requireDb(platform: App.Platform | undefined): DynamicDb {
	if (!platform?.env.DB) {
		throw new Error(
			'D1 binding DB belum tersedia. Jalankan migrasi dan konfigurasi binding lokal.'
		);
	}
	return platform.env.DB;
}
