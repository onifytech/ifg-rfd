<script lang="ts">
	type RFD = {
		id: string;
		rfdNumber: number;
		title: string;
		summary: string | null;
		status: string;
		authorId: string;
		googleDocUrl: string;
		tags: string | null;
		authorName: string | null;
		authorEmail: string | null;
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

	export let rfds: RFD[] = [];
	export let onRfdSelect: (rfd: RFD) => void;
	export let selectedRfd: RFD | null = null;

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'draft':
				return '#94a3b8';
			case 'open_for_review':
				return '#f59e0b';
			case 'accepted':
				return '#10b981';
			case 'enforced':
				return '#059669';
			case 'rejected':
				return '#ef4444';
			case 'retracted':
				return '#6b7280';
			default:
				return '#94a3b8';
		}
	}

	function parseTags(tags: string | null): string[] {
		if (!tags) return [];
		try {
			return JSON.parse(tags);
		} catch {
			return [];
		}
	}

	function generateTagColor(tag: string): string {
		// Generate a consistent color based on the tag name
		let hash = 0;
		for (let i = 0; i < tag.length; i++) {
			hash = tag.charCodeAt(i) + ((hash << 5) - hash);
		}

		const colors = [
			'#ef4444',
			'#f59e0b',
			'#eab308',
			'#22c55e',
			'#10b981',
			'#06b6d4',
			'#3b82f6',
			'#6366f1',
			'#8b5cf6',
			'#a855f7',
			'#ec4899',
			'#f43f5e',
			'#64748b',
			'#6b7280',
			'#374151'
		];

		return colors[Math.abs(hash) % colors.length];
	}

	function handleRfdClick(rfd: RFD) {
		onRfdSelect(rfd);
	}

	function formatRfdNumber(rfdNumber: number): string {
		return `RFD-${rfdNumber.toString().padStart(3, '0')}`;
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'draft':
				return 'Draft';
			case 'open_for_review':
				return 'Open for Review';
			case 'accepted':
				return 'Accepted';
			case 'enforced':
				return 'Enforced';
			case 'rejected':
				return 'Rejected';
			case 'retracted':
				return 'Retracted';
			default:
				return status;
		}
	}
</script>

<div class="content bg-white">
	<div class="header">
		<h1>RFDs</h1>
	</div>

	{#if rfds.length === 0}
		<div class="empty-state">
			<p>No RFDs found.</p>
		</div>
	{:else}
		<ul class="rfd-list">
			{#each rfds as rfd}
				<li
					class="rfd-item {selectedRfd?.id === rfd.id ? 'selected' : ''}"
					role="button"
					tabindex="0"
					onclick={() => handleRfdClick(rfd)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleRfdClick(rfd);
						}
					}}
				>
					<div class="rfd-header">
						<div class="title-section">
							<div class="title-row">
								<span class="rfd-number">{formatRfdNumber(rfd.rfdNumber)}</span>
								<h2>{rfd.title}</h2>
							</div>
							<a
								href={rfd.googleDocUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="external-link"
								onclick={(e) => e.stopPropagation}
							>
								Open in Google Docs
							</a>
						</div>
						<div class="status-section">
							<span class="status-badge" style="background-color: {getStatusColor(rfd.status)};">
								{getStatusLabel(rfd.status)}
							</span>
						</div>
					</div>

					{#if rfd.summary}
						<p class="summary">{rfd.summary}</p>
					{/if}

					<div class="rfd-meta">
						<span class="date">Created {formatDate(rfd.createdAt)}</span>
						{#if rfd.updatedAt !== rfd.createdAt}
							<span class="date">• Updated {formatDate(rfd.updatedAt)}</span>
						{/if}
						<div class="pump-section">
							<span class="pump-count">
								🔥 {rfd.endorsementCount} pump{rfd.endorsementCount !== 1 ? 's' : ''}
							</span>
							{#if rfd.endorsers && rfd.endorsers.length > 0}
								<div class="pumper-avatars">
									{#each rfd.endorsers.slice(0, 5) as endorser, index}
										{#if endorser.picture}
											<img
												src={endorser.picture}
												alt={endorser.name || 'User'}
												class="pumper-avatar"
												style="z-index: {5 - index}; margin-left: {index > 0 ? '-0.5rem' : '0'}"
												title={endorser.name || 'User'}
											/>
										{:else}
											<div
												class="pumper-avatar pumper-avatar-placeholder"
												style="z-index: {5 - index}; margin-left: {index > 0 ? '-0.5rem' : '0'}"
												title={endorser.name || 'User'}
											>
												{(endorser.name || 'U').charAt(0).toUpperCase()}
											</div>
										{/if}
									{/each}
									{#if rfd.endorsers.length > 5}
										<div class="pumper-more" style="margin-left: -0.5rem">
											+{rfd.endorsers.length - 5}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>

					{#if parseTags(rfd.tags).length > 0}
						<div class="tags">
							{#each parseTags(rfd.tags) as tag}
								<span class="tag" style="background-color: {generateTagColor(tag)}">{tag}</span>
							{/each}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.content {
		width: 50%;
		padding: 1.5rem; /* rhythm-base */
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.content {
			width: 100%;
			height: calc(100vh - 4rem); /* Account for mobile nav header */
			min-height: 60vh;
			padding: 1rem;
			order: 2;
		}
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem; /* rhythm-base */
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.75rem; /* rhythm-sm */
		flex-shrink: 0; /* Prevent header from shrinking */
	}

	.header h1 {
		margin: 0;
		font-size: 1.875rem; /* 30px - 3xl */
		font-weight: 700;
		color: #111827;
		line-height: 3rem; /* rhythm-lg line height */
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1.5rem; /* rhythm-lg vertical, rhythm-base horizontal */
		color: #6b7280;
	}

	.rfd-list {
		list-style: none;
		padding: 0;
		margin: 0;
		overflow-y: auto;
		flex: 1; /* Take remaining space */
		padding-right: 0.75rem; /* rhythm-sm for scrollbar spacing */
	}

	.rfd-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem; /* rhythm-base */
		margin-bottom: 0.75rem; /* rhythm-sm */
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			background-color 0.2s;
		cursor: pointer;
	}

	/* Mobile RFD item adjustments */
	@media (max-width: 768px) {
		.rfd-item {
			padding: 1rem;
			margin-bottom: 0.5rem;
		}

		.rfd-header {
			flex-direction: column;
			gap: 0.5rem;
			align-items: flex-start;
		}

		.title-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.rfd-header h2 {
			font-size: 1.125rem; /* Smaller on mobile */
		}

		.status-badge {
			margin-left: 0;
			align-self: flex-start;
		}

		.rfd-meta {
			flex-direction: column;
			gap: 0.25rem;
		}

		.external-link {
			font-size: 0.875rem;
		}
	}

	.rfd-item:hover {
		border-color: #d1d5db;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		background-color: #f9fafb;
	}

	.rfd-item.selected {
		border-color: #3b82f6;
		background-color: #eff6ff;
		box-shadow: 0 1px 3px 0 rgba(59, 130, 246, 0.1);
	}

	.rfd-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem; /* rhythm-sm */
	}

	.title-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.375rem; /* rhythm-xs */
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem; /* rhythm-sm */
	}

	.rfd-number {
		background-color: #f3f4f6;
		color: #374151;
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.rfd-header h2 {
		margin: 0;
		font-size: 1.25rem; /* 20px - xl */
		font-weight: 600;
		color: #111827;
		line-height: 1.5rem; /* rhythm base line height */
		transition: color 0.2s;
	}

	.external-link {
		font-size: 14px;
		color: #3b82f6;
		text-decoration: none;
		align-self: flex-start;
	}

	.external-link:hover {
		text-decoration: underline;
	}

	.status-section {
		margin-left: 12px;
		min-width: 120px;
	}

	.status-badge {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
		color: white;
		white-space: nowrap;
	}

	.summary {
		color: #6b7280;
		line-height: 1.5rem; /* rhythm base line height */
		margin: 0 0 0.75rem 0; /* rhythm-sm bottom */
	}

	.rfd-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem; /* rhythm-sm */
		margin-bottom: 0.75rem; /* rhythm-sm */
		align-items: center;
	}

	.date {
		font-size: 14px;
		color: #9ca3af;
	}

	.pump-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.pump-count {
		font-size: 14px;
		color: #dc2626;
		font-weight: 500;
	}

	.pumper-avatars {
		display: flex;
		align-items: center;
		position: relative;
	}

	.pumper-avatar {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		border: 2px solid white;
		position: relative;
		object-fit: cover;
	}

	.pumper-avatar-placeholder {
		background: #6b7280;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		font-weight: 600;
	}

	.pumper-more {
		background: #e5e7eb;
		color: #6b7280;
		border-radius: 50%;
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		font-weight: 600;
		position: relative;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem; /* rhythm-xs */
	}

	.tag {
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}
</style>
