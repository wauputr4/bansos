export interface BansosItem {
	id: string;
	title: string;
	provider: string;
	providerLogoUrl?: string;
	description: string;
	benefits: string[];
	promoCode?: string;
	validity: string;
	requirements: string[];
	tips?: string;
	contributor?: {
		name: string;
		url: string;
	};
	ctaLink: string;
	tags: string[];
	featured: boolean;
	status: 'active' | 'expired' | 'upcoming';
}

export const bansosList: BansosItem[] = [
	{
		id: 'namecom-domain-app',
		title: 'Promo Domain .DEV & .APP Gratis dari Name.com',
		provider: 'Name.com',
		description: 'Bansos paling krusial buat kalian yang pengen rilis aplikasi tapi terhalang dana beli domain. Domain .dev dan .app premium langsung gas tanpa biaya, no cap! 🚀',
		benefits: [
			'Domain .dev dan .app gratis tanpa bayar sama sekali',
			'Tidak perlu kartu kredit (Anti-CC-ribet-club)',
			'Limit 1 domain per akun (Biar semua kebagian, fr fr)',
			'Berlaku dari tanggal 8–30 Juni 2026'
		],
		promoCode: 'DEVWEEK26',
		validity: '8–30 Juni 2026',
		requirements: [
			'Punya akun Name.com aktif',
			'Pilih domain .dev atau .app yang tersedia',
			'Gunakan promo code pas checkout'
		],
		tips: 'Cuma bisa 1 akun per orang! Jangan coba-coba tuyul akun ya dek ya, biar berkah dan websitenya awet.',
		contributor: {
			name: 'Wauputra',
			url: 'https://wau.my.id'
		},
		ctaLink: 'https://www.name.com',
		tags: ['Domain', 'Gratisan', 'No Credit Card'],
		featured: true,
		status: 'active'
	},
	{
		id: 'tokenrouter-model-gateway',
		title: 'Free Credits TokenRouter buat Jajan Model AI',
		provider: 'TokenRouter',
		description: 'TokenRouter lagi bagi-bagi bonus credit buat developer yang butuh akses model AI tanpa dompet langsung menangis. Bisa top-up bonus 40% atau apply developer credits kalau eligible.',
		benefits: [
			'Top up 6, dapat 4 credit gratis (bonus 40% off)',
			'Mulai top-up dari $1, jadi gak harus all-in kayak founder baru dapet funding',
			'Maksimal top-up $60.000 dan bonus sampai $40.000 per orang untuk voucher',
			'Bisa apply $200 developer credits kalau ikut campaign Get 40% Off',
			'Developer credits berlaku 30 hari setelah disetujui'
		],
		validity: 'Reviewer menyarankan klaim maksimal 17 Juni 2026',
		requirements: [
			'Buka campaign rules TokenRouter dan login ke akun kamu',
			'Top-up minimal $1 untuk mulai klaim bonus',
			'Klaim sebelum 17 Juni 2026 supaya aman dari batas campaign menurut reviewer yang sudah pakai',
			'Untuk $200 developer credits, ikut dulu campaign Get 40% Off lalu submit form klaim',
			'Pastikan kamu cek rules resmi karena approval dan voucher bisa punya ketentuan tambahan'
		],
		tips: 'Kalau modal masih tipis, mulai dari $1 dulu. Kejar sebelum 17 Juni 2026 biar gak mepet dan jangan lupa baca campaign rules.',
		contributor: {
			name: '!mika',
			url: 'https://www.mikacend.xyz/'
		},
		ctaLink: 'https://www.tokenrouter.com/campaign-rules',
		tags: ['AI Credits', 'Model API', 'Top-up Bonus'],
		featured: false,
		status: 'active'
	}
	,
	{
		id: 'deepseek-free-token',
		title: 'DeepSeek 5M Token Gratis buat Ngoding AI',
		provider: 'DeepSeek',
		description: 'DeepSeek ngasih free tier 5M token pas signup buat developer yang mau cobain model AI tanpa kartu kredit. Cocok buat eksperimen chat, reasoning, dan integrasi API sebelum dompet ikut mikir keras.',
		benefits: [
			'5M token gratis saat signup',
			'Tidak perlu kartu kredit',
			'Akses model deepseek-chat dan deepseek-reasoner',
			'Context sampai 128K dan output sampai 8K',
			'Base URL kompatibel API: https://api.deepseek.com/v1'
		],
		validity: 'Credit berlaku 30 hari setelah signup',
		requirements: [
			'Daftar atau login akun DeepSeek',
			'Generate API key di dashboard DeepSeek',
			'Gunakan API key dengan base URL https://api.deepseek.com/v1',
			'Cek lagi ketentuan resmi karena ini data agregator, bukan verifier'
		],
		tips: 'Gas buat prototype dulu, tapi jangan taruh API key di frontend. Developer jelata juga wajib punya secret management.',
		contributor: {
			name: 'TokenGratis.id',
			url: 'https://www.tokengratis.id/provider/deepseek'
		},
		ctaLink: 'https://platform.deepseek.com/api_keys',
		tags: [
			'AI Credits',
			'Model API',
			'No Credit Card',
			'Free Tier'
		],
		featured: true,
		status: 'active'
	}
	,
	{
		id: 'inceptionlabs-get-started',
		title: '10M Free Token Inception Platform',
		provider: 'Inception',
		description: 'Buat akun Inception Platform, dapetin bonus 10 juta token gratis buat ngoprek Mercury 2 API tanpa bayar dulu, biar bisa langsung test AI API integration kamu.',
		benefits: [
			'Bonus 10.000.000 token gratis untuk user baru',
			'API key langsung bisa dipakai setelah daftar',
			'OpenAI-compatible API endpoint https://api.inceptionlabs.ai/v1',
			'Model Mercury 2 bisa dipakai dari request chat',
			'Kompatibel dengan client library populer (AISuite, LiteLLM, LangChain, OpenAI Client, VercelAI)'
		],
		validity: 'Bonus berlaku untuk akun baru saat registrasi (10M token saldo awal)',
		requirements: [
			'Buat akun Inception Platform',
			'Buat API key di halaman API Keys',
			'Gunakan Authorization header dengan INCEPTION_API_KEY',
			'Akses endpoint https://api.inceptionlabs.ai/v1',
			'Isi data sesuai kebutuhan API docs',
			'Tambahkan billing jika butuh lanjut setelah kuota habis'
		],
		contributor: {
			name: 'wauputra',
			url: 'https://wau.my.id/'
		},
		ctaLink: 'https://docs.inceptionlabs.ai/get-started/get-started',
		tags: [
			'AI Credits',
			'OpenAI Compatible',
			'API',
			'Free Tier'
		],
		featured: false,
		status: 'active'
	}
	,
	{
		id: 'kimchi-dev-serverless-ai',
		title: 'Kimchi.dev $50/Bulan Serverless AI Credit',
		provider: 'Kimchi.dev',
		description: 'Dapatkan saldo Serverless AI sebesar $50 setiap bulan dari Kimchi.dev secara gratis tanpa syarat kartu kredit. Cocok bagi developer yang ingin bereksperimen dan membangun aplikasi AI.',
		benefits: [
			'$50 Serverless AI credit per bulan',
			'Tanpa syarat kartu kredit'
		],
		validity: 'Selamanya',
		requirements: [
			'Daftar akun di Kimchi.dev',
			'Verifikasi alamat email'
		],
		contributor: {
			name: 'DevERS',
			url: 'https://renzlab.my.id'
		},
		ctaLink: 'https://kimchi.dev',
		tags: [
			'AI Credits',
			'Serverless',
			'No Credit Card',
			'Gratisan'
		],
		featured: false,
		status: 'active'
	}
];

export const latestBansos = (limit = 3) => bansosList.slice(-limit).reverse();

export const allBansosTags = Array.from(new Set(bansosList.flatMap((item) => item.tags))).sort(
	(a, b) => a.localeCompare(b)
);

export function getBansosById(id: string) {
	return bansosList.find((item) => item.id === id);
}

export function getBansosByTag(tag: string) {
	return bansosList.filter((item) => item.tags.includes(tag));
}
