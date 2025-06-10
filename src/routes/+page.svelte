<script lang="ts">
	import OutlineLists from '$lib/components/OutlineLists.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import Content from '$lib/components/Content.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div class="sidebar bg-gray-200">
		<div>
			<h1>Title</h1>
			<ul>
				<li><a href="/">List 1</a></li>
				<li><a href="/">List 2</a></li>
				<li><a href="/">List 3</a></li>
			</ul>
		</div>
		<div class="user-info">
			<div class="user-profile">
				{#if data.user.picture}
					<img src={data.user.picture} alt={data.user.name} class="avatar" />
				{/if}
				<div>
					<p class="break-words text-ellipsis">{data.user.name}</p>
				</div>
			</div>
			<a href="/auth/logout" class="logout-btn">Sign Out</a>
		</div>
	</div>
	<Content />
	<Preview />
</section>

<style lang="postcss">
	@import 'tailwindcss';

	.sidebar {
		@apply flex h-full flex-col justify-between;
		width: 25%;
		padding: 24px;
	}

	.user-info {
		@apply flex flex-col px-2 py-4;
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
	}

	.user-profile {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 0 12px 0;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.user-profile h2 {
		margin: 0;
		font-size: 18px;
		color: #1f2937;
	}

	.user-profile p {
		margin: 0;
		font-size: 14px;
		color: #6b7280;
	}

	.logout-btn:hover {
		text-decoration: underline;
	}

	section {
		display: flex;
		flex-direction: row;
		gap: 24px;
		height: calc(100vh - 73px);
	}
</style>
