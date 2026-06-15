<script lang="ts">
	let { searchQuery = $bindable(''), placeholder = 'Cari...' } = $props();
</script>

<label class="search-box">
	<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
	<input type="search" bind:value={searchQuery} {placeholder} aria-label={placeholder} />
	{#if searchQuery}
		<button type="button" aria-label="Bersihkan pencarian" onclick={() => (searchQuery = '')}>
			<i class="fa-solid fa-xmark"></i>
		</button>
	{/if}
</label>

<style>
	.search-box {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border: 1px solid var(--glass-border);
		border-radius: 1rem;
		background: linear-gradient(var(--glass-bg), var(--glass-bg)) var(--bg-primary);
		padding: 0.85rem 1rem;
		color: var(--text-secondary);
	}

	.search-box:focus-within {
		border-color: color-mix(in srgb, var(--color-accent) 55%, var(--border-color));
		box-shadow: 0 0 0 3px var(--color-accent-glow);
	}

	.search-box input {
		width: 100%;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text-primary);
		font: inherit;
		font-weight: 650;
		min-width: 0;
	}

	.search-box button {
		border: 0;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		font: inherit;
	}
</style>
