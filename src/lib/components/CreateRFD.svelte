<script lang="ts">
	import { onMount } from 'svelte';
	interface CreateRFDProps {
		onClose: () => void;
		onRfdCreated?: () => void;
	}

	const { onClose, onRfdCreated }: CreateRFDProps = $props();

	interface Template {
		id: string;
		name: string;
		createdTime: string;
		modifiedTime: string;
	}

	let templates: Template[] = $state([]);
	let selectedTemplate = $state('');
	let title = $state('');
	let description = $state('');
	let tags: string[] = $state([]);
	let tagInput = $state('');
	let availableTags: string[] = $state([]);
	let showTagDropdown = $state(false);
	let filteredTags = $derived(availableTags.filter(
		(tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
	));
	let isLoading = $state(false);
	let error = $state('');

	onMount(async () => {
		await loadTemplates();
		await loadAvailableTags();
	});

	async function loadTemplates() {
		try {
			const response = await fetch('/api/rfd/templates');
			if (response.ok) {
				const data = await response.json();
				templates = data.templates || [];
				if (templates.length === 0) {
					console.warn('No templates found in response');
				}
			} else {
				const errorData = await response.json();
				error = errorData.error || 'Failed to load templates';
				console.error('Templates API error:', response.status, errorData);
			}
		} catch (err) {
			error = 'Error loading templates';
			console.error('Template loading error:', err);
		}
	}

	async function createRFD() {
		if (!selectedTemplate || !title.trim()) {
			error = 'Please select a template and enter a title';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/rfd', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					templateId: selectedTemplate,
					title: title.trim(),
					description: description.trim(),
					tags: tags
				})
			});

			if (response.ok) {
				const data = await response.json();
				// Redirect to the Google Doc
				window.open(data.googleDocUrl, '_blank');
				// Notify parent component about the new RFD
				if (onRfdCreated) {
					onRfdCreated();
				}
				// Reset form
				resetForm();
			} else {
				const errorData = await response.json();
				error = errorData.error || 'Failed to create RFD';
			}
		} catch (err) {
			error = 'Error creating RFD';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	function resetForm() {
		title = '';
		description = '';
		tags = [];
		tagInput = '';
		showTagDropdown = false;
		selectedTemplate = '';
		onClose();
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

	function addTag(tag: string) {
		const trimmedTag = tag.trim();
		if (trimmedTag && !tags.includes(trimmedTag)) {
			tags = [...tags, trimmedTag];
		}
		tagInput = '';
		showTagDropdown = false;
	}

	function removeTag(tagToRemove: string) {
		tags = tags.filter((tag) => tag !== tagToRemove);
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
</script>

<div class="mobile-form rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
	{#if error}
		<div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			<div class="flex items-center">
				<svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				{error}
			</div>
		</div>
	{/if}

	<div class="mb-6">
		<h2 class="mb-2 text-xl font-bold text-gray-800">Create New RFD</h2>
		<p class="text-gray-600">Start a new Request for Discussion using a template</p>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			createRFD();
		}}
	>
		<!-- Template Selection -->
		<div class="mb-6">
			<label for="template" class="mb-3 flex items-center text-sm font-semibold text-gray-700">
				<svg class="mr-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
						clip-rule="evenodd"
					/>
				</svg>
				Select Template ({templates.length} available)
			</label>
			<select
				id="template"
				bind:value={selectedTemplate}
				class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				required
			>
				<option value="">
					{#if templates.length === 0}
						No templates found...
					{:else}
						Choose a template...
					{/if}
				</option>
				{#each templates as template}
					<option value={template.id}>{template.name}</option>
				{/each}
			</select>
			{#if templates.length === 0}
				<p class="mt-2 flex items-center text-sm text-gray-600">
					<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					No RFD templates found. Make sure you have documents with "RFD Template" in the name.
				</p>
			{/if}
		</div>

		<!-- Title -->
		<div class="mb-6">
			<label for="title" class="mb-3 flex items-center text-sm font-semibold text-gray-700">
				<svg class="mr-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
				RFD Title *
			</label>
			<input
				type="text"
				id="title"
				bind:value={title}
				placeholder="Brief, descriptive title for your RFD"
				class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				required
			/>
		</div>

		<!-- Description -->
		<div class="mb-6">
			<label for="description" class="mb-3 flex items-center text-sm font-semibold text-gray-700">
				<svg class="mr-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
				Description
			</label>
			<textarea
				id="description"
				bind:value={description}
				placeholder="Brief description of what this RFD discusses"
				rows="4"
				class="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			></textarea>
		</div>

		<!-- Tags -->
		<div class="mb-8">
			<label for="tags" class="mb-3 flex items-center text-sm font-semibold text-gray-700">
				<svg class="mr-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
						clip-rule="evenodd"
					/>
				</svg>
				Tags
			</label>
			<div class="relative">
				<div class="mb-2 flex flex-wrap gap-2">
					{#each tags as tag}
						<span
							class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
							style="background-color: {generateTagColor(tag)}"
						>
							{tag}
							<button
								type="button"
								onclick={() => removeTag(tag)}
								class="ml-1 text-white hover:text-gray-200"
							>
								×
							</button>
						</span>
					{/each}
				</div>
				<input
					type="text"
					id="tags"
					bind:value={tagInput}
					oninput={handleTagInput}
					onkeydown={handleTagInput}
					onblur={() => setTimeout(() => (showTagDropdown = false), 150)}
					onfocus={() => (showTagDropdown = tagInput.length > 0)}
					placeholder="Add tags (press Enter or comma to add)"
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
			<p class="mt-2 flex items-center text-sm text-gray-500">
				<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
				Press Enter or comma to add tags. Click × to remove.
			</p>
		</div>

		<!-- Actions -->
		<div class="flex justify-end space-x-4">
			<button
				type="button"
				onclick={resetForm}
				class="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
			>
				<svg class="mr-2 inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
				Cancel
			</button>
			<button
				type="submit"
				disabled={isLoading || !selectedTemplate || !title.trim()}
				class="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{#if isLoading}
					<svg class="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Creating...
				{:else}
					<svg class="mr-2 inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
							clip-rule="evenodd"
						/>
					</svg>
					Create RFD
				{/if}
			</button>
		</div>
	</form>
</div>

<style>
	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.mobile-form {
			padding: 1rem;
			margin: 0.5rem;
			border-radius: 0.5rem;
		}

		/* Stack action buttons vertically on mobile */
		.mobile-form form > div:last-child {
			flex-direction: column;
			gap: 0.75rem;
		}

		.mobile-form form > div:last-child button {
			width: 100%;
		}
	}
</style>
