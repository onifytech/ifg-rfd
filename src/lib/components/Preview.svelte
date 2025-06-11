<script lang="ts">
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

	export let selectedRfd: RFD | null = null;

	let isEndorsing = false;

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatRfdNumber(rfdNumber: number): string {
		return `RFD-${rfdNumber.toString().padStart(3, '0')}`;
	}

	async function handleEndorsement() {
		if (!selectedRfd || isEndorsing) return;

		isEndorsing = true;
		const action = selectedRfd.userHasEndorsed ? 'unendorse' : 'endorse';

		try {
			const response = await fetch('/api/rfd', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					rfdId: selectedRfd.id,
					action
				})
			});

			if (response.ok) {
				// Update the local state optimistically
				selectedRfd = {
					...selectedRfd,
					userHasEndorsed: !selectedRfd.userHasEndorsed,
					endorsementCount: selectedRfd.userHasEndorsed
						? selectedRfd.endorsementCount - 1
						: selectedRfd.endorsementCount + 1
				};

				// Refresh the page to get updated data
				window.location.reload();
			} else {
				const errorData = await response.json();
				alert(errorData.error || 'Failed to update endorsement');
			}
		} catch (error) {
			console.error('Endorsement error:', error);
			alert('Failed to update endorsement');
		} finally {
			isEndorsing = false;
		}
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
</script>

<div class="preview-container border-l border-gray-300 bg-white">
	{#if selectedRfd}
		<div class="preview-header flex flex-col md:flex-row md:items-center md:justify-between">
			<div class="mb-4 md:mb-0">
				<div>
					<div>
						<div class="mb-2 flex items-center gap-4">
							<span
								class="rfd-number rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800"
								>{formatRfdNumber(selectedRfd.rfdNumber)}</span
							>
							<h3 class="max-w-72 truncate font-bold ...">
								{selectedRfd.title}
							</h3>
							<span
								class="status-tag inline-block rounded-full px-3 py-1 text-xs font-medium text-white"
								style="background-color: {getStatusColor(selectedRfd.status)}"
							>
								{selectedRfd.status}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div>
				<div>
					<div class="flex flex-col gap-2 md:flex-row">
						<div>
							<button
								class="rounded px-4 py-2 font-medium transition-colors {selectedRfd.userHasEndorsed
									? 'bg-green-600 text-white hover:bg-green-700'
									: 'bg-gray-200 text-gray-800 hover:bg-gray-300'}"
								on:click={handleEndorsement}
								disabled={isEndorsing}
							>
								<span class="mr-2">👍</span>
								<span>
									{#if isEndorsing}
										Processing...
									{:else if selectedRfd.userHasEndorsed}
										Endorsed ({selectedRfd.endorsementCount})
									{:else}
										Endorse ({selectedRfd.endorsementCount})
									{/if}
								</span>
							</button>
						</div>
						<div>
							<a
								href={selectedRfd.googleDocUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
							>
								<span class="mr-2">📄</span>
								<span>Open in Google Docs</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="p-6">
			{#if selectedRfd.summary}
				<div class="mb-6">
					<h3 class="mb-3 text-lg font-semibold">Summary</h3>
					<div class="rounded-lg bg-gray-50 p-4">
						<p>{selectedRfd.summary}</p>
					</div>
				</div>
			{/if}

			<div class="mb-6">
				<h3 class="mb-3 text-lg font-semibold">Details</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<div class="mb-3">
							<label class="mb-1 block text-sm font-medium text-gray-700">Created</label>
							<div>
								<span class="text-gray-600">{formatDate(selectedRfd.createdAt)}</span>
							</div>
						</div>
					</div>
					<div>
						<div class="mb-3">
							<label class="mb-1 block text-sm font-medium text-gray-700">Last Updated</label>
							<div>
								<span class="text-gray-600">{formatDate(selectedRfd.updatedAt)}</span>
							</div>
						</div>
					</div>

					<div>
						<div class="mb-3">
							<label class="mb-1 block text-sm font-medium text-gray-700">Creator</label>
							<div>
								<span class="font-medium">{selectedRfd.authorName || 'Unknown'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{#if parseTags(selectedRfd.tags).length > 0}
				<div class="mb-6">
					<h3 class="mb-3 text-lg font-semibold">Tags</h3>
					<div class="flex flex-wrap gap-2">
						{#each parseTags(selectedRfd.tags) as tag}
							<span class="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
								>{tag}</span
							>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mb-6">
				<h3 class="mb-3 text-lg font-semibold">Google Document</h3>
				<div class="doc-embed overflow-hidden rounded-lg border border-gray-200">
					<iframe
						src="{selectedRfd.googleDocUrl}/preview?embedded=true&rm=minimal&widget=true&chrome=false"
						title="RFD Document Preview"
						class="doc-iframe"
						sandbox="allow-scripts allow-same-origin"
					></iframe>
				</div>
			</div>
		</div>
	{:else}
		<div class="empty-state text-center">
			<div class="empty-icon">
				<span class="text-6xl text-gray-300"> 📄 </span>
			</div>
			<h2 class="mb-2 text-xl font-bold text-gray-600">Select an RFD to preview</h2>
			<p class="text-sm text-gray-500">
				Click on any RFD from the list to see its details and preview here.
			</p>
		</div>
	{/if}
</div>

<style>
	.preview-container {
		width: 100%;
		height: 100vh;
		overflow-y: auto;
	}

	.preview-header {
		border-bottom: 1px solid #e5e7eb;
		padding: 1.5rem;
		margin-bottom: 0;
	}

	.rfd-number {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.status-tag {
		text-transform: capitalize;
		font-weight: 500;
	}

	.doc-embed {
		height: 600px;
		overflow: hidden;
	}

	.doc-iframe {
		width: 100%;
		height: 100%;
		border: none;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: 3rem;
	}

	.empty-icon {
		margin-bottom: 1.5rem;
	}

	/* Responsive adjustments handled by Tailwind classes */
</style>
