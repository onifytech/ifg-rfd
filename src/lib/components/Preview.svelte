<script lang="ts">
	import {
		getStatusLabel,
		statusOptions,
		getStatusDescription,
		shouldShowStatusDescription,
		getStatusColorScheme
	} from '$lib/utils/statusUtils';
	import { toast } from '$lib/stores/toast.js';
	import type { RFD } from '$lib/types/rfd';
	import type { User } from '$lib/types/user';
	import type { Endorser } from '$lib/types/rfd';

	export let selectedRfd: RFD | null = null;
	export let isMobileModal: boolean = false;
	export let user: User | null = null;
	export let onRfdUpdate: ((updatedRfd: RFD) => void) | null = null;

	let isEndorsing = false;
	let endorsers: Endorser[] = [];
	let loadingEndorsers = false;
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
	let activeTab = 'document';
	const tabs = [
		// { id: 'metadata', label: 'Metadata', icon: '📋' },
		{ id: 'document', label: 'Preview', icon: 'fa-file' },
		{ id: 'pumping', label: 'Hearters', icon: 'fa-heart' }
	];
	// Permission checks
	$: isAdmin = user?.role === 'admin';
	$: isOwner = user?.id === selectedRfd?.authorId;
	$: canEdit = isAdmin || isOwner;
	$: canChangeStatus =
		isAdmin ||
		(isOwner && (selectedRfd?.status === 'draft' || selectedRfd?.status === 'open_for_review'));
	$: isDraft = selectedRfd?.status === 'draft';
	$: isOpenForReview = selectedRfd?.status === 'open_for_review';

	// Status description reactive variables
	$: currentStatusDescription = selectedRfd ? getStatusDescription(selectedRfd.status) : null;
	$: showStatusDescription = selectedRfd
		? shouldShowStatusDescription(selectedRfd.status, isOwner, isAdmin)
		: false;
	$: statusColorScheme = currentStatusDescription
		? getStatusColorScheme(currentStatusDescription.colorScheme)
		: null;

	// Filter status options based on user permissions
	$: availableStatusOptions = (() => {
		if (isAdmin) {
			return statusOptions; // Admins can change to any status
		}

		if (isOwner && selectedRfd) {
			if (selectedRfd.status === 'draft') {
				// Draft creators can only change to open_for_review
				return statusOptions.filter(
					(option) => option.value === 'draft' || option.value === 'open_for_review'
				);
			} else if (selectedRfd.status === 'open_for_review') {
				// Open for review creators can only change back to draft
				return statusOptions.filter(
					(option) => option.value === 'draft' || option.value === 'open_for_review'
				);
			}
		}

		return statusOptions;
	})();

	// Clear endorsers when switching to a different RFD
	$: if (selectedRfd) {
		// Clear endorsers data when RFD changes
		endorsers = [];
		loadingEndorsers = false;
	}
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
		const action = selectedRfd.userHasEndorsed ? 'unheart' : 'heart';
		try {
			const response = await fetch(`/api/rfd/${selectedRfd.id}/endorsement`, {
				method: action === 'heart' ? 'POST' : 'DELETE',
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
				// Refresh endorsers if we're on the hearters tab
				if (activeTab === 'pumping' && endorsers.length > 0) {
					await loadEndorsers();
				}
				// Show success toast
				const message = action === 'heart' ? 'RFD hearted!' : 'Heart removed';
				toast.success(message);
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || 'Failed to update heart');
			}
		} catch (error) {
			console.error('Heart error:', error);
			toast.error('Failed to update heart');
		} finally {
			isEndorsing = false;
		}
	}

	async function handleCopyLink() {
		if (!selectedRfd) return;

		const url = `${window.location.origin}/${selectedRfd.rfdNumber}`;

		try {
			await navigator.clipboard.writeText(url);
			toast.success('Link copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy link:', error);
			toast.error('Failed to copy link. Please copy manually: ' + url);
		}
	}
	async function setActiveTab(tabId: string) {
		activeTab = tabId;
		// Load endorsers when switching to the Hearters tab
		if (tabId === 'pumping' && selectedRfd && endorsers.length === 0 && !loadingEndorsers) {
			await loadEndorsers();
		}
	}

	async function loadEndorsers() {
		if (!selectedRfd || loadingEndorsers) return;
		
		loadingEndorsers = true;
		try {
			const response = await fetch(`/api/rfd/${selectedRfd.id}/endorsers`);
			if (response.ok) {
				const data = await response.json();
				endorsers = data.endorsers || [];
			} else if (response.status === 403) {
				// Access denied for draft RFD
				endorsers = [];
			} else {
				console.error('Failed to load endorsers:', response.statusText);
				endorsers = [];
			}
		} catch (error) {
			console.error('Error loading endorsers:', error);
			endorsers = [];
		} finally {
			loadingEndorsers = false;
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

	function openCreateModal() {
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
		// Prevent body scroll when modal is open
		document.body.style.overflow = 'hidden';
	}

	function closeCreateModal() {
		isEditing = false;
		// Restore body scroll
		document.body.style.overflow = '';
		return;
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
		if (hasStatusChange && !canChangeStatus) {
			error = 'You do not have permission to change this RFD status';
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

			console.log(result.rfd);
			if (!response.ok) {
				throw new Error(result.error || 'Failed to update RFD');
			}
			if (onRfdUpdate) {
				onRfdUpdate(result.rfd);
			}

			// Show appropriate success message
			const wasPublished =
				selectedRfd?.status === 'draft' && result.rfd.status === 'open_for_review';
			const wasMadePrivate =
				selectedRfd?.status === 'open_for_review' && result.rfd.status === 'draft';

			let successMessage = 'RFD updated successfully!';
			if (wasPublished) {
				successMessage = 'RFD published for review! It is now visible to all team members.';
			} else if (wasMadePrivate) {
				successMessage = 'RFD moved back to draft. It is now private and only visible to you.';
			}

			toast.success(successMessage);

			isEditing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="column is-two-thirds {isMobileModal ? 'mobile-modal-preview' : ''} bg-white">
	{#if selectedRfd}
		<div class="preview-header">
			<h1 class="title is-4">{selectedRfd.title}</h1>
			{#if selectedRfd.summary}
				<p class="mb-5">{selectedRfd.summary}</p>
			{/if}
			<div class="fixed-grid has-2-cols">
				<div class="grid">
					<div class="cell is-row-start-1">
						<div class="mb-1 text-sm font-bold">Number</div>
						<div class="text-sm">{formatRfdNumber(selectedRfd.rfdNumber)}</div>
					</div>
					<div class="cell">
						<div class="mb-1 text-sm font-bold">Status</div>
						<div class="text-sm">{getStatusLabel(selectedRfd.status)}</div>
					</div>

					<div class="cell is-row-start-2">
						<div class="mb-1 text-sm font-bold">Author</div>
						<div class="text-sm">{selectedRfd.authorName || 'Unknown'}</div>
					</div>

					<div class="cell">
						<div class="mb-1 text-sm font-bold">Docs ID</div>
						<div class="text-sm">{selectedRfd.id}</div>
					</div>

					<div class="cell is-row-start-3">
						<div class="mb-1 text-sm font-bold">Last Updated</div>
						<div class="text-sm">{formatDate(selectedRfd.updatedAt)}</div>
					</div>
					<div class="cell">
						<div class="mb-1 text-sm font-bold">Created</div>
						<div class="text-sm">{formatDate(selectedRfd.createdAt)}</div>
					</div>
				</div>
			</div>
			{#if parseTags(selectedRfd.tags).length > 0}
				<div class="mb-5">
					<div class="mb-3 text-sm font-bold">Tags</div>
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
			<div class="mb-5 flex flex-col gap-4 md:flex-row">
				<div>
					<button class="btn btn-light" onclick={handleCopyLink} title="Copy link to this RFD">
						<span class="icon"><i class="fa fa-link text-xl"></i></span>
						<span>Copy Link</span>
					</button>
				</div>
				<div>
					<button
						class="btn {selectedRfd.userHasEndorsed
							? 'btn-danger text-white'
							: 'btn-light text-red-600'}"
						onclick={handlePump}
						disabled={isEndorsing}
					>
						<span class="icon"><i class="fa fa-heart text-xl"></i></span>
						<span>
							{#if isEndorsing}
								Processing...
							{:else if selectedRfd.userHasEndorsed}
								Hearted ({selectedRfd.endorsementCount})
							{:else}
								Heart ({selectedRfd.endorsementCount})
							{/if}
						</span>
					</button>
				</div>
				<div>
					<a
						href={selectedRfd.googleDocUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary !hover:no-underline"
					>
						<span class="icon"><i class="fa fa-file text-xl"></i></span>
						<span>Open in Google Docs</span>
					</a>
				</div>
				{#if canEdit}
					<div>
						<button class="btn btn-secondary" onclick={openCreateModal}>
							<span class="icon"><i class="fa fa-pencil text-xl"></i></span>
							<span>Edit</span>
						</button>
					</div>
				{/if}
			</div>
		</div>
		{#if isEditing}
			<div class="modal is-active">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="modal-background" role="button" tabindex="0" onclick={closeCreateModal}></div>
				<div class="modal-card">
					<header class="modal-card-head">
						<p class="modal-card-title">Edit RFD</p>
						<button class="delete" aria-label="close" onclick={closeCreateModal}></button>
					</header>
					<section class="modal-card-body">
						<div class="edit-form">
							<div class="field">
								<label class="label" for="title">RFD Title</label>
								<div class="control">
									<input
										class="input"
										type="text"
										id="title"
										bind:value={editedTitle}
										placeholder="Brief, descriptive title for your RFD"
										disabled={isLoading || (!isOwner && !isAdmin)}
									/>
								</div>
							</div>
							<div class="field">
								<label class="label" for="summary">Summary</label>
								<div class="control">
									<textarea
										class="textarea"
										id="summary"
										bind:value={editedSummary}
										disabled={isLoading || (!isOwner && !isAdmin)}
									></textarea>
								</div>
							</div>
							<div class="field">
								<label class="label" for="tags">Tags</label>
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
										id="tags"
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
								<p class="mt-2 flex items-center text-xs text-gray-500">
									Press Enter or comma to add tags. Click × to remove.
								</p>
							</div>
							{#if canChangeStatus}
								<div class="field">
									<label for="status-edit" class="mb-2 block text-sm font-medium text-gray-700">
										{isDraft
											? 'Publish RFD - Change Status:'
											: isOpenForReview && isOwner
												? 'Status (Draft ↔ Review):'
												: 'Status:'}
									</label>
									{#if isDraft}
										<p class="mb-2 text-sm text-gray-600">
											Change to "Open for Review" to make this RFD visible to all team members for
											feedback.
										</p>
									{:else if isOpenForReview && isOwner}
										<p class="mb-2 text-sm text-gray-600">
											You can change back to "Draft" to make it private again, or leave it for admin
											review.
										</p>
									{/if}
									<select
										id="status-edit"
										bind:value={selectedStatus}
										class="form-select w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
										disabled={isLoading}
									>
										{#each availableStatusOptions as option (option.value)}
											<option value={option.value}>{option.label}</option>
										{/each}
									</select>
								</div>
								<div class="field">
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
						</div>
					</section>
					<footer class="modal-card-foot">
						<!-- Actions -->
						<div class="buttons">
							<button
								type="button"
								class="button is-success"
								onclick={saveChanges}
								disabled={isLoading}
							>
								{isLoading ? 'Saving...' : 'Save Changes'}
							</button>
							<button class="button" onclick={cancelEditing} disabled={isLoading}>Cancel</button>
						</div>
					</footer>
				</div>
			</div>
		{/if}
		<!-- Tab Navigation -->
		<div class="tab-navigation overflow-x-auto border-b border-gray-200 bg-white">
			<div class="flex min-w-max">
				{#each tabs as tab (tab.id)}
					<button
						class="tab-button flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors md:px-6 {activeTab ===
						tab.id
							? 'border-b-2 !border-blue-500 !text-blue-600'
							: '!text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						onclick={() => setActiveTab(tab.id)}
					>
						<span class="icon"><i class={`fa ${tab.icon}`}></i></span>
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
			{#if activeTab === 'document'}
				<div class="document-tab-container">
					<div class="doc-embed overflow-hidden">
						<iframe
							src="{selectedRfd.googleDocUrl}/preview?embedded=true&rm=minimal&widget=true&chrome=false"
							title="RFD Document Preview"
							class="doc-iframe"
							sandbox="allow-scripts allow-same-origin"
						></iframe>
					</div>
				</div>
			{:else if activeTab === 'pumping'}
				<div class="p-5">
					<div class="mb-6">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-lg font-semibold">
								Who's Hearters! <span class="icon"><i class="fa fa-heart text-red-600"></i></span>
							</h3>
							<div class="text-right">
								<p class="text-sm text-gray-600">
									{selectedRfd.endorsementCount} heart{selectedRfd.endorsementCount !== 1
										? 's'
										: ''}
									total
								</p>
							</div>
						</div>
						<div class="mb-6 text-center">
							<button
								class="rounded-lg border-2 border-dashed px-4 py-3 font-medium transition-colors {selectedRfd.userHasEndorsed
									? '!hover:bg-red-100 !border-red-300 !bg-red-50 !text-red-700'
									: '!hover:bg-gray-100 !border-gray-300 !bg-gray-50 !text-gray-700'}"
								onclick={handlePump}
								disabled={isEndorsing}
							>
								<span class="icon"><i class="fa fa-heart text-xl"></i></span>
								<span>
									{#if isEndorsing}
										Processing...
									{:else if selectedRfd.userHasEndorsed}
										You've hearted this RFD! Click to unheart.
									{:else}
										Click to heart this RFD!
									{/if}
								</span>
							</button>
						</div>
						{#if loadingEndorsers}
							<div class="py-8 text-center">
								<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
								<p class="text-gray-500">Loading hearters...</p>
							</div>
						{:else if endorsers && endorsers.length > 0}
							<div class="space-y-3">
								{#each endorsers as endorser (endorser.userId)}
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
												hearted on {formatDate(endorser.createdAt)}
											</p>
										</div>
										<span class="icon"><i class="fa fa-heart text-xl text-red-600"></i></span>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-8 text-center">
								<div class="mb-3 text-4xl">😭</div>
								<p class="text-gray-500">No one has hearted this RFD yet.</p>
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
	}

	.doc-embed {
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}
	/* Mobile preview adjustments */
	@media (max-width: 768px) {
		.document-tab-container {
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
		.tab-navigation {
			-webkit-overflow-scrolling: touch;
			scrollbar-width: thin;
		}
		.tab-button {
			flex-shrink: 0;
		}
		.tab-content {
			height: calc(100vh - 180px);
		}
	}
	/* Responsive adjustments handled by Tailwind classes */
</style>
