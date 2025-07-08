<script lang="ts">
	import Preview from '$lib/components/Preview.svelte';
	import List from '$lib/components/List.svelte';
	import CreateRFD from '$lib/components/CreateRFD.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

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
		endorsers: Array<{
			userId: string;
			name: string | null;
			picture: string | null;
			createdAt: string;
		}>;
	};

	let selectedRfd: RFD | null = null;
	let showCreateModal = false;
	let mobileNavOpen = false;
	let showMobilePreview = false;
	let rfds = data.rfds;

	// Auto-select RFD if targetRfd is provided
	onMount(() => {
		if (data.targetRfd) {
			selectedRfd = data.targetRfd;
		}
	});

	function handleRfdSelect(rfd: RFD) {
		selectedRfd = rfd;

		// On mobile, show preview in modal
		if (window.innerWidth <= 768) {
			showMobilePreview = true;
			document.body.style.overflow = 'hidden';
		}
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
		return;
	}

	function toggleMobileNav() {
		mobileNavOpen = !mobileNavOpen;
	}

	function closeMobileNav() {
		mobileNavOpen = false;
	}

	function closeMobilePreview() {
		showMobilePreview = false;
		document.body.style.overflow = '';
	}

	// Handle window resize to close mobile preview if screen becomes desktop
	function handleResize() {
		if (window.innerWidth > 768 && showMobilePreview) {
			closeMobilePreview();
		}
	}

	function handleRfdUpdate(updatedRfd: RFD) {
		// Update the RFD in the list
		rfds = rfds.map((rfd: RFD) => (rfd.id === updatedRfd.id ? updatedRfd : rfd));

		// Update selected RFD if it's the one that was updated
		if (selectedRfd?.id === updatedRfd.id) {
			selectedRfd = updatedRfd;
		}
	}

	async function handleRfdCreated() {
		// Refresh the RFD list after creation
		try {
			const response = await fetch('/api/rfd');
			if (response.ok) {
				const data = await response.json();
				rfds = data.rfds;
			}
		} catch (error) {
			console.error('Error refreshing RFD list:', error);
		}
	}
</script>

<svelte:head>
	<title
		>{data.targetRfdNumber && data.targetRfd
			? `RFD ${data.targetRfdNumber}: ${data.targetRfd.title}`
			: data.targetRfdNumber && data.rfdNotFound
				? `RFD ${data.targetRfdNumber} Not Found`
				: 'RFD Index'}</title
	>
	<meta name="description" content="RFD Index and Management System" />
</svelte:head>

<svelte:window on:resize={handleResize} />

<Navbar
	user={data.user}
	{mobileNavOpen}
	onToggleMobileNav={toggleMobileNav}
	onCloseMobileNav={closeMobileNav}
	onOpenCreateModal={openCreateModal}
/>

<!-- Show RFD not found message if applicable -->
{#if data.rfdNotFound}
	<div class="flex min-h-screen items-center justify-center bg-gray-50">
		<div class="mx-auto max-w-md px-6 text-center">
			<div class="mb-6">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			</div>
			<h1 class="mb-4 text-2xl font-bold text-gray-900">RFD {data.targetRfdNumber} Not Found</h1>
			<p class="mb-8 text-gray-600">
				The requested RFD number does not exist or could not be loaded.
			</p>
			<div class="space-y-3">
				<a
					href="/"
					class="block w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
				>
					View All RFDs
				</a>
				<button
					onclick={openCreateModal}
					class="block w-full rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
				>
					Create New RFD
				</button>
			</div>
		</div>
	</div>
{:else}
	<section>
		<Sidebar user={data.user} onOpenCreateModal={openCreateModal} />
		<List {rfds} onRfdSelect={handleRfdSelect} {selectedRfd} />
		<Preview {selectedRfd} user={data.user} onRfdUpdate={handleRfdUpdate} />
	</section>
{/if}

<!-- Create RFD Modal -->
{#if showCreateModal}
	<div
		class="modal-overlay"
		role="button"
		tabindex="0"
		onclick={closeCreateModal}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				closeCreateModal();
			}
		}}
	>
		<div
			class="modal-content"
			role="dialog"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h2 class="modal-title">Create New RFD</h2>
			</div>
			<div class="modal-body">
				<CreateRFD onClose={closeCreateModal} onRfdCreated={handleRfdCreated} />
			</div>
		</div>
	</div>
{/if}

<!-- Mobile RFD Preview Modal -->
{#if showMobilePreview && selectedRfd}
	<div
		class="mobile-preview-overlay"
		role="button"
		tabindex="0"
		onclick={closeMobilePreview}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				closeMobilePreview();
			}
		}}
	>
		<div
			class="mobile-preview-content"
			role="dialog"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="mobile-preview-header">
				<h2 class="mobile-preview-title">RFD Preview</h2>
				<button
					class="mobile-preview-close"
					onclick={closeMobilePreview}
					aria-label="Close preview"
				>
					✕
				</button>
			</div>
			<div class="mobile-preview-body">
				<Preview
					{selectedRfd}
					isMobileModal={true}
					user={data.user}
					onRfdUpdate={handleRfdUpdate}
				/>
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	section {
		display: flex;
		flex-direction: row;
		gap: 1.5rem; /* rhythm-base */
		min-height: 100vh;
	}

	/* Mobile responsive layout adjustments */
	@media (max-width: 768px) {
		section {
			flex-direction: column;
			gap: 0;
			padding-top: 4rem; /* Space for fixed header */
		}
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

	/* Mobile modal adjustments */
	@media (max-width: 768px) {
		.modal-content {
			max-width: 95vw;
			max-height: 95vh;
			margin: 0;
			border-radius: 0.25rem;
		}

		.modal-header {
			padding: 1rem;
		}

		.modal-title {
			font-size: 1.25rem;
			line-height: 1.5rem;
		}
	}

	/* Mobile Preview Modal Styles */
	.mobile-preview-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.75);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.mobile-preview-content {
		background: white;
		border-radius: 0.5rem;
		width: 100%;
		max-width: 95vw;
		max-height: 95vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.mobile-preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.mobile-preview-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
		line-height: 1.5rem;
	}

	.mobile-preview-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		transition: color 0.2s ease;
	}

	.mobile-preview-close:hover {
		color: #374151;
	}

	.mobile-preview-body {
		flex: 1;
		overflow-y: auto;
		max-height: calc(95vh - 4rem);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #e5e7eb;
		padding: 1.5rem; /* rhythm-base */
	}

	.modal-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #111827;
		margin: 0;
		line-height: 3rem; /* rhythm-lg line height */
	}

	.modal-body {
		max-height: calc(90vh - 80px);
		overflow-y: auto;
	}
</style>
