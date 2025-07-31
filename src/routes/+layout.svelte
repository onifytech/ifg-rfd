<script lang="ts">
	import '../app.css';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from '$lib/components/Loading.svelte';

	let { children } = $props();
	let navigating = $state(false);

	onMount(() => {
		beforeNavigate(() => (navigating = true));
		afterNavigate(() => (navigating = false));
	});
</script>

{#if navigating}
	<Loading />
{/if}

<div class="app">
	<main class="min-h-screen">
		{@render children()}
	</main>
	<ToastContainer />
</div>

<style>
	.app {
		/* Establish baseline grid foundation */
		line-height: 1.5rem; /* 24px baseline */
		font-size: 1rem; /* 16px base font size */
	}

	main {
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
