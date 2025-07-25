<script lang="ts">
	import type { RFD } from '$lib/types/rfd';
	import { getStatusColor, getStatusLabel } from '$lib/utils/statusUtils';

	export let rfds: RFD[] = [];
	export let onRfdSelect: (rfd: RFD) => void;
	export let selectedRfd: RFD | null = null;
	export let currentFilter: { status: string | null; general: string | null } = {
		status: null,
		general: null
	};

	// Get filter description for display
	function getFilterDescription(): string {
		if (currentFilter.status) {
			return `${getStatusLabel(currentFilter.status)}`;
		} else if (currentFilter.general === 'recent') {
			return 'Recent RFDs (Last 30 days)';
		}
		return 'All RFDs';
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
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
</script>

<div class="content column is-one-third bg-white">
	{#if rfds.length === 0}
		<div class="empty-state">
			<p>No RFDs found{currentFilter.status || currentFilter.general ? ' for this filter' : ''}.</p>
			{#if currentFilter.status || currentFilter.general}
				<a href="/" class="clear-filter-link">View all RFDs</a>
			{/if}
		</div>
	{:else}
		<ul class="rfd-list">
			{#each rfds as rfd (rfd.id)}
				<li class="rfd-item {selectedRfd?.id === rfd.id ? 'selected' : ''}">
					<button class="rfd-item-button" onclick={() => handleRfdClick(rfd)}>
						<div class="rfd-header">
							<div class="title-section">
								<div class="title-row mb-4 flex justify-between">
									<div class="title-section">
										<h2>{rfd.title}</h2>
										<p class="!text-xs">{rfd.authorName || 'Unknown'}</p>
									</div>
									<div class="status-section text-right">
										<span
											class="status-badge"
											style="background-color: {getStatusColor(rfd.status)};"
										>
											{getStatusLabel(rfd.status)}
										</span>
									</div>
								</div>
								{#if rfd.summary}
									<p class="summary">{rfd.summary}</p>
								{/if}
							</div>
						</div>

						{#if parseTags(rfd.tags).length > 0}
							<div class="tags">
								{#each parseTags(rfd.tags) as tag (tag)}
									<span class="text-sm">Tags:</span><span
										class="tag"
										style="background-color: {generateTagColor(tag)}">{tag}</span
									>
								{/each}
							</div>
						{/if}
						<div class="rfd-footer flex">
							<div class="number-section">
								<span class="rfd-number">{formatRfdNumber(rfd.rfdNumber)}</span>
							</div>
							<div class="pump-section">
								<span class="pump-count">
									<span class="icon"><i class="fa fa-heart text-red-600"></i></span>
									{rfd.endorsementCount}
								</span>
							</div>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.clear-filter-link {
		color: #3b82f6;
		text-decoration: none;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		display: inline-block;
	}

	.clear-filter-link:hover {
		color: #2563eb;
		text-decoration: underline;
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
	}

	.rfd-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
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
			margin-bottom: 1rem;
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

	.rfd-item-button {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		color: inherit;
		text-decoration: none;
	}

	/* .rfd-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem; 
	} */

	/* .title-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	} */

	.rfd-number {
		background-color: #333;
		color: white;
		padding: 4px 8px;
		border-radius: 5px;
		font-size: 12px;
		text-transform: lowercase;
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
