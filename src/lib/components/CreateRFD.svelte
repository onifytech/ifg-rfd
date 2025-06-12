<script lang="ts">
	import { onMount } from 'svelte';
	interface CreateRFDProps {
		onClose: () => void;
	}

	const { onClose }: CreateRFDProps = $props();

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
					tags: tags
						.split(',')
						.map((tag) => tag.trim())
						.filter((tag) => tag)
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
		onClose();
	}
</script>

<div class="mobile-form p-6">
	{#if error}
		<div class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			{error}
		</div>
	{/if}

	<div class="mb-4">
		<p class="text-sm text-gray-600">Start a new Request for Discussion using a template</p>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			createRFD();
		}}
	>
		<!-- Template Selection -->
		<div class="mb-4">
			<label for="template" class="mb-2 block text-sm font-medium text-gray-700">
				Select Template
			</label>
			<select
				id="template"
				bind:value={selectedTemplate}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
			<label for="title" class="mb-2 block text-sm font-medium text-gray-700"> RFD Title * </label>
			<input
				type="text"
				id="title"
				bind:value={title}
				placeholder="Brief, descriptive title for your RFD"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				required
			/>
		</div>

		<!-- Description -->
		<div class="mb-4">
			<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
				Description
			</label>
			<textarea
				id="description"
				bind:value={description}
				placeholder="Brief description of what this RFD discusses"
				rows="3"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			></textarea>
		</div>

		<!-- Tags -->
		<div class="mb-6">
			<label for="tags" class="mb-2 block text-sm font-medium text-gray-700"> Tags </label>
			<input
				type="text"
				id="tags"
				bind:value={tags}
				placeholder="architecture, api, security, frontend (comma-separated)"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			<p class="mt-1 text-sm text-gray-500">Separate tags with commas</p>
		</div>

		<!-- Actions -->
		<div class="flex justify-end space-x-3">
			<button
				type="button"
				onclick={resetForm}
				class="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={isLoading || !selectedTemplate || !title.trim()}
				class="rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
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

<style>
	/* Mobile responsiveness for form */
	@media (max-width: 768px) {
		.mobile-form {
			padding: 1rem;
		}

		/* Stack action buttons vertically on mobile */
		.mobile-form form > div:last-child {
			flex-direction: column;
			gap: 0.5rem;
		}

		.mobile-form form > div:last-child button {
			width: 100%;
		}
	}
</style>
