import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { rfd, user as userTable, rfdEndorsement } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		// Check authentication
		const sessionId = cookies.get(lucia.sessionCookieName);
		if (!sessionId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (!session || !user) {
			return json({ error: 'Invalid session or user' }, { status: 401 });
		}

		const rfdId = params.id;
		if (!rfdId) {
			return json({ error: 'RFD ID is required' }, { status: 400 });
		}

		// Check if RFD exists and user has permission to view it
		const [rfdData] = await db
			.select({
				id: rfd.id,
				status: rfd.status,
				authorId: rfd.authorId
			})
			.from(rfd)
			.where(eq(rfd.id, rfdId))
			.limit(1);

		if (!rfdData) {
			return json({ error: 'RFD not found' }, { status: 404 });
		}

		// Check permission - can view endorsers if:
		// 1. RFD is not draft, OR
		// 2. User is the author
		if (rfdData.status === 'draft' && rfdData.authorId !== user.id) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		// Get endorsement details with user info
		const endorsementDetails = await db
			.select({
				userId: rfdEndorsement.userId,
				userName: userTable.name,
				userPicture: userTable.picture,
				userAvatarBase64: userTable.avatarBase64,
				createdAt: rfdEndorsement.createdAt
			})
			.from(rfdEndorsement)
			.leftJoin(userTable, eq(rfdEndorsement.userId, userTable.id))
			.where(eq(rfdEndorsement.rfdId, rfdId))
			.orderBy(rfdEndorsement.createdAt);

		const endorsers = endorsementDetails.map((ed) => ({
			userId: ed.userId,
			name: ed.userName,
			picture: ed.userAvatarBase64 || ed.userPicture, // Prefer base64, fallback to URL
			createdAt: ed.createdAt
		}));

		return json({ 
			endorsers,
			count: endorsers.length 
		});
	} catch (error) {
		console.error('Error fetching RFD endorsers:', error);
		return json({ error: 'Failed to fetch endorsers' }, { status: 500 });
	}
};