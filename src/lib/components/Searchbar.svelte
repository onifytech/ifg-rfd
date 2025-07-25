<script lang="ts">
	import type { PageData } from '../../routes/[[rfd_number]]/$types';

	export let currentFilter: { status: string | null; general: string | null } = {
		status: null,
		general: null
	};

	export let data: PageData;
	let rfds = data.rfds;

	// Helper function to check if a link is active
	function isActive(type: 'status' | 'general' | 'all', value?: string): boolean {
		if (type === 'all') {
			return !currentFilter.status && !currentFilter.general;
		} else if (type === 'status') {
			return currentFilter.status === value;
		} else if (type === 'general') {
			return currentFilter.general === value;
		}
		return false;
	}
</script>

<form>
	<div class="field">
		<input class="input is-medium" type="text" placeholder="Search..." />
		<p class="help content">
			Search through titles and descriptions. RFD content search will come later.
		</p>
	</div>

	<div class="field is-grouped is-grouped-multiline">
		<div class="control has-icons-left">
			<div class="select is-small">
				<select>
					<option selected>RFD Number</option>
					<option>Recently Updated</option>
					<option>Alphabetical</option>
				</select>
			</div>
			<div class="icon is-small is-left">
				<i class="fa fa-sort"></i>
			</div>
		</div>

		<p class="control">
			<a
				href="/?status=draft"
				class="button is-small button-status status-draft {isActive('status', 'draft')
					? 'status-active'
					: ''}"
				><span class="icon"><i class="fa fa-pencil"></i></span>
				&emsp;Draft</a
			>
		</p>

		<p class="control">
			<a
				href="/?status=open_for_review"
				class="button is-small button-status status-review {isActive('status', 'open_for_review')
					? 'status-active'
					: ''}"
				><span class="icon"><i class="fa fa-comments"></i></span>
				&emsp;Open for Review</a
			>
		</p>

		<p class="control">
			<a
				href="/?status=accepted"
				class="button is-small button-status status-approved {isActive('status', 'accepted')
					? 'status-active'
					: ''}"
				><span class="icon"><i class="fa fa-check"></i></span>
				&emsp;Accepted</a
			>
		</p>

		<p class="control">
			<a
				href="/?status=enforced"
				class="button is-small button-status status-enforced {isActive('status', 'enforced')
					? 'status-active'
					: ''}"
				><span class="icon"><i class="fa fa-check-double"></i></span>
				&emsp;Enforced</a
			>
		</p>

		<p class="control">
			<a
				href="/?status=rejected"
				class="button is-small button-status status-rejected {isActive('status', 'rejected')
					? 'status-active'
					: ''}"
				><span class="icon"><i class="fa fa-xmark"></i></span>
				&emsp;Rejected</a
			>
		</p>

		<p class="control">
			<a
				href="/?status=retracted"
				class="button is-small button-status status-archived {isActive('status', 'retracted')
					? 'status-active'
					: ''}"
				><span class="icon"><i class="fa fa-eraser"></i></span>
				&emsp;Retracted</a
			>
		</p>
	</div>
</form>

<style lang="postcss">
	.button-status:hover {
		text-decoration: none;
	}
	.status-active {
		color: white;
		text-decoration: none;
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
</style>
