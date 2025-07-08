<script lang="ts">
	import { onMount } from 'svelte';

	export let message: string = '';
	export let type: 'success' | 'error' | 'info' | 'warning' = 'info';
	export let duration: number = 3000;
	export let show: boolean = false;
	export let onclose: (() => void) | undefined = undefined;
	let timeoutId: ReturnType<typeof setTimeout>;

	$: if (show && duration > 0) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			handleClose();
		}, duration);
	}

	function handleClose() {
		show = false;
		onclose?.();
	}

	onMount(() => {
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	$: typeClasses = {
		success: 'bg-green-600 text-white',
		error: 'bg-red-600 text-white',
		warning: 'bg-yellow-600 text-white',
		info: 'bg-blue-600 text-white'
	};

	$: typeIcon = {
		success: '✅',
		error: '❌',
		warning: '⚠️',
		info: 'ℹ️'
	};
</script>

{#if show}
	<div class="toast-container">
		<div class="toast {typeClasses[type]}" role="alert">
			<div class="toast-content">
				<span class="toast-icon">{typeIcon[type]}</span>
				<span class="toast-message">{message}</span>
			</div>
			<button class="toast-close" onclick={handleClose} aria-label="Close notification">
				×
			</button>
		</div>
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 9999;
		max-width: 24rem;
	}

	.toast {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		animation: slideIn 0.3s ease-out;
		min-width: 16rem;
	}

	.toast-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.toast-icon {
		flex-shrink: 0;
		font-size: 1rem;
	}

	.toast-message {
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.25rem;
	}

	.toast-close {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		font-size: 1.25rem;
		font-weight: bold;
		line-height: 1;
		margin-left: 0.75rem;
		padding: 0;
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	.toast-close:hover {
		opacity: 1;
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

		.toast {
			padding: 0.75rem;
		}

		.toast-message {
			font-size: 0.8rem;
		}
	}
</style>