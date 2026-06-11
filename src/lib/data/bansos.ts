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
		ctaLink: 'https://www.name.com',
		tags: ['Domain', 'Gratisan', 'No Credit Card'],
		featured: true,
		status: 'active'
	},
	{
		id: 'tokenrouter-model-gateway',
		title: 'TokenRouter: Gateway API untuk 300+ Model AI',
		provider: 'TokenRouter',
		description: 'TokenRouter adalah hub model AI terpusat yang mengubah provider-model besar jadi endpoint OpenAI, Claude, dan Gemini yang konsisten buat workflow developer.',
		benefits: [
			'Satu titik akses API untuk banyak model AI: OpenAI, Claude, Gemini, Llama, Mistral, dan lainnya',
			'Bandingkan pricing antar model (browse & compare) langsung di halaman Models',
			'Punya tooling untuk manage API key, quota, wallet, dan usage log',
			'Cocok untuk tim yang mau routing model secara terpusat (terutama di workflow coding/automation)'
		],
		validity: 'Cek ketentuan resmi di situs (biasanya aktif terus, berubah sesuai promo/upgrade)',
		requirements: [
			'Buka https://www.tokenrouter.com',
			'Pastikan kebutuhan akses API kamu sesuai dengan fitur model yang dipakai',
			'Cek halaman billing/usage untuk memastikan budget dan limit kamu'
		],
		tips: 'Ini list resource produktivitas, bukan promo yang dikunci: cek apakah ada free credit/trial yang masih berlaku.',
		ctaLink: 'https://www.tokenrouter.com',
		tags: ['AI', 'Model API', 'Routing'],
		featured: false,
		status: 'active'
	}
];
