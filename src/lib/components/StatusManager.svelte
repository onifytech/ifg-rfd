<script lang="ts">
	import { getStatusLabel, statusOptions } from '$lib/utils/statusUtils.js';

	export let rfdId: string;
	export let currentStatus: string;
	export let currentTitle: string;
	export let onUpdate: (updatedRfd: any) => void;

	let isEditing = false;
	let isLoading = false;
	let selectedStatus = currentStatus;
	let editedTitle = currentTitle;
	let comment = '';
	let error = '';

	function startEditing() {
		isEditing = true;
		selectedStatus = currentStatus;
		editedTitle = currentTitle;
		comment = '';
		error = '';
	}

	function cancelEditing() {
		isEditing = false;
		selectedStatus = currentStatus;
		editedTitle = currentTitle;
		comment = '';
		error = '';
	}

	async function saveChanges() {
		if (isLoading) return;

		const hasStatusChange = selectedStatus !== currentStatus;
		const hasTitleChange = editedTitle !== currentTitle;

		if (!hasStatusChange && !hasTitleChange) {
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
					rfdId,
					status: hasStatusChange ? selectedStatus : undefined,
					title: hasTitleChange ? editedTitle : undefined,
					comment: comment || undefined
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update RFD');
			}

			onUpdate(result.rfd);
			isEditing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}
</script>

{#if isEditing}
	<div class="edit-form">
		<div class="form-group">
			<label for="title-{rfdId}">Title:</label>
			<input
				id="title-{rfdId}"
				type="text"
				bind:value={editedTitle}
				class="title-input"
				disabled={isLoading}
			/>
		</div>

		<div class="form-group">
			<label for="status-{rfdId}">Status:</label>
			<select
				id="status-{rfdId}"
				bind:value={selectedStatus}
				class="status-select"
				disabled={isLoading}
			>
				{#each statusOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="comment-{rfdId}">Comment (optional):</label>
			<textarea
				id="comment-{rfdId}"
				bind:value={comment}
				class="comment-input"
				placeholder="Add a comment about this change..."
				disabled={isLoading}
			></textarea>
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<div class="button-group">
			<button type="button" class="save-btn" onclick={saveChanges} disabled={isLoading}>
				{isLoading ? 'Saving...' : 'Save'}
			</button>
			<button type="button" class="cancel-btn" onclick={cancelEditing} disabled={isLoading}>
				Cancel
			</button>
		</div>
	</div>
{:else}
	<div class="view-mode">
		<span class="status-label">{getStatusLabel(currentStatus)}</span>
		<button type="button" class="edit-btn" onclick={startEditing}> Edit </button>
	</div>
{/if}

<style>
	.edit-form {
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 1rem;
		background: #f9fafb;
		margin-top: 0.5rem;
	}

	.form-group {
		margin-bottom: 0.75rem;
	}

	.form-group:last-of-type {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.25rem;
	}

	.title-input,
	.status-select,
	.comment-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.title-input:focus,
	.status-select:focus,
	.comment-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	.comment-input {
		resize: vertical;
		min-height: 3rem;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	.save-btn,
	.cancel-btn {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.save-btn {
		background: #3b82f6;
		color: white;
		border: 1px solid #3b82f6;
	}

	.save-btn:hover:not(:disabled) {
		background: #2563eb;
		border-color: #2563eb;
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cancel-btn {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.cancel-btn:hover:not(:disabled) {
		background: #f3f4f6;
	}

	.view-mode {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-label {
		font-weight: 500;
		text-transform: capitalize;
	}

	.edit-btn {
		background: none;
		border: 1px solid #d1d5db;
		color: #6b7280;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-btn:hover {
		background: #f3f4f6;
		color: #374151;
		border-color: #9ca3af;
	}

	.error {
		color: #ef4444;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 4px;
	}
</style>
