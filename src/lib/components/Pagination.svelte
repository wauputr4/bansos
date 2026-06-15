<script lang="ts">
	let {
		currentPage = $bindable(1),
		totalPages,
		scrollTargetSelector = '.controls-section'
	}: { currentPage: number; totalPages: number; scrollTargetSelector?: string } = $props();

	function handlePageChange(page: number) {
		if (page !== currentPage) {
			currentPage = page;
			const scrollTarget = document.querySelector(scrollTargetSelector);
			if (scrollTarget) {
				const y = (scrollTarget as HTMLElement).getBoundingClientRect().top + window.scrollY - 80;
				window.scrollTo({ top: y, behavior: 'smooth' });
			}
		}
	}

	let showJumpModal = $state(false);
	let jumpInput = $state('');
	let jumpError = $state('');

	// Accessibility: Escape key handling
	function handleWindowKeydown(e: KeyboardEvent) {
		if (showJumpModal && e.key === 'Escape') {
			showJumpModal = false;
		}
	}

	function openJumpModal() {
		jumpInput = currentPage.toString();
		jumpError = '';
		showJumpModal = true;
	}

	function focusInput(node: HTMLInputElement) {
		setTimeout(() => node.focus(), 10);
	}

	function executeJump() {
		const val = parseInt(jumpInput, 10);
		if (isNaN(val) || val < 1 || val > totalPages) {
			jumpError = `Harap masukkan angka antara 1 dan ${totalPages}`;
			return;
		}
		handlePageChange(val);
		showJumpModal = false;
	}

	const visiblePages = $derived.by(() => {
		const total = totalPages;
		const current = currentPage;

		if (total <= 5) {
			const range = [];
			for (let i = 1; i <= total; i++) range.push(i);
			return range;
		}

		if (current <= 3) {
			return [1, 2, 3, 4, '...', total];
		}

		if (current >= total - 2) {
			return [1, '...', total - 3, total - 2, total - 1, total];
		}

		return [1, '...', current - 1, current, current + 1, '...', total];
	});
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if totalPages > 1}
	<nav class="pagination" aria-label="Pagination">
		<button
			type="button"
			class="page-btn hide-mobile"
			aria-label="Halaman pertama"
			disabled={currentPage === 1}
			onclick={() => handlePageChange(1)}
		>
			<i class="fa-solid fa-angles-left"></i>
		</button>
		<button
			type="button"
			class="page-btn"
			aria-label="Halaman sebelumnya"
			disabled={currentPage === 1}
			onclick={() => handlePageChange(Math.max(1, currentPage - 1))}
		>
			<i class="fa-solid fa-chevron-left"></i>
		</button>

		{#each visiblePages as pageItem, i (i)}
			{#if pageItem === '...'}
				<button
					type="button"
					class="page-btn page-dots"
					aria-label="Lompat halaman"
					onclick={openJumpModal}
				>
					...
				</button>
			{:else}
				<button
					type="button"
					class="page-btn"
					class:active={currentPage === pageItem}
					aria-current={currentPage === pageItem ? 'page' : undefined}
					onclick={() => handlePageChange(pageItem as number)}
				>
					{pageItem}
				</button>
			{/if}
		{/each}

		<button
			type="button"
			class="page-btn"
			aria-label="Halaman berikutnya"
			disabled={currentPage === totalPages}
			onclick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
		>
			<i class="fa-solid fa-chevron-right"></i>
		</button>
		<button
			type="button"
			class="page-btn hide-mobile"
			aria-label="Halaman terakhir"
			disabled={currentPage === totalPages}
			onclick={() => handlePageChange(totalPages)}
		>
			<i class="fa-solid fa-angles-right"></i>
		</button>
	</nav>
{/if}

{#if showJumpModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="modal-backdrop"
		onpointerdown={(e) => {
			if (e.target === e.currentTarget) showJumpModal = false;
		}}
	>
		<div
			class="modal-content glass-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby="jump-modal-title"
		>
			<h3 id="jump-modal-title">Lompat Halaman</h3>
			<p>Pilih halaman antara 1 hingga {totalPages}</p>
			<input
				type="number"
				min="1"
				max={totalPages}
				bind:value={jumpInput}
				use:focusInput
				placeholder={`1 - ${totalPages}`}
				onkeydown={(e) => e.key === 'Enter' && executeJump()}
				oninput={() => (jumpError = '')}
			/>
			{#if jumpError}
				<span class="error-text"><i class="fa-solid fa-circle-exclamation"></i> {jumpError}</span>
			{/if}
			<div class="modal-actions">
				<button class="btn-secondary" onclick={() => (showJumpModal = false)}>Batal</button>
				<button class="btn-primary" onclick={executeJump}>Pindah</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.pagination {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 2rem;
		align-items: center;
	}

	.page-btn {
		min-width: 2.5rem;
		height: 2.5rem;
		padding: 0 0.5rem;
		border: 1px solid var(--border-color);
		background: color-mix(in srgb, var(--text-primary) 3%, transparent);
		color: var(--text-secondary);
		border-radius: 0.5rem;
		font-weight: 700;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.page-dots {
		background: transparent;
		border-color: transparent;
		color: var(--text-muted);
		font-weight: 700;
	}

	.page-dots:hover:not(:disabled) {
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
	}

	.page-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
		color: var(--text-primary);
	}

	.page-btn.active {
		background: var(--color-accent);
		color: #ffffff;
		border-color: var(--color-accent);
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 48rem) {
		.hide-mobile {
			display: none !important;
		}
		.page-btn {
			min-width: 1.8rem;
			height: 2.2rem;
			font-size: 0.85rem;
			padding: 0 0.2rem;
		}
		.pagination {
			gap: 0.25rem;
		}
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal-content {
		width: 100%;
		max-width: 22rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: var(--bg-primary);
		padding: 1.5rem;
		border-radius: 1rem;
		border: 1px solid var(--border-color);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
	}

	.modal-content h3 {
		font-size: 1.1rem;
		color: var(--text-primary);
		margin: 0;
	}

	.modal-content p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.modal-content input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1rem;
		font-weight: 600;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.modal-content input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-glow);
	}

	.modal-content input::-webkit-outer-spin-button,
	.modal-content input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.modal-content input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.error-text {
		color: var(--color-danger);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.modal-actions button {
		padding: 0.5rem 1.25rem;
		font-size: 0.9rem;
		min-height: 2.2rem;
	}
</style>
