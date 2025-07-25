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
	let filteredTags = $derived(
		availableTags.filter(
			(tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
		)
	);
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

<div class="mobile-form">
	{#if error}
		<div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			<div class="flex items-center">
				<span class="icon">
					<i class="fa-solid fa-circle-xmark"></i>
				</span>
				{error}
			</div>
		</div>
	{/if}

	<div class="mb-4">
		<p class="text-gray-600">Start a new Request for Discussion using a template</p>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			createRFD();
		}}
	>
		<div class="field">
			<label class="label" for="template">Select Template ({templates.length} available)</label>
			<div class="control">
				<div class="select">
					<select id="template" bind:value={selectedTemplate} required>
						<option value="">
							{#if templates.length === 0}
								No templates found...
							{:else}
								Choose a template...
							{/if}
						</option>
						{#each templates as template (template.id)}
							<option value={template.id}>{template.name}</option>
						{/each}
					</select>
				</div>
				{#if templates.length === 0}
					<p class="mt-2 flex items-center text-xs text-gray-600">
						No RFD templates found. Make sure you have documents with "RFD Template" in the name.
					</p>
				{/if}
			</div>
		</div>
		<div class="field">
			<label class="label" for="title">RFD Title *</label>
			<div class="control">
				<input
					class="input"
					type="text"
					id="title"
					bind:value={title}
					placeholder="Brief, descriptive title for your RFD"
					required
				/>
			</div>
		</div>
		<div class="field">
			<label class="label" for="description">Summary</label>
			<div class="control">
				<textarea
					class="textarea"
					id="description"
					bind:value={description}
					placeholder="Brief description of what this RFD discusses"
				></textarea>
			</div>
		</div>
		<div class="field">
			<label class="label" for="tags">Tags</label>
			<div class="flex flex-wrap gap-2">
				{#each tags as tag (tag)}
					<span
						class="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
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
			<div class="control">
				<input
					class="input"
					type="text"
					id="tags"
					bind:value={tagInput}
					oninput={handleTagInput}
					onkeydown={handleTagInput}
					onblur={() => setTimeout(() => (showTagDropdown = false), 150)}
					onfocus={() => (showTagDropdown = tagInput.length > 0)}
					placeholder="Add tags (press Enter or comma to add)"
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

		<!-- Actions -->
		<div class="buttons">
			<button
				class="button is-success"
				type="submit"
				disabled={isLoading || !selectedTemplate || !title.trim()}
			>
				{#if isLoading}
					<span class="icon">
						<i class="fa-solid fa-spinner"></i>
					</span>
					&emsp;Creating...
				{:else}
					Create RFD
				{/if}
			</button>
			<button class="button" onclick={resetForm}>Cancel</button>
		</div>
	</form>
</div>

<style>
</style>
