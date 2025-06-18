<script lang="ts">
	export let user: import('lucia').User;
	export let onOpenCreateModal: () => void;
</script>

<div class="sidebar bg-gray-200">
	<div class="sidebar-content">
		<h1 class="sidebar-title">RFD Index</h1>
		<nav class="sidebar-nav">
			<ul class="nav-section">
				<li><a href="/" class="nav-link active">All RFDs</a></li>
				<li>
					<button onclick={onOpenCreateModal} class="nav-link">Create RFD</button>
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
		<a href="/auth/logout" class="logout-btn">Sign Out</a>
	</div>
</div>

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

	/* Hide sidebar on mobile */
	@media (max-width: 768px) {
		.sidebar {
			display: none;
		}
	}
</style>
