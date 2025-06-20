import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch, params, url }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(302, '/login?redirect=' + encodeURIComponent(url.pathname));
	}

	// Parse RFD number from params if provided
	const rfdNumber = params.rfd_number ? parseInt(params.rfd_number) : null;

	// Fetch RFDs
	try {
		const response = await fetch('/api/rfd');
		const rfdsData = await response.json();
		const rfds = rfdsData.rfds || [];

		// If RFD number is provided, find the matching RFD
		let targetRfd = null;
		let rfdNotFound = false;

		if (rfdNumber !== null) {
			if (isNaN(rfdNumber)) {
				// Invalid RFD number format
				rfdNotFound = true;
			} else {
				targetRfd = rfds.find((rfd: any) => rfd.rfdNumber === rfdNumber);
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
			rfdNotFound
		};
	} catch (error) {
		console.error('Error loading RFDs:', error);
		return {
			user,
			rfds: [],
			targetRfdNumber: rfdNumber,
			targetRfd: null,
			rfdNotFound: rfdNumber !== null // If we have an RFD number but failed to load, consider it not found
		};
	}
};
