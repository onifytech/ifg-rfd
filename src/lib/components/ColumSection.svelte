<script lang="ts">
	import type { RFD } from '$lib/types/rfd';
	import List from './List.svelte';
	import Preview from './Preview.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { User } from 'lucia';

	export let rfds: RFD[] = [];
	export let isLoading: boolean = false;
	export let loadError: string | null = null;
	export let selectedRfd: RFD | null = null;
	export let user: User;

	const dispatch = createEventDispatcher();

	function handleRfdSelect(rfd: RFD) {
		dispatch('rfdSelect', rfd);
	}

	function handleRfdUpdate(updatedRfd: RFD) {
		dispatch('rfdUpdate', updatedRfd);
	}
</script>

<div class="columns">
	<List {rfds} {isLoading} {loadError} onRfdSelect={handleRfdSelect} {selectedRfd} />
	<Preview {selectedRfd} {user} onRfdUpdate={handleRfdUpdate} />
</div>

<style lang="postcss">
</style>
