import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { user } = await parent();
	
	if (!user) {
		throw redirect(302, '/login');
	}
	
	// Fetch RFDs
	try {
		const response = await fetch('/api/rfd');
		const rfdsData = await response.json();
		
		return {
			user,
			rfds: rfdsData.rfds || []
		};
	} catch (error) {
		console.error('Error loading RFDs:', error);
		return {
			user,
			rfds: []
		};
	}
};
