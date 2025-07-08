<script lang="ts">
	import { getStatusColor, getStatusLabel, statusOptions } from '$lib/utils/statusUtils.js';
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
	// Tab management
	let activeTab = 'metadata';
	const tabs = [
		{ id: 'metadata', label: 'Metadata', icon: '📋' },
		{ id: 'document', label: 'RFD Document', icon: '📄' },
		{ id: 'pumping', label: "Who's Pumping!", icon: '🔥' }
	];
	// Permission checks
	$: isAdmin = user?.role === 'admin';
	$: isOwner = user?.id === selectedRfd?.authorId;
	$: canEdit = isAdmin || isOwner;
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
			const response = await fetch(`/api/rfd/${selectedRfd.id}/endorsement`, {
				method: action === 'pump' ? 'POST' : 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (response.ok) {
				const result = await response.json();
				// Update selectedRfd with the fresh data from the server
				selectedRfd = result.rfd;
				// Notify parent component of the update
				if (onRfdUpdate) {
					onRfdUpdate(result.rfd);
				}
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

	async function handleCopyLink() {
		if (!selectedRfd) return;

		const url = `${window.location.origin}/${selectedRfd.rfdNumber}`;

		try {
			await navigator.clipboard.writeText(url);
			// You could add a toast notification here in the future
			console.log('Link copied to clipboard');
		} catch (error) {
			console.error('Failed to copy link:', error);
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = url;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand('copy');
				console.log('Link copied to clipboard (fallback)');
			} catch (fallbackError) {
				console.error('Fallback copy failed:', fallbackError);
				alert('Failed to copy link. Please copy manually: ' + url);
			}
			document.body.removeChild(textArea);
		}
	}
	function setActiveTab(tabId: string) {
		activeTab = tabId;
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
			const response = await fetch(`/api/rfd/${selectedRfd.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
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
								{getStatusLabel(selectedRfd.status)}
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
								class="btn btn-light"
								onclick={handleCopyLink}
								title="Copy link to this RFD"
							>
								<span>🔗</span>
								<span>Copy Link</span>
							</button>
						</div>
						<div>
							<button
								class="btn {selectedRfd.userHasEndorsed ? 'btn-danger' : 'btn-light'}"
								onclick={handlePump}
								disabled={isEndorsing}
							>
								<span>🔥</span>
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
								class="btn btn-primary"
							>
								<span>📄</span>
								<span>Open in Google Docs</span>
							</a>
						</div>
						{#if canEdit}
							<div>
								<button
									class="btn btn-secondary"
									onclick={startEditing}
									disabled={isEditing}
								>
									<span>✏️</span>
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
								{#each editedTags as tag (tag)}
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
									{#each filteredTags.slice(0, 10) as tag (tag)}
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
								{#each statusOptions as option (option.value)}
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
							class="btn btn-primary"
							onclick={saveChanges}
							disabled={isLoading}
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
						<button
							type="button"
							class="btn btn-outline"
							onclick={cancelEditing}
							disabled={isLoading}
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		{/if}
		<!-- Tab Navigation -->
		<div class="tab-navigation border-b border-gray-200 bg-white">
			<div class="flex">
				{#each tabs as tab (tab.id)}
					<button
						class="tab-button flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors {activeTab ===
						tab.id
							? 'border-b-2 border-blue-500 text-blue-600'
							: 'text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						onclick={() => setActiveTab(tab.id)}
					>
						<span>{tab.icon}</span>
						<span>{tab.label}</span>
						{#if tab.id === 'pumping' && selectedRfd.endorsementCount > 0}
							<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
								{selectedRfd.endorsementCount}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		<!-- Tab Content -->
		<div class="tab-content overflow-y-auto">
			{#if activeTab === 'metadata'}
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
									<div class="mb-1 block text-sm font-medium text-gray-700">Status</div>
									<div>
										<span
											class="inline-block rounded-full px-3 py-1 text-xs font-medium text-white"
											style="background-color: {getStatusColor(selectedRfd.status)}"
										>
											{getStatusLabel(selectedRfd.status)}
										</span>
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
						</div>
					</div>
					{#if parseTags(selectedRfd.tags).length > 0}
						<div class="mb-6">
							<h3 class="mb-3 text-lg font-semibold">Tags</h3>
							<div class="flex flex-wrap gap-2">
								{#each parseTags(selectedRfd.tags) as tag (tag)}
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

					<!-- Document Actions -->
					<div class="mb-6">
						<h3 class="mb-3 text-lg font-semibold">Document</h3>
						<div class="flex flex-col gap-2 sm:flex-row">
							<button
								onclick={() => setActiveTab('document')}
								class="btn btn-primary"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								Read RFD
							</button>
							<a
								href={selectedRfd.googleDocUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-success"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
								Open Google Docs
							</a>
						</div>
					</div>
				</div>
			{:else if activeTab === 'document'}
				<div class="document-tab-container">
					<div class="document-header">
						<h3 class="text-lg font-semibold">Google Document</h3>
					</div>
					<div class="doc-embed overflow-hidden rounded-lg border border-gray-200">
						<iframe
							src="{selectedRfd.googleDocUrl}/preview?embedded=true&rm=minimal&widget=true&chrome=false"
							title="RFD Document Preview"
							class="doc-iframe"
							sandbox="allow-scripts allow-same-origin"
						></iframe>
					</div>
				</div>
			{:else if activeTab === 'pumping'}
				<div class="p-6">
					<div class="mb-6">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-lg font-semibold">Who's Pumping! 🔥</h3>
							<div class="text-right">
								<p class="text-sm text-gray-600">
									{selectedRfd.endorsementCount} pump{selectedRfd.endorsementCount !== 1 ? 's' : ''}
									total
								</p>
							</div>
						</div>
						<div class="mb-6">
							<button
								class="w-full rounded-lg border-2 border-dashed px-4 py-3 font-medium transition-colors {selectedRfd.userHasEndorsed
									? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
									: 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'}"
								onclick={handlePump}
								disabled={isEndorsing}
							>
								<span class="mr-2 text-xl">🔥</span>
								<span>
									{#if isEndorsing}
										Processing...
									{:else if selectedRfd.userHasEndorsed}
										You've pumped this RFD! Click to unpump.
									{:else}
										Pump this RFD!
									{/if}
								</span>
							</button>
						</div>
						{#if selectedRfd.endorsers && selectedRfd.endorsers.length > 0}
							<div class="space-y-3">
								{#each selectedRfd.endorsers as endorser (endorser.userId)}
									<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
										{#if endorser.picture}
											<img
												src={endorser.picture}
												alt={endorser.name || 'User'}
												class="h-10 w-10 rounded-full object-cover"
											/>
										{:else}
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-sm font-semibold text-white"
											>
												{(endorser.name || 'U').charAt(0).toUpperCase()}
											</div>
										{/if}
										<div class="flex-1">
											<p class="font-medium text-gray-900">{endorser.name || 'Unknown User'}</p>
											<p class="text-sm text-gray-500">
												Pumped on {formatDate(endorser.createdAt)}
											</p>
										</div>
										<span class="text-xl">🔥</span>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-8 text-center">
								<div class="mb-3 text-4xl">😭</div>
								<p class="text-gray-500">No one has pumped this RFD yet.</p>
								<p class="mt-1 text-sm text-gray-400">Be the first to show your support!</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
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
		overflow: hidden;
		display: flex;
		flex-direction: column;
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
	.document-tab-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1.5rem;
	}

	.document-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		flex-shrink: 0;
	}

	.doc-embed {
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}
	/* Mobile preview adjustments */
	@media (max-width: 768px) {
		.preview-header {
			padding: 1rem;
		}
		.document-tab-container {
			padding: 1rem;
			height: auto;
		}
		
		.doc-embed {
			height: 400px;
			flex: none;
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
	/* Tab Styles */
	.tab-navigation {
		flex-shrink: 0;
		border-bottom: 1px solid #e5e7eb;
	}
	.tab-button {
		border: none;
		background: none;
		cursor: pointer;
		outline: none;
		border-bottom: 2px solid transparent;
		position: relative;
	}
	.tab-button:hover {
		border-bottom-color: #d1d5db;
	}
	.tab-content {
		flex: 1;
		overflow-y: auto;
		height: calc(100vh - 200px); /* Account for header and tabs */
	}
	/* Mobile tab adjustments */
	@media (max-width: 768px) {
		.tab-navigation .flex {
			overflow-x: auto;
			white-space: nowrap;
		}
		.tab-button {
			min-width: 120px;
			padding: 0.5rem 1rem;
			font-size: 0.875rem;
		}
		.tab-content {
			height: calc(100vh - 180px);
		}
	}
	/* Responsive adjustments handled by Tailwind classes */
</style>
