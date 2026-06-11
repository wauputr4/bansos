<script lang="ts">
	import BansosCard from '$lib/components/BansosCard.svelte';
	import { allBansosTags, bansosList, getBansosByTag } from '$lib/data/bansos';

	let selectedTag = $state('Semua');
	const filteredBansos = $derived(
		selectedTag === 'Semua' ? bansosList : getBansosByTag(selectedTag)
	);

	function spawnEmoji(e: MouseEvent, text: string) {
		const emoji = {
			id: Math.random(),
			x: e.clientX,
			y: e.clientY,
			text
		};
		floatingEmojis = [...floatingEmojis, emoji];
		setTimeout(() => {
			floatingEmojis = floatingEmojis.filter((i) => i.id !== emoji.id);
		}, 1000);
	}
</script>

<svelte:head>
	<title>Daftar Bantuan Sosial Developer - bansos.dev</title>
	<meta name="description" content="Temukan berbagai program bantuan sosial (bansos), diskon, dan gratisan tools khusus untuk developer dan programmer Indonesia." />
</svelte:head>

<main class="page-wrapper">
	<div class="glow-orb list-glow"></div>

	<!-- Header -->
	<header class="feed-header container">
		<h1 class="section-title">
			<span>📦 Semua Info Bansos Aktif</span>
			<svg class="anxious-icon inline-anxious" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M25 25 H75 L70 75 C69 80 64 84 59 84 H41 C36 84 31 80 30 75 Z" fill="var(--bg-secondary)" stroke="var(--color-success)" stroke-width="4"/>
				<path d="M75 35 H85 C90 35 93 39 93 44 V56 C93 61 90 65 85 65 H73" stroke="var(--color-success)" stroke-width="4" stroke-linecap="round" fill="none"/>
				<path d="M40 10 Q43 14 40 18 M50 8 Q53 13 50 18 M60 10 Q63 14 60 18" stroke="var(--text-muted)" stroke-width="3" stroke-linecap="round" fill="none"/>
				<path d="M34 43 Q39 40 44 43 M52 43 Q57 40 62 43" stroke="var(--text-primary)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
				<circle cx="39" cy="49" r="3" fill="var(--text-primary)"/>
				<circle cx="57" cy="49" r="3" fill="var(--text-primary)"/>
				<path d="M44 58 Q48 55 52 58 T56 58" stroke="var(--text-primary)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
				<path class="sweat-drop" d="M68 44 C68 47 66.5 49 65 49 C63.5 49 63.5 47 65 44 C66 42 67.5 40 68 38 Z" fill="#38bdf8"/>
			</svg>
		</h1>
		<p class="subtitle-text text-pretty">Klik kartu bansos untuk melihat langkah-langkah detail dan cara klaim kodenya, fr fr! 🚀</p>
	</header>

	<section class="tag-section container" aria-label="Filter tag bansos">
		<button class:active={selectedTag === 'Semua'} onclick={() => (selectedTag = 'Semua')}>
			Semua
		</button>
		{#each allBansosTags as tag}
			<button class:active={selectedTag === tag} onclick={() => (selectedTag = tag)}>
				{tag}
			</button>
		{/each}
	</section>

	<!-- Grid List -->
	<section class="feed-section container">
		<div class="bansos-grid">
			{#each filteredBansos as item (item.id)}
				<BansosCard {item} />
			{/each}
		</div>
	</section>

</main>

<style>
	.page-wrapper {
		position: relative;
		padding-block: 3rem;
		display: flex;
		flex-direction: column;
		gap: 3.5rem;
		z-index: 1;
	}

	.list-glow {
		top: -15rem;
		left: 50%;
		transform: translateX(-50%);
		background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%);
	}

	.feed-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-title {
		font-size: var(--font-size-h2);
		font-weight: 800;
		letter-spacing: -0.02em;
		display: flex;
		align-items: center;
	}

	.subtitle-text {
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.tag-section {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding-block: 0.25rem;
		scrollbar-width: none;
	}

	.tag-section::-webkit-scrollbar {
		display: none;
	}

	.tag-section button {
		flex: 0 0 auto;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 750;
		padding: 0.5rem 0.8rem;
		cursor: pointer;
	}

	.tag-section button.active {
		border-color: rgba(16, 185, 129, 0.55);
		background: rgba(16, 185, 129, 0.14);
		color: var(--text-primary);
	}

	.feed-section {
		min-height: 40vh;
	}

	.bansos-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.inline-anxious {
		width: 2.25rem;
		height: 2.25rem;
		vertical-align: middle;
		margin-left: 0.5rem;
	}

	.anxious-icon:hover {
		animation: shake 0.4s infinite alternate;
	}

	.sweat-drop {
		animation: drip 1.8s infinite ease-in;
		transform-origin: center;
	}

	@keyframes pulse {
		0% { transform: scale(1); }
		100% { transform: scale(1.1); }
	}

	@keyframes shake {
		0% { transform: translate(1px, 1px) rotate(0deg); }
		10% { transform: translate(-1px, -2px) rotate(-1deg); }
		20% { transform: translate(-3px, 0px) rotate(1deg); }
		30% { transform: translate(0px, 2px) rotate(0deg); }
		40% { transform: translate(1px, -1px) rotate(1deg); }
		50% { transform: translate(-1px, 2px) rotate(-1deg); }
		60% { transform: translate(-3px, 1px) rotate(0deg); }
		70% { transform: translate(2px, 1px) rotate(-1deg); }
		80% { transform: translate(-1px, -1px) rotate(1deg); }
		90% { transform: translate(2px, 2px) rotate(0deg); }
		100% { transform: translate(1px, -2px) rotate(-1deg); }
	}

	@keyframes drip {
		0% { transform: translateY(-4px); opacity: 0; }
		20% { opacity: 1; }
		80% { opacity: 0.8; }
		100% { transform: translateY(12px); opacity: 0; }
	}

	@media (min-width: 48rem) {
		.bansos-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
