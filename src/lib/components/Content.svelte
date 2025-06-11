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
			case 'review':
				return '#f59e0b';
			case 'approved':
				return '#10b981';
			case 'rejected':
				return '#ef4444';
			case 'archived':
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

	function handleRfdClick(rfd: RFD) {
		onRfdSelect(rfd);
	}

	function formatRfdNumber(rfdNumber: number): string {
		return `RFD-${rfdNumber.toString().padStart(3, '0')}`;
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
					on:click={() => handleRfdClick(rfd)}
				>
					<div class="rfd-header">
						<div class="title-section" on:click|stopPropagation>
							<div class="title-row">
								<span class="rfd-number">{formatRfdNumber(rfd.rfdNumber)}</span>
								<h2>{rfd.title}</h2>
							</div>
							<a
								href={rfd.googleDocUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="external-link"
							>
								Open in Google Docs
							</a>
						</div>
						<span class="status-badge" style="background-color: {getStatusColor(rfd.status)};">
							{rfd.status}
						</span>
					</div>

					{#if rfd.summary}
						<p class="summary">{rfd.summary}</p>
					{/if}

					<div class="rfd-meta">
						<span class="date">Created {formatDate(rfd.createdAt)}</span>
						{#if rfd.updatedAt !== rfd.createdAt}
							<span class="date">• Updated {formatDate(rfd.updatedAt)}</span>
						{/if}
						<span class="endorsement-count">
							👍 {rfd.endorsementCount} endorsement{rfd.endorsementCount !== 1 ? 's' : ''}
						</span>
					</div>

					{#if parseTags(rfd.tags).length > 0}
						<div class="tags">
							{#each parseTags(rfd.tags) as tag}
								<span class="tag">{tag}</span>
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
		padding: 24px;
		overflow-y: auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 16px;
	}

	.header h1 {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
		color: #111827;
	}

	.create-btn {
		background-color: #3b82f6;
		color: white;
		padding: 8px 16px;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.create-btn:hover {
		background-color: #2563eb;
	}

	.empty-state {
		text-align: center;
		padding: 48px 24px;
		color: #6b7280;
	}

	.empty-state a {
		color: #3b82f6;
		text-decoration: none;
	}

	.empty-state a:hover {
		text-decoration: underline;
	}

	.rfd-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.rfd-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 16px;
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			background-color 0.2s;
		cursor: pointer;
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
		margin-bottom: 12px;
	}

	.title-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 8px;
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
		font-size: 20px;
		font-weight: 600;
		color: #111827;
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

	.status-badge {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
		color: white;
		text-transform: capitalize;
		white-space: nowrap;
		margin-left: 12px;
	}

	.summary {
		color: #6b7280;
		line-height: 1.6;
		margin: 0 0 12px 0;
	}

	.rfd-meta {
		display: flex;
		gap: 8px;
		margin-bottom: 12px;
	}

	.date {
		font-size: 14px;
		color: #9ca3af;
	}

	.endorsement-count {
		font-size: 14px;
		color: #059669;
		font-weight: 500;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tag {
		background-color: #f3f4f6;
		color: #374151;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}
</style>
