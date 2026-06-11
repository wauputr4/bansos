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
