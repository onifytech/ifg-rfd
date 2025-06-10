<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="app">
	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	main {
		/* max-width: 64rem; */
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
