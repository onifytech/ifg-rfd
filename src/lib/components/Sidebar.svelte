<script lang="ts">
	export let user: import('lucia').User;
	export let onOpenCreateModal: () => void;
	export let currentFilter: { status: string | null; general: string | null } = { status: null, general: null };
	
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

<div class="sidebar bg-gray-200">
	<div class="sidebar-content">
		<h1 class="sidebar-title">RFD Index</h1>
		<div class="create-section">
			<button onclick={onOpenCreateModal} class="btn btn-primary">
				Create RFD
			</button>
		</div>
		<div class="nav-divider"></div>
		<nav class="sidebar-nav">
			<ul class="nav-section">
				<li><a href="/" class="nav-link {isActive('all') ? 'nav-link-active' : ''}">All RFDs</a></li>
				<li><a href="/?filter=recent" class="nav-link {isActive('general', 'recent') ? 'nav-link-active' : ''}">Recent</a></li>
			</ul>
			<div class="nav-divider"></div>
			<p class="nav-section-title">By Status</p>
			<ul class="nav-section">
				<li><a href="/?status=draft" class="nav-link status-draft {isActive('status', 'draft') ? 'nav-link-active' : ''}">Draft</a></li>
				<li><a href="/?status=open_for_review" class="nav-link status-review {isActive('status', 'open_for_review') ? 'nav-link-active' : ''}">Open for Review</a></li>
				<li><a href="/?status=accepted" class="nav-link status-approved {isActive('status', 'accepted') ? 'nav-link-active' : ''}">Accepted</a></li>
				<li><a href="/?status=enforced" class="nav-link status-enforced {isActive('status', 'enforced') ? 'nav-link-active' : ''}">Enforced</a></li>
				<li><a href="/?status=rejected" class="nav-link status-rejected {isActive('status', 'rejected') ? 'nav-link-active' : ''}">Rejected</a></li>
				<li><a href="/?status=retracted" class="nav-link status-archived {isActive('status', 'retracted') ? 'nav-link-active' : ''}">Retracted</a></li>
			</ul>
		</nav>
	</div>
	<div class="user-info">
		<div class="user-profile">
			{#if user.avatarBase64}
				<img src={user.avatarBase64} alt={user.name} class="avatar" />
			{:else if user.picture}
				<img src={user.picture} alt={user.name} class="avatar" />
			{:else}
				<div class="avatar avatar-placeholder">
					{user.name.charAt(0).toUpperCase()}
				</div>
			{/if}
			<div>
				<p class="break-words text-ellipsis">{user.name}</p>
			</div>
		</div>
		<a href="/auth/logout" class="btn btn-ghost btn-sm">Sign Out</a>
	</div>
</div>

<style lang="postcss">
	.sidebar {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 25%;
		padding: 0;
		height: 100vh;
		position: sticky;
		top: 0;
		overflow-y: auto;
	}

	.sidebar-content {
		flex: 1;
		padding: 1.5rem; /* rhythm-base */
	}

	.sidebar-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #1f2937;
		margin: 0 0 1.5rem 0; /* rhythm-base bottom margin */
		line-height: 3rem; /* rhythm-lg line height */
	}

	.create-section {
		margin-bottom: 1.5rem; /* rhythm-base */
	}

	.create-section .btn {
		width: 100%;
		justify-content: center;
		text-align: center;
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
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		color: #4b5563;
		text-transform: uppercase;
		margin: 0 0 0.75rem 0; /* rhythm-sm bottom margin */
		line-height: 1.5rem; /* rhythm base line height */
	}

	.nav-divider {
		border-top: 1px solid #d1d5db;
		margin: 1.5rem 0; /* rhythm-base top and bottom */
	}

	.nav-link {
		display: block;
		width: 100%;
		cursor: pointer;
		border-radius: 0.375rem;
		text-align: start;
		font-size: 0.875rem;
		color: #374151;
		transition: color 0.15s;
		text-decoration: none;
		padding: 0.375rem 0.75rem; /* rhythm-xs vertical, rhythm-sm horizontal */
		margin-bottom: 0.375rem; /* rhythm-xs */
		line-height: 1.5rem; /* rhythm base line height */
	}

	.nav-link:hover {
		background-color: #d1d5db;
		color: #111827;
	}

	.nav-link-active {
		background-color: #3b82f6 !important;
		color: white !important;
		font-weight: 600;
	}

	.nav-link-active:hover {
		background-color: #2563eb !important;
		color: white !important;
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

	.status-enforced {
		border-left: 4px solid #059669;
	}

	.status-rejected {
		border-left: 4px solid #ef4444;
	}

	.status-archived {
		border-left: 4px solid #6b7280;
	}

	.user-info {
		display: flex;
		flex-direction: column;
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

	.user-profile p {
		margin: 0;
		font-size: 14px;
		color: #6b7280;
	}


	/* Hide sidebar on mobile */
	@media (max-width: 768px) {
		.sidebar {
			display: none;
		}
	}
</style>
