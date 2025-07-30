<script lang="ts">
	import { toast } from '$lib/stores/toast.js';
	import Toast from './Toast.svelte';

	$: toasts = $toast;
</script>

<div class="toast-container">
	{#each toasts as toastData (toastData.id)}
		<div class="toast-wrapper">
			<Toast
				message={toastData.message}
				type={toastData.type}
				duration={0}
				show={true}
				onclose={() => toast.remove(toastData.id)}
			/>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 24rem;
	}

	.toast-wrapper {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.toast-container {
			bottom: 0.5rem;
			right: 0.5rem;
			left: 0.5rem;
			max-width: none;
		}
	}
</style>
