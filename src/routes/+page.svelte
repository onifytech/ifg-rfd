<script lang="ts">
	import OutlineLists from '$lib/components/OutlineLists.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import Content from '$lib/components/Content.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<OutlineLists />
	<Content />
	<Preview />
</section>

<style>
	section {
		display: flex;
		flex-direction: row;
		gap: 24px;
		height: 100vh;
	}
</style>
