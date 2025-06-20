<script lang="ts">
	type User = {
		id: string;
		name: string;
		email: string;
		role: string;
		picture?: string | null;
	};

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

	export let selectedRfd: RFD | null = null;
	export let isMobileModal: boolean = false;
	export let user: User | null = null;
	export let onRfdUpdate: ((updatedRfd: RFD) => void) | null = null;

	let isEndorsing = false;
	let isEditing = false;
	let isLoading = false;
	let editedTitle = '';
	let editedSummary = '';
	let selectedStatus = '';
	let editedTags: string[] = [];
	let tagInput = '';
	let availableTags: string[] = [];
	let showTagDropdown = false;
	let comment = '';
	let error = '';

	// Permission checks
	$: isAdmin = user?.role === 'admin';
	$: isOwner = user?.id === selectedRfd?.authorId;
	$: canEdit = isAdmin || isOwner;

	const statusOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'open_for_review', label: 'Open for Review' },
		{ value: 'accepted', label: 'Accepted' },
		{ value: 'enforced', label: 'Enforced' },
		{ value: 'rejected', label: 'Rejected' },
		{ value: 'retracted', label: 'Retracted' }
	];

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

	async function handlePump() {
		if (!selectedRfd || isEndorsing) return;

		isEndorsing = true;
		const action = selectedRfd.userHasEndorsed ? 'unpump' : 'pump';

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
				alert(errorData.error || 'Failed to update pump');
			}
		} catch (error) {
			console.error('Pump error:', error);
			alert('Failed to update pump');
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

	async function loadAvailableTags() {
		try {
			const response = await fetch('/api/rfd/tags');
			if (response.ok) {
				const data = await response.json();
				availableTags = data.tags || [];
			}
		} catch (error) {
			console.error('Error loading tags:', error);
		}
	}

	function addTag(tag: string) {
		const trimmedTag = tag.trim();
		if (trimmedTag && !editedTags.includes(trimmedTag)) {
			editedTags = [...editedTags, trimmedTag];
		}
		tagInput = '';
		showTagDropdown = false;
	}

	function removeTag(tagToRemove: string) {
		editedTags = editedTags.filter((tag) => tag !== tagToRemove);
	}

	function handleTagInput(event: Event) {
		const target = event.target as HTMLInputElement;
		tagInput = target.value;
		showTagDropdown = tagInput.length > 0;

		// Add tag on Enter or comma
		if (event instanceof KeyboardEvent) {
			if (event.key === 'Enter' || event.key === ',') {
				event.preventDefault();
				if (tagInput.trim()) {
					addTag(tagInput);
				}
			} else if (event.key === 'Escape') {
				showTagDropdown = false;
			}
		}
	}

	$: filteredTags = availableTags.filter(
		(tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !editedTags.includes(tag)
	);

	function startEditing() {
		if (!selectedRfd || !canEdit) return;

		isEditing = true;
		editedTitle = selectedRfd.title;
		editedSummary = selectedRfd.summary || '';
		selectedStatus = selectedRfd.status;
		editedTags = parseTags(selectedRfd.tags);
		tagInput = '';
		showTagDropdown = false;
		comment = '';
		error = '';

		// Load available tags for autocomplete
		loadAvailableTags();
	}

	function cancelEditing() {
		isEditing = false;
		editedTitle = '';
		editedSummary = '';
		selectedStatus = '';
		editedTags = [];
		tagInput = '';
		showTagDropdown = false;
		comment = '';
		error = '';
	}

	async function saveChanges() {
		if (isLoading || !selectedRfd) return;

		const hasStatusChange = selectedStatus !== selectedRfd.status;
		const hasTitleChange = editedTitle !== selectedRfd.title;
		const hasSummaryChange = editedSummary !== (selectedRfd.summary || '');
		const hasTagsChange = JSON.stringify(editedTags) !== (selectedRfd.tags || JSON.stringify([]));

		// Check permissions for the changes being made
		if (hasStatusChange && !isAdmin) {
			error = 'Only administrators can change RFD status';
			return;
		}

		if ((hasTitleChange || hasSummaryChange || hasTagsChange) && !isOwner && !isAdmin) {
			error = 'Only the RFD owner can change title, summary, and tags';
			return;
		}

		if (!hasStatusChange && !hasTitleChange && !hasSummaryChange && !hasTagsChange) {
			cancelEditing();
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/rfd/status', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					rfdId: selectedRfd.id,
					status: hasStatusChange ? selectedStatus : undefined,
					title: hasTitleChange ? editedTitle : undefined,
					summary: hasSummaryChange ? editedSummary : undefined,
					tags: hasTagsChange ? editedTags : undefined,
					comment: comment || undefined
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update RFD');
			}

			if (onRfdUpdate) {
				onRfdUpdate(result.rfd);
			}
			isEditing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

</script>

<div
	class="preview-container {isMobileModal
		? 'mobile-modal-preview'
		: ''} border-l border-gray-300 bg-white"
>
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
									? 'bg-red-600 text-white hover:bg-red-700'
									: 'bg-gray-200 text-gray-800 hover:bg-gray-300'}"
								onclick={handlePump}
								disabled={isEndorsing}
							>
								<span class="mr-2">🔥</span>
								<span>
									{#if isEndorsing}
										Processing...
									{:else if selectedRfd.userHasEndorsed}
										Pumped ({selectedRfd.endorsementCount})
									{:else}
										Pump ({selectedRfd.endorsementCount})
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
						{#if canEdit}
							<div>
								<button
									class="inline-flex items-center rounded bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
									onclick={startEditing}
									disabled={isEditing}
								>
									<span class="mr-2">✏️</span>
									<span>Edit</span>
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		{#if isEditing}
			<div class="edit-form-container border-b border-gray-200 bg-gray-50 p-6">
				<div class="edit-form">
					<h3 class="mb-4 text-lg font-semibold">Edit RFD</h3>

					<div class="form-group mb-4">
						<label for="title-edit" class="mb-2 block text-sm font-medium text-gray-700"
							>Title:</label
						>
						<input
							id="title-edit"
							type="text"
							bind:value={editedTitle}
							class="form-input w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							disabled={isLoading || (!isOwner && !isAdmin)}
						/>
					</div>

					<div class="form-group mb-4">
						<label for="summary-edit" class="mb-2 block text-sm font-medium text-gray-700"
							>Summary:</label
						>
						<textarea
							id="summary-edit"
							bind:value={editedSummary}
							rows="3"
							class="form-input w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							disabled={isLoading || (!isOwner && !isAdmin)}
						></textarea>
					</div>

					<div class="form-group mb-4">
						<label for="tags-edit" class="mb-2 block text-sm font-medium text-gray-700">Tags:</label
						>
						<div class="relative">
							<div class="tags-container mb-2 flex flex-wrap gap-2">
								{#each editedTags as tag}
									<span
										class="tag-chip inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
										style="background-color: {generateTagColor(tag)}"
									>
										{tag}
										<button
											type="button"
											onclick={() => removeTag(tag)}
											class="ml-1 text-white hover:text-gray-200"
											disabled={isLoading || (!isOwner && !isAdmin)}
										>
											×
										</button>
									</span>
								{/each}
							</div>
							<input
								id="tags-edit"
								type="text"
								bind:value={tagInput}
								oninput={handleTagInput}
								onkeydown={handleTagInput}
								onblur={() => setTimeout(() => (showTagDropdown = false), 150)}
								onfocus={() => (showTagDropdown = tagInput.length > 0)}
								placeholder="Add tags (press Enter or comma to add)"
								class="form-input w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								disabled={isLoading || (!isOwner && !isAdmin)}
							/>
							{#if showTagDropdown && filteredTags.length > 0}
								<div
									class="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
								>
									{#each filteredTags.slice(0, 10) as tag}
										<button
											type="button"
											class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
											onclick={() => addTag(tag)}
										>
											{tag}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					{#if isAdmin}
						<div class="form-group mb-4">
							<label for="status-edit" class="mb-2 block text-sm font-medium text-gray-700"
								>Status:</label
							>
							<select
								id="status-edit"
								bind:value={selectedStatus}
								class="form-select w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								disabled={isLoading}
							>
								{#each statusOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>

						<div class="form-group mb-4">
							<label for="comment-edit" class="mb-2 block text-sm font-medium text-gray-700"
								>Comment (optional):</label
							>
							<textarea
								id="comment-edit"
								bind:value={comment}
								rows="2"
								placeholder="Add a comment about this change..."
								class="form-input w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								disabled={isLoading}
							></textarea>
						</div>
					{/if}

					{#if error}
						<div
							class="error mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700"
						>
							{error}
						</div>
					{/if}

					<div class="button-group flex gap-3">
						<button
							type="button"
							class="save-btn rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
							onclick={saveChanges}
							disabled={isLoading}
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
						<button
							type="button"
							class="cancel-btn rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
							onclick={cancelEditing}
							disabled={isLoading}
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		{/if}

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
							<div class="mb-1 block text-sm font-medium text-gray-700">Created</div>
							<div>
								<span class="text-gray-600">{formatDate(selectedRfd.createdAt)}</span>
							</div>
						</div>
					</div>
					<div>
						<div class="mb-3">
							<div class="mb-1 block text-sm font-medium text-gray-700">Last Updated</div>
							<div>
								<span class="text-gray-600">{formatDate(selectedRfd.updatedAt)}</span>
							</div>
						</div>
					</div>

					<div>
						<div class="mb-3">
							<div class="mb-1 block text-sm font-medium text-gray-700">Creator</div>
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
							<span
								class="rounded-full px-2 py-1 text-xs font-medium text-white"
								style="background-color: {generateTagColor(tag)}"
							>
								{tag}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if selectedRfd.endorsers && selectedRfd.endorsers.length > 0}
				<div class="mb-6">
					<h3 class="mb-3 text-lg font-semibold">Who's Pumping 🔥</h3>
					<div class="flex flex-wrap gap-3">
						{#each selectedRfd.endorsers as endorser}
							<div class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
								{#if endorser.picture}
									<img
										src={endorser.picture}
										alt={endorser.name || 'User'}
										class="h-6 w-6 rounded-full object-cover"
									/>
								{:else}
									<div
										class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white"
									>
										{(endorser.name || 'U').charAt(0).toUpperCase()}
									</div>
								{/if}
								<span class="text-sm font-medium text-gray-900"
									>{endorser.name || 'Unknown User'}</span
								>
							</div>
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

	/* Mobile modal preview styles */
	.mobile-modal-preview {
		border: none !important;
		height: auto !important;
		overflow-y: visible !important;
	}

	.mobile-modal-preview .preview-header {
		padding: 1rem !important;
	}

	.mobile-modal-preview .doc-embed {
		height: 400px !important;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.preview-container:not(.mobile-modal-preview) {
			display: none; /* Hide regular preview on mobile */
		}
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

	/* Mobile preview adjustments */
	@media (max-width: 768px) {
		.preview-header {
			padding: 1rem;
		}

		.doc-embed {
			height: 400px; /* Smaller embed height on mobile */
		}

		.empty-state {
			min-height: 200px;
			padding: 2rem;
		}
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
