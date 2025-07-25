<script lang="ts">
	export let user: import('lucia').User;
	export let currentFilter: { status: string | null; general: string | null } = {
		status: null,
		general: null
	};

	export let mobileNavOpen: boolean = false;
	export let onToggleMobileNav: () => void;
	export let onCloseMobileNav: () => void;
	export let onOpenCreateModal: () => void;

	// Helper function to check if a link is active
	function isActive(type: 'status' | 'general' | 'all', value?: string): boolean {
		if (type === 'all') {
			return !currentFilter.status && !currentFilter.general;
		} else if (type === 'status') {
			return currentFilter.status === value;
		} else if (type === 'general') {
			return currentFilter.general === value;
		}
		return false;
	}
</script>

<nav class="navbar" aria-label="main navigation">
	<div class="container">
		<div class="navbar-brand">
			<h1 class="navbar-item title is-4">RFD Index</h1>
		</div>

		<div class="navbar-menu">
			<div class="navbar-end">
				<div class="navbar-item">{user.name}</div>
				<div class="navbar-item">
					{#if user.avatarBase64}
						<img src={user.avatarBase64} alt={user.name} class="rounded-full" />
					{:else if user.picture}
						<img src={user.picture} alt={user.name} class="rounded-full" />
					{:else}
						<div class="mobile-avatar mobile-avatar-placeholder">
							{user.name.charAt(0).toUpperCase()}
						</div>
					{/if}
				</div>
				<div class="navbar-item">
					<button class="button is-light" onclick={onOpenCreateModal}
						><span class="icon"><i class="fa fa-plus"></i></span> &emsp;Create RFD
					</button>
				</div>
				<div class="navbar-item">
					<a class="button is-light" href="/auth/logout">
						<span class="icon">
							<i class="fa fa-right-from-bracket"></i>
						</span>
						&emsp;Log out
					</a>
				</div>
			</div>
		</div>
	</div>
</nav>

<!-- Mobile Navigation Header -->
<div class="mobile-nav-header">
	<div class="mobile-nav-content">
		<h1 class="mobile-nav-title">RFD Index</h1>
		<button
			class="mobile-nav-toggle"
			onclick={onToggleMobileNav}
			aria-label="Toggle navigation menu"
		>
			<span class="hamburger-line {mobileNavOpen ? 'open' : ''}"></span>
			<span class="hamburger-line {mobileNavOpen ? 'open' : ''}"></span>
			<span class="hamburger-line {mobileNavOpen ? 'open' : ''}"></span>
		</button>
	</div>
</div>

<!-- Mobile Navigation Overlay -->
{#if mobileNavOpen}
	<div
		class="mobile-nav-overlay"
		role="button"
		tabindex="0"
		onclick={onCloseMobileNav}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onCloseMobileNav();
			}
		}}
	></div>
{/if}

<!-- Mobile Navigation Menu -->
<div class="mobile-nav-menu {mobileNavOpen ? 'open' : ''}">
	<div class="mobile-nav-user">
		{#if user.avatarBase64}
			<img src={user.avatarBase64} alt={user.name} class="mobile-avatar" />
		{:else if user.picture}
			<img src={user.picture} alt={user.name} class="mobile-avatar" />
		{:else}
			<div class="mobile-avatar mobile-avatar-placeholder">
				{user.name.charAt(0).toUpperCase()}
			</div>
		{/if}
		<div>
			<p class="mobile-user-name">{user.name}</p>
			<a href="/auth/logout" class="btn btn-ghost btn-sm" onclick={onCloseMobileNav}>Sign Out</a>
		</div>
	</div>

	<div class="mobile-nav-create-section">
		<button
			onclick={() => {
				onOpenCreateModal();
				onCloseMobileNav();
			}}
			class="button is-light w-full"
			><span class="icon"><i class="fa fa-plus"></i></span> &emsp;Create RFD
		</button>
		<!-- <button
			
			class="btn btn-primary w-full"
		>
			Create RFD
		</button> -->
	</div>
	<div class="mobile-nav-divider"></div>
	<nav class="mobile-nav">
		<ul class="mobile-nav-section">
			<li>
				<a
					href="/"
					class="mobile-nav-link {isActive('all') ? 'mobile-nav-link-active' : ''}"
					onclick={onCloseMobileNav}>All RFDs</a
				>
			</li>
			<li>
				<a
					href="/?filter=recent"
					class="mobile-nav-link {isActive('general', 'recent') ? 'mobile-nav-link-active' : ''}"
					onclick={onCloseMobileNav}>Recent</a
				>
			</li>
		</ul>
		<div class="mobile-nav-divider"></div>
		<p class="mobile-nav-section-title">By Status</p>
		<ul class="mobile-nav-section">
			<li>
				<a
					href="/?status=draft"
					class="mobile-nav-link status-draft {isActive('status', 'draft')
						? 'mobile-nav-link-active'
						: ''}"
					onclick={onCloseMobileNav}
				>
					Draft
				</a>
			</li>
			<li>
				<a
					href="/?status=open_for_review"
					class="mobile-nav-link status-review {isActive('status', 'open_for_review')
						? 'mobile-nav-link-active'
						: ''}"
					onclick={onCloseMobileNav}
				>
					Open for Review
				</a>
			</li>
			<li>
				<a
					href="/?status=accepted"
					class="mobile-nav-link status-approved {isActive('status', 'accepted')
						? 'mobile-nav-link-active'
						: ''}"
					onclick={onCloseMobileNav}
				>
					Accepted
				</a>
			</li>
			<li>
				<a
					href="/?status=enforced"
					class="mobile-nav-link status-enforced {isActive('status', 'enforced')
						? 'mobile-nav-link-active'
						: ''}"
					onclick={onCloseMobileNav}
				>
					Enforced
				</a>
			</li>
			<li>
				<a
					href="/?status=rejected"
					class="mobile-nav-link status-rejected {isActive('status', 'rejected')
						? 'mobile-nav-link-active'
						: ''}"
					onclick={onCloseMobileNav}
				>
					Rejected
				</a>
			</li>
			<li>
				<a
					href="/?status=retracted"
					class="mobile-nav-link status-archived {isActive('status', 'retracted')
						? 'mobile-nav-link-active'
						: ''}"
					onclick={onCloseMobileNav}
				>
					Retracted
				</a>
			</li>
		</ul>
	</nav>
</div>

<style lang="postcss">
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

		.mobile-nav {
			padding: 1.5rem;
		}

		.mobile-nav-create-section {
			padding: 1.5rem;
			padding-bottom: 0;
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

		.mobile-nav-link-active {
			color: white !important;
			font-weight: 600;
		}

		.mobile-nav-link-active:hover {
			color: white !important;
		}

		.status-draft.mobile-nav-link-active {
			background-color: #94a3b8 !important;
		}

		.status-review.mobile-nav-link-active {
			background-color: #f59e0b !important;
		}

		.status-approved.mobile-nav-link-active {
			background-color: #10b981 !important;
		}

		.status-enforced.mobile-nav-link-active {
			background-color: #059669 !important;
		}

		.status-rejected.mobile-nav-link-active {
			background-color: #ef4444 !important;
		}

		.status-archived.mobile-nav-link-active {
			background-color: #6b7280 !important;
		}

		/* Fallback for non-status filters */
		.mobile-nav-link-active:not([class*='status-']) {
			background-color: #3b82f6 !important;
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

		.mobile-nav-link.status-enforced {
			border-left: 4px solid #059669;
		}

		.mobile-nav-link.status-rejected {
			border-left: 4px solid #ef4444;
		}

		.mobile-nav-link.status-archived {
			border-left: 4px solid #6b7280;
		}
	}
</style>
