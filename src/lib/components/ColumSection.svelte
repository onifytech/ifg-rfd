<script lang="ts">
	import type { RFD } from '$lib/types/rfd';
	import List from './List.svelte';
	import type { PageData } from '../../routes/[[rfd_number]]/$types';
	import { onMount } from 'svelte';
	import Preview from './Preview.svelte';

	export let data: PageData;

	let selectedRfd: RFD | null = null;
	let rfds = data.rfds;
	let currentFilter = data.currentFilter;

	// Reactive update when data changes (e.g., when navigating to a new filter)
	$: {
		rfds = data.rfds;
		currentFilter = data.currentFilter;
		// Clear selection when filtering changes to avoid showing RFD not in current filter
		if (selectedRfd && !rfds.some((rfd: RFD) => rfd.id === selectedRfd?.id)) {
			selectedRfd = null;
		}
	}

	// Auto-select RFD if targetRfd is provided
	onMount(() => {
		if (data.targetRfd) {
			selectedRfd = data.targetRfd;
		}
	});

	function handleRfdSelect(rfd: RFD) {
		selectedRfd = rfd;
	}

	function handleRfdUpdate(updatedRfd: RFD) {
		// Update the RFD in the list
		rfds = rfds.map((rfd: RFD) => (rfd.id === updatedRfd.id ? updatedRfd : rfd));

		// Update selected RFD if it's the one that was updated
		if (selectedRfd?.id === updatedRfd.id) {
			selectedRfd = updatedRfd;
		}
	}
</script>

<div class="columns">
	<List {rfds} onRfdSelect={handleRfdSelect} {selectedRfd} {currentFilter} />
	<Preview {selectedRfd} user={data.user} onRfdUpdate={handleRfdUpdate} />
</div>

<style lang="postcss">
</style>
