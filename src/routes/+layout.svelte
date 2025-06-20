<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="app">
	<main class="min-h-screen">
		{@render children()}
	</main>
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
