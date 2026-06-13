<script lang="ts">
	import { resolve } from '$app/paths';
	import GithubBadge from './GithubBadge.svelte';
	import { page } from '$app/stores';
	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Beranda', icon: 'fa-solid fa-house' },
		{ href: '/list', label: 'Bansos', icon: 'fa-solid fa-list' },
		{ href: '/contribute', label: 'Kontribusi', icon: 'fa-solid fa-plus' },
		{ href: '/about', label: 'Tentang', icon: 'fa-solid fa-circle-question' }
	] as const;

	function isActivePath(pathname: string, href: string) {
		return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
	}
</script>

<svelte:head>
	<meta name="theme-color" content="#090a0f" />
</svelte:head>

<div class="site-shell">
	<header class="site-header">
		<nav class="container nav-shell" aria-label="Navigasi utama">
			<a href={resolve('/')} class="brand-mark">bansos.dev</a>
			<div class="desktop-nav">
				{#each navItems as item (item.href)}
					<a
						href={resolve(item.href)}
						class={isActivePath($page.url.pathname, item.href) ? 'active' : ''}>{item.label}</a
					>
				{/each}
			</div>
			<GithubBadge />
		</nav>
	</header>

	{@render children()}

	<footer class="site-footer">
		<div class="container footer-inner">
			<p>© 2026 <a href={resolve('/')}>bansos.dev</a>. Bantuan sosial untuk developer jelata.</p>
			<div class="footer-links">
				<a href={resolve('/about')}>Tentang</a>
				<a href={resolve('/contribute')}>Kontribusi</a>
				<span class="dot">·</span>
				<a href="https://github.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer"
					>Open Source</a
				>
			</div>
		</div>
	</footer>

	<nav class="mobile-bottom-nav" aria-label="Navigasi mobile">
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
		background: rgba(9, 10, 15, 0.82);
		backdrop-filter: blur(18px);
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
		color: var(--text-primary);
		font-size: 1rem;
		font-weight: 850;
		letter-spacing: 0;
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
		background: rgba(255, 255, 255, 0.05);
	}

	.desktop-nav a.active {
		color: var(--color-accent);
		background: rgba(16, 185, 129, 0.1);
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
		gap: 0.5rem;
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

	.mobile-bottom-nav {
		position: fixed;
		left: 0.75rem;
		right: 0.75rem;
		bottom: 0.75rem;
		z-index: 60;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.25rem;
		padding: 0.35rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: rgba(9, 10, 15, 0.9);
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
	}
</style>
