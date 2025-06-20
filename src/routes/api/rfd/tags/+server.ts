import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { rfd } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { isNotNull } from 'drizzle-orm';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		// Check authentication
		const sessionId = cookies.get(lucia.sessionCookieName);
		if (!sessionId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { session } = await lucia.validateSession(sessionId);
		if (!session) {
			return json({ error: 'Invalid session' }, { status: 401 });
		}

		// Get all RFDs with tags
		const rfdsWithTags = await db
			.select({
				tags: rfd.tags
			})
			.from(rfd)
			.where(isNotNull(rfd.tags));

		// Extract unique tags
		const tagSet = new Set<string>();

		for (const rfdRecord of rfdsWithTags) {
			if (rfdRecord.tags) {
				try {
					const tagsArray = JSON.parse(rfdRecord.tags);
					if (Array.isArray(tagsArray)) {
						tagsArray.forEach((tag) => {
							if (typeof tag === 'string' && tag.trim()) {
								tagSet.add(tag.trim());
							}
						});
					}
				} catch {
					// Skip invalid JSON
				}
			}
		}

		const uniqueTags = Array.from(tagSet).sort();

		return json({ tags: uniqueTags });
	} catch (error) {
		console.error('Error fetching tags:', error);
		return json({ error: 'Failed to fetch tags' }, { status: 500 });
	}
};
