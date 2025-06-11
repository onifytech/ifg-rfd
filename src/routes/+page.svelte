<script lang="ts">
	import Preview from '$lib/components/Preview.svelte';
	import Content from '$lib/components/Content.svelte';
	import CreateRFD from '$lib/components/CreateRFD.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	type RFD = {
		id: string;
		rfdNumber: number;
		title: string;
		summary: string | null;
		status: string;
		authorId: string;
		authorName: string | null;
		authorEmail: string | null;
		googleDocUrl: string;
		tags: string | null;
		createdAt: string;
		updatedAt: string;
		endorsementCount: number;
		userHasEndorsed: boolean;
	};

	let selectedRfd: RFD | null = null;
	let showCreateModal = false;

	function handleRfdSelect(rfd: RFD) {
		selectedRfd = rfd;
	}

	function openCreateModal() {
		showCreateModal = true;
		// Prevent body scroll when modal is open
		document.body.style.overflow = 'hidden';
	}

	function closeCreateModal() {
		showCreateModal = false;
		// Restore body scroll
		document.body.style.overflow = '';
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div class="sidebar bg-gray-200">
		<div class="sidebar-content">
			<h1 class="sidebar-title">RFD Index</h1>
			<nav class="sidebar-nav">
				<ul class="nav-section">
					<li><a href="/" class="nav-link active">All RFDs</a></li>
					<li>
						<button onclick={openCreateModal} class="nav-link">Create RFD</button>
					</li>
					<li><a href="/?filter=recent" class="nav-link">Recent</a></li>
				</ul>
				<div class="nav-divider"></div>
				<p class="nav-section-title">By Status</p>
				<ul class="nav-section">
					<li><a href="/?status=draft" class="nav-link status-draft">Draft</a></li>
					<li><a href="/?status=review" class="nav-link status-review">Review</a></li>
					<li><a href="/?status=approved" class="nav-link status-approved">Approved</a></li>
					<li><a href="/?status=rejected" class="nav-link status-rejected">Rejected</a></li>
					<li><a href="/?status=archived" class="nav-link status-archived">Archived</a></li>
				</ul>
			</nav>
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
	<Content rfds={data.rfds} onRfdSelect={handleRfdSelect} {selectedRfd} />
	<Preview {selectedRfd} />
</section>

<!-- Create RFD Modal -->
{#if showCreateModal}
	<div class="modal-overlay" onclick={closeCreateModal}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2 class="modal-title">Create New RFD</h2>
			</div>
			<div class="modal-body">
				<CreateRFD on:close={closeCreateModal} />
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	@import 'tailwindcss';

	.sidebar {
		@apply flex flex-col justify-between;
		width: 25%;
		padding: 0;
		height: 100vh;
		position: sticky;
		top: 0;
		overflow-y: auto;
	}

	.sidebar-content {
		@apply flex-1 p-6;
	}

	.sidebar-title {
		@apply mb-6 text-xl font-bold text-gray-800;
		margin: 0;
	}

	.sidebar-nav {
		@apply space-y-4;
	}

	.nav-section {
		@apply space-y-2;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-section-title {
		@apply mb-2 text-sm font-medium tracking-wider text-gray-600 uppercase;
		margin: 0;
	}

	.nav-divider {
		@apply my-4 border-t border-gray-300;
	}

	.nav-link {
		@apply block w-full cursor-pointer rounded-md px-3 py-2 text-start text-sm text-gray-700 transition-colors duration-150;
		text-decoration: none;
	}

	.nav-link:hover {
		@apply bg-gray-300 text-gray-900;
	}

	.nav-link.active {
		@apply bg-blue-100 font-medium text-blue-700;
	}

	.status-draft {
		border-left: 4px solid #94a3b8;
	}

	.status-review {
		border-left: 4px solid #f59e0b;
	}

	.status-approved {
		border-left: 4px solid #10b981;
	}

	.status-rejected {
		border-left: 4px solid #ef4444;
	}

	.status-archived {
		border-left: 4px solid #6b7280;
	}

	.user-info {
		@apply flex flex-col px-6 py-4;
		background: #f8fafc;
		border-top: 1px solid #e2e8f0;
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
		min-height: 100vh;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		right: 0 !important;
		bottom: 0 !important;
		width: 100vw !important;
		height: 100vh !important;
		background-color: rgba(0, 0, 0, 0.5) !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		z-index: 9999 !important;
		padding: 1rem;
		margin: 0 !important;
		transform: none !important;
	}

	.modal-content {
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		width: 100%;
		max-width: 42rem;
		max-height: 90vh;
		overflow: hidden;
		margin: 0 1rem;
		position: relative;
	}

	.modal-header {
		@apply flex items-center justify-between border-b border-gray-200 p-6;
	}

	.modal-title {
		@apply m-0 text-xl font-bold text-gray-900;
	}

	.modal-close {
		@apply cursor-pointer border-none bg-transparent p-1 text-xl font-bold text-gray-400 hover:text-gray-600;
	}

	.modal-body {
		@apply max-h-[calc(90vh-80px)] overflow-y-auto;
	}
</style>
