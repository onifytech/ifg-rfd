import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch, params, url }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(302, '/login?redirect=' + encodeURIComponent(url.pathname));
	}

	// Parse RFD number from params if provided
	const rfdNumber = params.rfd_number ? parseInt(params.rfd_number) : null;

	// Parse filter parameters from URL
	const statusFilter = url.searchParams.get('status');
	const generalFilter = url.searchParams.get('filter'); // for 'recent', etc.

	// Fetch RFDs
	try {
		const response = await fetch('/api/rfd');
		const rfdsData = await response.json();
		let rfds = rfdsData.rfds || [];

		// Apply filtering based on URL parameters
		if (statusFilter) {
			rfds = rfds.filter((rfd: { status: string }) => rfd.status === statusFilter);
		} else if (generalFilter === 'recent') {
			// Show RFDs from the last 30 days, sorted by most recent
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			rfds = rfds
				.filter((rfd: { updatedAt: string }) => new Date(rfd.updatedAt) >= thirtyDaysAgo)
				.sort(
					(a: { updatedAt: string }, b: { updatedAt: string }) =>
						new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
				);
		}

		// If RFD number is provided, find the matching RFD
		let targetRfd = null;
		let rfdNotFound = false;

		if (rfdNumber !== null) {
			if (isNaN(rfdNumber)) {
				// Invalid RFD number format
				rfdNotFound = true;
			} else {
				// Look for target RFD in the original full list, not filtered list
				const allRfds = rfdsData.rfds || [];
				targetRfd = allRfds.find((rfd: { rfdNumber: number }) => rfd.rfdNumber === rfdNumber);
				if (!targetRfd) {
					rfdNotFound = true;
				}
			}
		}

		return {
			user,
			rfds,
			targetRfdNumber: rfdNumber,
			targetRfd,
			rfdNotFound,
			currentFilter: {
				status: statusFilter,
				general: generalFilter
			}
		};
	} catch (error) {
		console.error('Error loading RFDs:', error);
		return {
			user,
			rfds: [],
			targetRfdNumber: rfdNumber,
			targetRfd: null,
			rfdNotFound: rfdNumber !== null, // If we have an RFD number but failed to load, consider it not found
			currentFilter: {
				status: statusFilter,
				general: generalFilter
			}
		};
	}
};
