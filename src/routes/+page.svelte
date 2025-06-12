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
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<svelte:window on:resize={handleResize} />

<!-- Mobile Navigation Header -->
<div class="mobile-nav-header">
	<div class="mobile-nav-content">
		<h1 class="mobile-nav-title">RFD Index</h1>
		<button class="mobile-nav-toggle" onclick={toggleMobileNav} aria-label="Toggle navigation menu">
			<span class="hamburger-line {mobileNavOpen ? 'open' : ''}"></span>
			<span class="hamburger-line {mobileNavOpen ? 'open' : ''}"></span>
			<span class="hamburger-line {mobileNavOpen ? 'open' : ''}"></span>
		</button>
	</div>
</div>

<!-- Mobile Navigation Overlay -->
{#if mobileNavOpen}
	<div class="mobile-nav-overlay" onclick={closeMobileNav}></div>
{/if}

<!-- Mobile Navigation Menu -->
<div class="mobile-nav-menu {mobileNavOpen ? 'open' : ''}">
	<div class="mobile-nav-user">
		{#if data.user.avatarBase64}
			<img src={data.user.avatarBase64} alt={data.user.name} class="mobile-avatar" />
		{:else if data.user.picture}
			<img src={data.user.picture} alt={data.user.name} class="mobile-avatar" />
		{:else}
			<div class="mobile-avatar mobile-avatar-placeholder">
				{data.user.name.charAt(0).toUpperCase()}
			</div>
		{/if}
		<div>
			<p class="mobile-user-name">{data.user.name}</p>
			<a href="/auth/logout" class="mobile-logout-btn" onclick={closeMobileNav}>Sign Out</a>
		</div>
	</div>

	<nav class="mobile-nav">
		<ul class="mobile-nav-section">
			<li><a href="/" class="mobile-nav-link active" onclick={closeMobileNav}>All RFDs</a></li>
			<li>
				<button
					onclick={() => {
						openCreateModal();
						closeMobileNav();
					}}
					class="mobile-nav-link">Create RFD</button
				>
			</li>
			<li>
				<a href="/?filter=recent" class="mobile-nav-link" onclick={closeMobileNav}>Recent</a>
			</li>
		</ul>
		<div class="mobile-nav-divider"></div>
		<p class="mobile-nav-section-title">By Status</p>
		<ul class="mobile-nav-section">
			<li>
				<a href="/?status=draft" class="mobile-nav-link status-draft" onclick={closeMobileNav}
					>Draft</a
				>
			</li>
			<li>
				<a href="/?status=review" class="mobile-nav-link status-review" onclick={closeMobileNav}
					>Review</a
				>
			</li>
			<li>
				<a href="/?status=approved" class="mobile-nav-link status-approved" onclick={closeMobileNav}
					>Approved</a
				>
			</li>
			<li>
				<a href="/?status=rejected" class="mobile-nav-link status-rejected" onclick={closeMobileNav}
					>Rejected</a
				>
			</li>
			<li>
				<a href="/?status=archived" class="mobile-nav-link status-archived" onclick={closeMobileNav}
					>Archived</a
				>
			</li>
		</ul>
	</nav>
</div>

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
				{#if data.user.avatarBase64}
					<img src={data.user.avatarBase64} alt={data.user.name} class="avatar" />
				{:else if data.user.picture}
					<img src={data.user.picture} alt={data.user.name} class="avatar" />
				{:else}
					<div class="avatar avatar-placeholder">
						{data.user.name.charAt(0).toUpperCase()}
					</div>
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
				<CreateRFD onClose={closeCreateModal} />
			</div>
		</div>
	</div>
{/if}

<!-- Mobile RFD Preview Modal -->
{#if showMobilePreview && selectedRfd}
	<div class="mobile-preview-overlay" onclick={closeMobilePreview}>
		<div class="mobile-preview-content" onclick={(e) => e.stopPropagation()}>
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
				<Preview {selectedRfd} isMobileModal={true} />
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
		@apply flex-1;
		padding: 1.5rem; /* rhythm-base */
	}

	.sidebar-title {
		@apply text-2xl font-bold text-gray-800;
		margin: 0 0 1.5rem 0; /* rhythm-base bottom margin */
		line-height: 3rem; /* rhythm-lg line height */
	}

	.sidebar-nav {
		margin-bottom: 1.5rem; /* rhythm-base */
	}

	.nav-section {
		list-style: none;
		margin: 0 0 0.75rem 0; /* rhythm-sm bottom margin */
		padding: 0;
	}

	.nav-section-title {
		@apply text-sm font-medium tracking-wider text-gray-600 uppercase;
		margin: 0 0 0.75rem 0; /* rhythm-sm bottom margin */
		line-height: 1.5rem; /* rhythm base line height */
	}

	.nav-divider {
		@apply border-t border-gray-300;
		margin: 1.5rem 0; /* rhythm-base top and bottom */
	}

	.nav-link {
		@apply block w-full cursor-pointer rounded-md text-start text-sm text-gray-700 transition-colors duration-150;
		text-decoration: none;
		padding: 0.375rem 0.75rem; /* rhythm-xs vertical, rhythm-sm horizontal */
		margin-bottom: 0.375rem; /* rhythm-xs */
		line-height: 1.5rem; /* rhythm base line height */
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
		@apply flex flex-col;
		padding: 1.5rem; /* rhythm-base */
		background: #f8fafc;
		border-top: 1px solid #e2e8f0;
	}

	.user-profile {
		display: flex;
		align-items: center;
		gap: 0.75rem; /* rhythm-sm */
		padding: 0 0 0.75rem 0; /* rhythm-sm bottom */
	}

	.avatar {
		width: 3rem; /* rhythm-lg width/height for proportional sizing */
		height: 3rem;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		background: #6b7280;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1rem;
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
		gap: 1.5rem; /* rhythm-base */
		min-height: 100vh;
	}

	/* Mobile Navigation Styles */
	.mobile-nav-header {
		display: none;
	}

	.mobile-nav-menu {
		display: none;
	}

	.mobile-nav-overlay {
		display: none;
	}

	/* Mobile-first responsive design */
	@media (max-width: 768px) {
		/* Hide desktop sidebar on mobile */
		.sidebar {
			display: none;
		}

		/* Show mobile navigation */
		.mobile-nav-header {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 1000;
			background: #1f2937;
			border-bottom: 1px solid #374151;
		}

		.mobile-nav-content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1rem 1.5rem;
		}

		.mobile-nav-title {
			color: white;
			font-size: 1.25rem;
			font-weight: 700;
			margin: 0;
			line-height: 1.5rem;
		}

		.mobile-nav-toggle {
			background: none;
			border: none;
			cursor: pointer;
			padding: 0.5rem;
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		.hamburger-line {
			width: 1.5rem;
			height: 2px;
			background: white;
			transition: all 0.3s ease;
			transform-origin: center;
		}

		.hamburger-line.open:nth-child(1) {
			transform: rotate(45deg) translate(0.375rem, 0.375rem);
		}

		.hamburger-line.open:nth-child(2) {
			opacity: 0;
		}

		.hamburger-line.open:nth-child(3) {
			transform: rotate(-45deg) translate(0.375rem, -0.375rem);
		}

		/* Mobile navigation overlay */
		.mobile-nav-overlay {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: 1001;
		}

		/* Mobile navigation menu */
		.mobile-nav-menu {
			display: block;
			position: fixed;
			top: 0;
			left: -100%;
			width: 280px;
			height: 100vh;
			background: #f8fafc;
			z-index: 1002;
			overflow-y: auto;
			transition: left 0.3s ease;
			border-right: 1px solid #e2e8f0;
		}

		.mobile-nav-menu.open {
			left: 0;
		}

		.mobile-nav-user {
			padding: 2rem 1.5rem 1.5rem 1.5rem;
			border-bottom: 1px solid #e2e8f0;
			background: white;
			display: flex;
			align-items: center;
			gap: 0.75rem;
		}

		.mobile-avatar {
			width: 2.5rem;
			height: 2.5rem;
			border-radius: 50%;
			object-fit: cover;
		}

		.mobile-avatar-placeholder {
			background: #6b7280;
			color: white;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 600;
			font-size: 0.875rem;
		}

		.mobile-user-name {
			font-weight: 600;
			color: #1f2937;
			margin: 0 0 0.25rem 0;
			font-size: 0.875rem;
		}

		.mobile-logout-btn {
			color: #6b7280;
			font-size: 0.75rem;
			text-decoration: none;
		}

		.mobile-logout-btn:hover {
			text-decoration: underline;
		}

		.mobile-nav {
			padding: 1.5rem;
		}

		.mobile-nav-section {
			list-style: none;
			margin: 0 0 1rem 0;
			padding: 0;
		}

		.mobile-nav-section-title {
			font-size: 0.75rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: #6b7280;
			margin: 0 0 0.75rem 0;
		}

		.mobile-nav-divider {
			border-top: 1px solid #e2e8f0;
			margin: 1.5rem 0;
		}

		.mobile-nav-link {
			display: block;
			width: 100%;
			padding: 0.75rem 1rem;
			margin-bottom: 0.25rem;
			border-radius: 0.375rem;
			text-decoration: none;
			color: #374151;
			font-size: 0.875rem;
			transition: all 0.2s ease;
			background: none;
			border: none;
			text-align: left;
			cursor: pointer;
		}

		.mobile-nav-link:hover {
			background: #f3f4f6;
			color: #1f2937;
		}

		.mobile-nav-link.active {
			background: #dbeafe;
			color: #1d4ed8;
			font-weight: 500;
		}

		.mobile-nav-link.status-draft {
			border-left: 4px solid #94a3b8;
		}

		.mobile-nav-link.status-review {
			border-left: 4px solid #f59e0b;
		}

		.mobile-nav-link.status-approved {
			border-left: 4px solid #10b981;
		}

		.mobile-nav-link.status-rejected {
			border-left: 4px solid #ef4444;
		}

		.mobile-nav-link.status-archived {
			border-left: 4px solid #6b7280;
		}

		/* Adjust main content for mobile nav header */
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
		@apply flex items-center justify-between border-b border-gray-200;
		padding: 1.5rem; /* rhythm-base */
	}

	.modal-title {
		@apply text-2xl font-bold text-gray-900;
		margin: 0;
		line-height: 3rem; /* rhythm-lg line height */
	}

	.modal-close {
		@apply cursor-pointer border-none bg-transparent p-1 text-xl font-bold text-gray-400 hover:text-gray-600;
	}

	.modal-body {
		@apply max-h-[calc(90vh-80px)] overflow-y-auto;
	}
</style>
