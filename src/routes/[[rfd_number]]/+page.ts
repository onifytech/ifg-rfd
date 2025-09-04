import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params, url }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(302, '/login?redirect=' + encodeURIComponent(url.pathname));
	}

	// Parse RFD number from params if provided
	const rfdNumber = params.rfd_number ? parseInt(params.rfd_number) : null;

	// Parse filter parameters from URL
	const statusFilter = url.searchParams.get('status');
	const generalFilter = url.searchParams.get('filter'); // for 'recent', etc.

	// Return immediately with just user data and filters
	// RFDs will be fetched client-side
	return {
		user,
		targetRfdNumber: rfdNumber,
		currentFilter: {
			status: statusFilter,
			general: generalFilter
		}
	};
};
