<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	interface Template {
		id: string;
		name: string;
		createdTime: string;
		modifiedTime: string;
	}

	let templates: Template[] = [];
	let selectedTemplate = '';
	let title = '';
	let description = '';
	let tags = '';
	let isLoading = false;
	let error = '';

	onMount(async () => {
		await loadTemplates();
	});

	async function loadTemplates() {
		try {
			const response = await fetch('/api/rfd/templates');
			if (response.ok) {
				const data = await response.json();
				templates = data.templates;
			} else {
				error = 'Failed to load templates';
			}
		} catch (err) {
			error = 'Error loading templates';
			console.error(err);
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
					tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
				})
			});

			if (response.ok) {
				const data = await response.json();
				// Redirect to the Google Doc
				window.open(data.googleDocUrl, '_blank');
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
		tags = '';
		selectedTemplate = '';
		dispatch('close');
	}
</script>

<div class="p-6">
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	<div class="mb-4">
		<p class="text-gray-600 text-sm">Start a new Request for Discussion using a template</p>
	</div>

	<form onsubmit={(e) => { e.preventDefault(); createRFD(); }}>
		<!-- Template Selection -->
		<div class="mb-4">
			<label for="template" class="block text-sm font-medium text-gray-700 mb-2">
				Select Template
			</label>
			<select
				id="template"
				bind:value={selectedTemplate}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				required
			>
				<option value="">Choose a template...</option>
				{#each templates as template}
					<option value={template.id}>{template.name}</option>
				{/each}
			</select>
		</div>

		<!-- Title -->
		<div class="mb-4">
			<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
				RFD Title *
			</label>
			<input
				type="text"
				id="title"
				bind:value={title}
				placeholder="Brief, descriptive title for your RFD"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				required
			/>
		</div>

		<!-- Description -->
		<div class="mb-4">
			<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
				Description
			</label>
			<textarea
				id="description"
				bind:value={description}
				placeholder="Brief description of what this RFD discusses"
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			></textarea>
		</div>

		<!-- Tags -->
		<div class="mb-6">
			<label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
				Tags
			</label>
			<input
				type="text"
				id="tags"
				bind:value={tags}
				placeholder="architecture, api, security, frontend (comma-separated)"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<p class="text-sm text-gray-500 mt-1">Separate tags with commas</p>
		</div>

		<!-- Actions -->
		<div class="flex justify-end space-x-3">
			<button
				type="button"
				onclick={resetForm}
				class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={isLoading || !selectedTemplate || !title.trim()}
				class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors font-medium"
			>
				{#if isLoading}
					Creating...
				{:else}
					Create RFD
				{/if}
			</button>
		</div>
	</form>
</div>