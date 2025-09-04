<script lang="ts">
	import type { RFD } from '$lib/types/rfd';
	import { createEventDispatcher } from 'svelte';

	export let currentFilter: { status: string | null; general: string | null } = {
		status: null,
		general: null
	};
	export let allRfds: RFD[] = [];
	
	const dispatch = createEventDispatcher<{
		filter: { 
			rfds: RFD[]; 
			searchTerm: string; 
			sortBy: string; 
			statusFilter: string | null; 
			tagFilter: string | null;
		}
	}>();

	let searchTerm = '';
	let searchInput = ''; // Separate input value for immediate UI updates
	let sortBy = 'rfd_number';
	let statusFilter: string | null = currentFilter.status;
	let tagFilter: string | null = null;
	let activeFilterCount = 0;
	let debounceTimer: NodeJS.Timeout;
	
	// Get unique tags from all RFDs
	$: uniqueTags = [...new Set(allRfds.flatMap(rfd => {
		if (!rfd.tags) return [];
		try {
			return JSON.parse(rfd.tags);
		} catch {
			return [];
		}
	}))].sort();

	// Calculate active filter count
	$: {
		activeFilterCount = 0;
		if (searchTerm) activeFilterCount++;
		if (statusFilter) activeFilterCount++;
		if (tagFilter) activeFilterCount++;
		if (sortBy !== 'rfd_number') activeFilterCount++;
	}

	// Helper function to check if a status button is active
	function isStatusActive(status: string | null): boolean {
		return statusFilter === status;
	}

	// Apply filters and search
	function applyFilters() {
		let filtered = [...allRfds];

		// Apply search term filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(rfd => 
				rfd.title.toLowerCase().includes(term) ||
				(rfd.summary && rfd.summary.toLowerCase().includes(term)) ||
				rfd.authorName?.toLowerCase().includes(term) ||
				rfd.rfdNumber.toString().includes(term)
			);
		}

		// Apply status filter
		if (statusFilter) {
			filtered = filtered.filter(rfd => rfd.status === statusFilter);
		}

		// Apply tag filter
		if (tagFilter) {
			filtered = filtered.filter(rfd => {
				if (!rfd.tags) return false;
				try {
					const tags = JSON.parse(rfd.tags);
					return tags.includes(tagFilter);
				} catch {
					return false;
				}
			});
		}

		// Apply sorting
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'rfd_number':
					return b.rfdNumber - a.rfdNumber;
				case 'recently_updated':
					return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
				case 'alphabetical':
					return a.title.localeCompare(b.title);
				default:
					return 0;
			}
		});

		dispatch('filter', {
			rfds: filtered,
			searchTerm,
			sortBy,
			statusFilter,
			tagFilter
		});
	}

	// Debounce search input changes
	$: {
		if (searchInput !== undefined) {
			// Clear existing timer
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			
			// Set new timer for debounced search
			debounceTimer = setTimeout(() => {
				searchTerm = searchInput; // Update actual search term after delay
			}, 300); // 300ms delay
		}
	}

	// Trigger filter on any change (but searchTerm is now debounced)
	$: searchTerm, sortBy, statusFilter, tagFilter, allRfds, applyFilters();

	function clearAllFilters() {
		searchTerm = '';
		searchInput = ''; // Also clear the input field
		sortBy = 'rfd_number';
		statusFilter = null;
		tagFilter = null;
	}

	function setStatusFilter(status: string | null) {
		statusFilter = status;
	}
</script>

<form onsubmit={(e) => e.preventDefault()}>
	<div class="field">
		<div class="control has-icons-left">
			<input 
				class="input is-medium" 
				type="text" 
				placeholder="Search RFDs by title, summary, author, or number..." 
				bind:value={searchInput}
			/>
			<span class="icon is-small is-left">
				<i class="fa fa-search"></i>
			</span>
		</div>
		<p class="help content">
			{#if allRfds.length > 0}
				{@const filteredCount = (() => {
					let filtered = [...allRfds];
					if (searchTerm) {
						const term = searchTerm.toLowerCase();
						filtered = filtered.filter(rfd => 
							rfd.title.toLowerCase().includes(term) ||
							(rfd.summary && rfd.summary.toLowerCase().includes(term)) ||
							rfd.authorName?.toLowerCase().includes(term) ||
							rfd.rfdNumber.toString().includes(term)
						);
					}
					if (statusFilter) filtered = filtered.filter(rfd => rfd.status === statusFilter);
					if (tagFilter) {
						filtered = filtered.filter(rfd => {
							if (!rfd.tags) return false;
							try {
								const tags = JSON.parse(rfd.tags);
								return tags.includes(tagFilter);
							} catch {
								return false;
							}
						});
					}
					return filtered.length;
				})()}
				Showing {filteredCount} of {allRfds.length} RFDs
				{#if activeFilterCount > 0}
					· <button type="button" class="clear-filters-link" onclick={clearAllFilters}>
						Clear {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
					</button>
				{/if}
			{/if}
		</p>
	</div>

	<div class="field is-grouped is-grouped-multiline">
		<!-- Sort dropdown -->
		<div class="control has-icons-left">
			<div class="select is-small">
				<select bind:value={sortBy}>
					<option value="rfd_number">RFD Number</option>
					<option value="recently_updated">Recently Updated</option>
					<option value="alphabetical">Alphabetical</option>
				</select>
			</div>
			<div class="icon is-small is-left">
				<i class="fa fa-sort"></i>
			</div>
		</div>

		<!-- Tag filter dropdown -->
		{#if uniqueTags.length > 0}
			<div class="control has-icons-left">
				<div class="select is-small">
					<select bind:value={tagFilter}>
						<option value={null}>All Tags</option>
						{#each uniqueTags as tag}
							<option value={tag}>{tag}</option>
						{/each}
					</select>
				</div>
				<div class="icon is-small is-left">
					<i class="fa fa-tag"></i>
				</div>
			</div>
		{/if}

		<!-- Status filter buttons -->
		<p class="control">
			<button
				type="button"
				onclick={() => setStatusFilter(null)}
				class="button is-small button-status {!statusFilter ? 'status-active status-all' : ''}"
			>
				<span class="icon"><i class="fa fa-list"></i></span>
				&emsp;All
			</button>
		</p>

		<p class="control">
			<button
				type="button"
				onclick={() => setStatusFilter('draft')}
				class="button is-small button-status status-draft {isStatusActive('draft') ? 'status-active' : ''}"
			>
				<span class="icon"><i class="fa fa-pencil"></i></span>
				&emsp;Draft
			</button>
		</p>

		<p class="control">
			<button
				type="button"
				onclick={() => setStatusFilter('open_for_review')}
				class="button is-small button-status status-review {isStatusActive('open_for_review') ? 'status-active' : ''}"
			>
				<span class="icon"><i class="fa fa-comments"></i></span>
				&emsp;Open for Review
			</button>
		</p>

		<p class="control">
			<button
				type="button"
				onclick={() => setStatusFilter('accepted')}
				class="button is-small button-status status-approved {isStatusActive('accepted') ? 'status-active' : ''}"
			>
				<span class="icon"><i class="fa fa-check"></i></span>
				&emsp;Accepted
			</button>
		</p>

		<p class="control">
			<button
				type="button"
				onclick={() => setStatusFilter('enforced')}
				class="button is-small button-status status-enforced {isStatusActive('enforced') ? 'status-active' : ''}"
			>
				<span class="icon"><i class="fa fa-check-double"></i></span>
				&emsp;Enforced
			</button>
		</p>

		<p class="control">
			<button
				type="button"
				onclick={() => setStatusFilter('rejected')}
				class="button is-small button-status status-rejected {isStatusActive('rejected') ? 'status-active' : ''}"
			>
				<span class="icon"><i class="fa fa-xmark"></i></span>
				&emsp;Rejected
			</button>
		</p>

		<p class="control">
			<button
				type="button"
				onclick={() => setStatusFilter('retracted')}
				class="button is-small button-status status-archived {isStatusActive('retracted') ? 'status-active' : ''}"
			>
				<span class="icon"><i class="fa fa-eraser"></i></span>
				&emsp;Retracted
			</button>
		</p>
	</div>
</form>

<style lang="postcss">
	.button-status {
		cursor: pointer;
		transition: all 0.2s;
	}

	.button-status:hover {
		text-decoration: none;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.status-active {
		color: white;
		text-decoration: none;
	}

	.status-all.status-active {
		background-color: #475569;
		border-color: #475569;
	}

	.status-draft.status-active {
		background-color: #94a3b8;
		border-color: #94a3b8;
	}

	.status-review.status-active {
		background-color: #f59e0b;
		border-color: #f59e0b;
	}

	.status-approved.status-active {
		background-color: #10b981;
		border-color: #10b981;
	}

	.status-enforced.status-active {
		background-color: #059669;
		border-color: #059669;
	}

	.status-rejected.status-active {
		background-color: #ef4444;
		border-color: #ef4444;
	}

	.status-archived.status-active {
		background-color: #6b7280;
		border-color: #6b7280;
	}

	.clear-filters-link {
		background: none;
		border: none;
		color: #3b82f6;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		font-size: inherit;
	}

	.clear-filters-link:hover {
		color: #2563eb;
	}

	.help.content {
		margin-top: 0.25rem;
		color: #6b7280;
		font-size: 0.875rem;
	}
</style>