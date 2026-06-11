<script lang="ts">
	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Home', icon: '⌂' },
		{ href: '/list', label: 'List', icon: '□' },
		{ href: '/contribute', label: 'Submit', icon: '+' },
		{ href: '/about', label: 'About', icon: '?' }
	];
</script>

<svelte:head>
	<meta name="theme-color" content="#090a0f" />
</svelte:head>

<div class="site-shell">
	<header class="site-header">
		<nav class="container nav-shell" aria-label="Navigasi utama">
			<a href="/" class="brand-mark">bansos.dev</a>
			<div class="desktop-nav">
				{#each navItems as item}
					<a href={item.href}>{item.label}</a>
				{/each}
			</div>
			<a href="https://github.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer" class="repo-link">
				GitHub
			</a>
		</nav>
	</header>

	{@render children()}

	<footer class="site-footer">
		<div class="container footer-inner">
			<p>© 2026 <a href="/">bansos.dev</a>. Bantuan sosial untuk developer jelata.</p>
			<div class="footer-links">
				<a href="/about">Tentang</a>
				<a href="/contribute">Kontribusi</a>
				<a href="https://github.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer">Open Source</a>
			</div>
		</div>
	</footer>

	<nav class="mobile-bottom-nav" aria-label="Navigasi mobile">
		{#each navItems as item}
			<a href={item.href}>
				<span aria-hidden="true">{item.icon}</span>
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
		top: 0;
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

	.desktop-nav a,
	.repo-link {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 700;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
	}

	.desktop-nav a:hover,
	.repo-link:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.repo-link {
		border: 1px solid var(--border-color);
	}

	.site-footer {
		border-top: 1px solid var(--border-color);
		padding-block: 1.5rem;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.footer-inner {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
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
		gap: 0.1rem;
		min-height: 3rem;
		border-radius: 0.75rem;
		color: var(--text-secondary);
		font-size: 0.72rem;
		font-weight: 750;
	}

	.mobile-bottom-nav span {
		color: var(--color-accent);
		font-size: 1.15rem;
		line-height: 1;
	}

	.mobile-bottom-nav a:hover {
		background: rgba(16, 185, 129, 0.1);
		color: var(--text-primary);
	}

	@media (min-width: 48rem) {
		.site-shell {
			padding-bottom: 0;
		}

		.desktop-nav {
			display: flex;
		}

		.mobile-bottom-nav {
			display: none;
		}

		.footer-inner {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}
</style>
