<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { t, switchLocale, ALL_LANGUAGES, availableCodes, type SupportedLocale } from '$lib/i18n';
	import { locale } from 'svelte-i18n';
	let { children } = $props();
	type ThemeMode = 'dark' | 'light';

	const THEME_KEY = 'bansos-theme';
	let theme: ThemeMode = $state('dark');

	let scrollY = $state(0);
	let lastY = 0;
	let hideNavbar = $state(false);
	let langExpanded = $state(false);
	let hoveredLangCode = $state<string | null>(null);

	const languages = ALL_LANGUAGES.filter((lang) =>
		availableCodes.includes(lang.code as SupportedLocale)
	) as { code: SupportedLocale; name: string; hoverName?: string }[];

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && langExpanded) {
			langExpanded = false;
		}
	}

	$effect(() => {
		if (scrollY > lastY && scrollY > 60) {
			hideNavbar = true;
		} else if (scrollY < lastY) {
			hideNavbar = false;
		}
		lastY = scrollY;
	});

	let navItems = $derived([
		{ href: '/' as const, label: $t('nav.home'), icon: 'fa-solid fa-house' },
		{ href: '/list' as const, label: $t('nav.bansos'), icon: 'fa-solid fa-list' },
		{ href: '/contribute' as const, label: $t('nav.contribute'), icon: 'fa-solid fa-plus' },
		{ href: '/providers' as const, label: $t('nav.providers'), icon: 'fa-solid fa-server' },
		{ href: '/about' as const, label: $t('nav.about'), icon: 'fa-solid fa-circle-question' }
	]);

	function isActivePath(pathname: string, href: string) {
		return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
	}

	$effect(() => {
		document.documentElement.dataset.theme = theme;
	});

	onMount(() => {
		const storedTheme = localStorage.getItem(THEME_KEY);
		const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches
			? 'light'
			: 'dark';
		const initialTheme =
			storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;
		theme = initialTheme;
		setTimeout(() => document.body.classList.add('theme-transition'), 50);
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem(THEME_KEY, theme);
	}
</script>

<svelte:head>
	<meta name="theme-color" content={theme === 'light' ? '#f8fafc' : '#090a0f'} />
</svelte:head>

<svelte:window bind:scrollY onkeydown={handleKeydown} />
<div class="site-shell">
	<header class="site-header" class:nav-hidden={hideNavbar}>
		<nav class="container nav-shell" aria-label={$t('nav.mainAria')}>
			<a href={resolve('/')} class="brand-mark" aria-label={$t('nav.brandAria')}>
				<div class="logo-container">
					<div class="logo-main"><span class="ban">ban</span><span class="sos">sos</span></div>
					<div class="logo-sub">
						<span class="line"></span>
						<span class="dev">.dev</span>
						<span class="line"></span>
					</div>
				</div>
			</a>
			<div class="desktop-nav">
				{#each navItems as item (item.href)}
					<a
						href={resolve(item.href)}
						class={isActivePath($page.url.pathname, item.href) ? 'active' : ''}>{item.label}</a
					>
				{/each}
			</div>
			<div class="nav-actions">
				<a
					href="https://github.com/wauputr4/bansos"
					target="_blank"
					rel="noopener noreferrer"
					class="icon-btn"
					aria-label="GitHub Repository"
				>
					<i class="fa-brands fa-github"></i>
				</a>
				<button
					type="button"
					class="icon-btn"
					onclick={toggleTheme}
					aria-label={theme === 'light' ? $t('theme.darkAria') : $t('theme.lightAria')}
				>
					<i class={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} aria-hidden="true"
					></i>
				</button>
				<div class="lang-switcher-wrapper">
					<button
						type="button"
						class="icon-btn"
						onclick={() => (langExpanded = !langExpanded)}
						aria-expanded={langExpanded}
						aria-label={$t('lang.switchTo')}
						title={$t('lang.switchTo')}
					>
						<i class="fa-solid fa-globe"></i>
					</button>
					{#if langExpanded}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="dropdown-backdrop" onclick={() => (langExpanded = false)}></div>
						<div class="lang-dropdown" role="menu">
							{#each languages as lang (lang.code)}
								<button
									role="menuitem"
									class="lang-option"
									class:active={$locale === lang.code}
									onclick={() => {
										switchLocale(lang.code as SupportedLocale);
										langExpanded = false;
									}}
									onmouseenter={() => (hoveredLangCode = lang.code)}
									onmouseleave={() => (hoveredLangCode = null)}
								>
									<span class="lang-name-wrapper">
										<span class="lang-name lang-name-hidden" aria-hidden="true">{lang.name}</span>
										{#if lang.hoverName}
											<span class="lang-name lang-name-hidden" aria-hidden="true"
												>{lang.hoverName}</span
											>
										{/if}
										<span class="lang-name lang-name-visible">
											{hoveredLangCode === lang.code && lang.hoverName ? lang.hoverName : lang.name}
										</span>
									</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</nav>
	</header>

	{@render children()}

	<footer class="site-footer">
		<div class="container footer-inner">
			<div class="footer-left">
				<p>© 2026 <a href={resolve('/')}>bansos.dev</a>. {$t('footer.tagline')}</p>
				<a
					href="https://github.com/sponsors/wauputr4"
					target="_blank"
					rel="noopener noreferrer"
					class="sponsor-link"
				>
					<i class="fa-regular fa-heart"></i>
					{$t('footer.sponsor')}
				</a>
			</div>
			<div class="footer-links">
				<a href={resolve('/about')}>{$t('footer.about')}</a>
				<span class="dot">·</span>
				<a href={resolve('/providers')}>{$t('footer.providers')}</a>
				<span class="dot">·</span>
				<a href={resolve('/contribute')}>{$t('footer.contribute')}</a>
				<span class="dot">·</span>
				<a href={resolve('/terms')}>{$t('footer.terms')}</a>
				<span class="dot">·</span>
				<a href="https://gitlab.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer"
					>{$t('footer.openSource')}</a
				>
				<span class="dot">·</span>
				<a href="https://github.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer"
					>GitHub</a
				>
				<span class="dot">·</span>
				<a
					href="https://discord.gg/m4WFaQpNGs"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Discord"
					class="social-footer-link"
				>
					<i class="fa-brands fa-discord"></i>
				</a>
				<a
					href="https://t.me/bansos_dev"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Telegram"
					class="social-footer-link"
				>
					<i class="fa-brands fa-telegram"></i>
				</a>
				<a
					href="https://github.com/wauputr4/bansos"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					class="social-footer-link"
				>
					<i class="fa-brands fa-github"></i>
				</a>
				<a
					href="https://whatsapp.com/channel/0029Vb8ZXgW1Hsq7j1uhRm0G"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="WhatsApp"
					class="social-footer-link"
				>
					<i class="fa-brands fa-whatsapp"></i>
				</a>
				<a
					href="mailto:submit@bansos.dev"
					aria-label="Email"
					class="social-footer-link email-footer-link"
				>
					<i class="fa-regular fa-envelope"></i>
				</a>
			</div>
		</div>
	</footer>

	<nav class="mobile-bottom-nav" aria-label={$t('nav.mobileAria')}>
		{#each navItems as item (item.href)}
			<a
				href={resolve(item.href)}
				class={isActivePath($page.url.pathname, item.href) ? 'active' : ''}
			>
				<span aria-hidden="true"><i class={item.icon}></i></span>
				{item.label}
			</a>
		{/each}
	</nav>
</div>

<style>
	.site-shell {
		min-height: 100vh;
		padding-bottom: 5rem;
	}

	.site-header {
		position: sticky;
		top: -1px;
		padding-top: 1px;
		z-index: 50;
		border-bottom: 1px solid var(--border-color);
		background: color-mix(in srgb, var(--bg-primary) 86%, transparent);
		backdrop-filter: blur(18px);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.site-header.nav-hidden {
		transform: translateY(-110%);
	}

	.nav-shell {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 3.5rem;
		position: relative;
	}

	.brand-mark {
		text-decoration: none;
	}

	.logo-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
	}

	.logo-main {
		font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.03em;
	}

	.logo-main .ban {
		color: var(--text-primary);
	}

	.logo-main .sos {
		color: #10b981;
	}

	.logo-sub {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 0.3rem;
		margin-top: -0.15rem;
	}

	.logo-sub .line {
		flex: 1;
		height: 2px;
		background: #10b981;
	}

	.logo-sub .dev {
		font-family: 'Plus Jakarta Sans', monospace;
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--text-primary);
	}

	.desktop-nav {
		display: none;
		align-items: center;
		gap: 0.25rem;
	}

	.desktop-nav a {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 700;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
	}

	.desktop-nav a:hover {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
	}

	.desktop-nav a.active {
		color: var(--color-accent);
		background: rgba(16, 185, 129, 0.1);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s,
			border-color 0.2s;
	}

	.icon-btn:hover {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
		border-color: var(--text-secondary);
	}

	.lang-switcher-wrapper {
		position: relative;
	}

	.dropdown-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		cursor: default;
	}

	.lang-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		width: max-content;
		min-width: 140px;
		max-height: 250px;
		overflow-y: auto;
		padding: 0.5rem;
		z-index: 50;
		border-radius: 0.75rem;
		background: linear-gradient(
				var(--glass-bg, rgba(255, 255, 255, 0.05)),
				var(--glass-bg, rgba(255, 255, 255, 0.05))
			)
			var(--bg-primary);
		border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		animation: dropdown-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.lang-dropdown::-webkit-scrollbar {
		width: 6px;
	}

	.lang-dropdown::-webkit-scrollbar-track {
		background: transparent;
	}

	.lang-dropdown::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.lang-option {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 1rem;
		padding: 0.75rem 1rem;
		text-align: left;
		background: transparent;
		border: none;
		border-radius: 0.5rem;
		color: var(--text-secondary);
		cursor: pointer;
		font-family: inherit;
		transition: all 0.2s;
	}

	.lang-option:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-primary);
	}

	.lang-option.active {
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-success);
	}

	.lang-name-wrapper {
		display: grid;
	}

	.lang-name-wrapper > span {
		grid-area: 1 / 1;
	}

	.lang-name-hidden {
		visibility: hidden;
		pointer-events: none;
	}

	.lang-name-visible {
		visibility: visible;
	}

	.lang-name {
		font-weight: 600;
		font-size: 0.85rem;
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.site-footer {
		border-top: 1px solid var(--border-color);
		padding-block: 1.5rem;
		color: var(--text-muted);
		font-size: 0.9rem;
		text-align: center;
	}

	.footer-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.footer-left {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.sponsor-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: #fff;
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
		box-shadow: 0 4px 14px rgba(236, 72, 153, 0.3);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		width: max-content;
		text-decoration: none;
	}

	.sponsor-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
		color: #fff;
	}

	.sponsor-link i {
		font-size: 0.9rem;
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}

	.footer-links .dot {
		color: var(--text-muted);
		opacity: 0.5;
	}

	.social-footer-link {
		display: inline-flex;
		align-items: center;
		font-size: 1.05rem;
		color: var(--text-secondary);
		transition: color 0.2s ease;
		vertical-align: middle;
	}

	.social-footer-link:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	.mobile-bottom-nav {
		position: fixed;
		left: 0.75rem;
		right: 0.75rem;
		bottom: 0.75rem;
		z-index: 60;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		padding: 0.35rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: color-mix(in srgb, var(--bg-primary) 92%, transparent);
		backdrop-filter: blur(18px);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
	}

	.mobile-bottom-nav a {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		min-height: 3rem;
		border-radius: 0.75rem;
		color: var(--text-secondary);
		font-size: 0.65rem;
		font-weight: 750;
		text-align: center;
	}

	.mobile-bottom-nav span {
		color: var(--text-secondary);
		font-size: 1.15rem;
		line-height: 1;
		transition: color 0.2s;
	}

	.mobile-bottom-nav a:hover,
	.mobile-bottom-nav a.active {
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-accent);
	}

	.mobile-bottom-nav a:hover span,
	.mobile-bottom-nav a.active span {
		color: var(--color-accent);
	}

	@media (min-width: 48rem) {
		.site-shell {
			padding-bottom: 0;
		}

		.desktop-nav {
			display: flex;
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
		}

		.mobile-bottom-nav {
			display: none;
		}

		.footer-inner {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			text-align: left;
		}

		.footer-left {
			align-items: flex-start;
			gap: 0.75rem;
		}
	}
</style>
