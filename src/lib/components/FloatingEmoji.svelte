<script lang="ts">
	let { emojis }: { emojis: { id: number; x: number; y: number; text: string }[] } = $props();
</script>

{#each emojis as emoji (emoji.id)}
	<span class="floating-emoji" style="left: {emoji.x}px; top: {emoji.y}px;">
		{emoji.text}
	</span>
{/each}

<style>
	.floating-emoji {
		position: fixed;
		pointer-events: none;
		z-index: 9999;
		font-size: 2.5rem;
		animation: float-up-fade 0.8s forwards cubic-bezier(0.1, 0.8, 0.3, 1);
		transform: translate(-50%, -50%);
	}

	@keyframes float-up-fade {
		0% {
			transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -50%) scale(1.4) translateY(-100px) rotate(15deg);
			opacity: 0;
		}
	}
</style>
