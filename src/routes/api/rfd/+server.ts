import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleDriveService } from '$lib/server/google-drive';
import { db } from '$lib/server/db';
import { rfd, user as userTable, rfdEndorsement } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { eq, count, max, or, ne, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, cookies }) => {
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

		// Parse request body
		const body = await request.json();
		const { title, description, tags, templateId } = body;

		if (!title || !templateId) {
			return json({ error: 'Title and template ID are required' }, { status: 400 });
		}

		// Create Google Drive service using service account for RFD storage
		// Impersonate the user creating the RFD for proper ownership
		const driveService = GoogleDriveService.createServiceInstance(user.email);

		// Create RFD from template
		const rfdData = {
			title,
			author: user.name,
			description,
			tags: tags || []
		};

		const newDoc = await driveService.createRFDFromTemplate(templateId, rfdData, user.email);

		// Generate next RFD number
		const [maxRfdNumber] = await db.select({ maxNumber: max(rfd.rfdNumber) }).from(rfd);

		const nextRfdNumber = (maxRfdNumber?.maxNumber || 0) + 1;

		// Generate RFD ID
		const rfdId = `rfd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Save to database
		const [dbRfd] = await db
			.insert(rfd)
			.values({
				id: rfdId,
				rfdNumber: nextRfdNumber,
				title,
				summary: description,
				status: 'draft',
				authorId: user.id,
				googleDocId: newDoc.id,
				googleDocUrl: newDoc.url,
				tags: JSON.stringify(tags || []),
				lastSyncedAt: new Date()
			})
			.returning();

		return json({
			rfd: dbRfd,
			googleDocUrl: newDoc.url
		});
	} catch (error) {
		console.error('Error creating RFD:', error);
		return json({ error: 'Failed to create RFD' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ cookies }) => {
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

		// Get query parameters
		// const status = url.searchParams.get('status');
		// const authorId = url.searchParams.get('author');
		// const tag = url.searchParams.get('tag');

		// Add filters if provided
		// Note: This is a simplified example. You'd want to use proper query building

		// Get RFDs with privacy filtering:
		// - Show all non-draft RFDs to everyone
		// - Show draft RFDs only to their creators
		const allRfds = await db
			.select({
				id: rfd.id,
				rfdNumber: rfd.rfdNumber,
				title: rfd.title,
				summary: rfd.summary,
				status: rfd.status,
				authorId: rfd.authorId,
				authorName: userTable.name,
				authorEmail: userTable.email,
				googleDocId: rfd.googleDocId,
				googleDocUrl: rfd.googleDocUrl,
				tags: rfd.tags,
				version: rfd.version,
				isActive: rfd.isActive,
				createdAt: rfd.createdAt,
				updatedAt: rfd.updatedAt,
				lastSyncedAt: rfd.lastSyncedAt
			})
			.from(rfd)
			.leftJoin(userTable, eq(rfd.authorId, userTable.id))
			.where(
				and(
					eq(rfd.isActive, true),
					or(
						ne(rfd.status, 'draft'), // Show all non-draft RFDs
						eq(rfd.authorId, user.id) // Show draft RFDs only to their creators
					)
				)
			)
			.orderBy(rfd.updatedAt);

		// Get endorsement counts for all RFDs
		const endorsementCounts = await db
			.select({
				rfdId: rfdEndorsement.rfdId,
				count: count(rfdEndorsement.id)
			})
			.from(rfdEndorsement)
			.groupBy(rfdEndorsement.rfdId);

		// Get user's endorsements
		const userEndorsements = await db
			.select({
				rfdId: rfdEndorsement.rfdId
			})
			.from(rfdEndorsement)
			.where(eq(rfdEndorsement.userId, user.id));

		// Get endorsement details with user info for avatars
		const endorsementDetails = await db
			.select({
				rfdId: rfdEndorsement.rfdId,
				userId: rfdEndorsement.userId,
				userName: userTable.name,
				userPicture: userTable.picture,
				userAvatarBase64: userTable.avatarBase64,
				createdAt: rfdEndorsement.createdAt
			})
			.from(rfdEndorsement)
			.leftJoin(userTable, eq(rfdEndorsement.userId, userTable.id))
			.orderBy(rfdEndorsement.createdAt);

		// Combine data
		const rfdsWithEndorsements = allRfds.map((rfdItem) => {
			const endorsementCount = endorsementCounts.find((ec) => ec.rfdId === rfdItem.id)?.count || 0;
			const userHasEndorsed = userEndorsements.some((ue) => ue.rfdId === rfdItem.id);
			const endorsers = endorsementDetails
				.filter((ed) => ed.rfdId === rfdItem.id)
				.map((ed) => ({
					userId: ed.userId,
					name: ed.userName,
					picture: ed.userAvatarBase64 || ed.userPicture, // Prefer base64, fallback to URL
					createdAt: ed.createdAt
				}));

			return {
				...rfdItem,
				endorsementCount,
				userHasEndorsed,
				endorsers
			};
		});

		return json({ rfds: rfdsWithEndorsements });
	} catch (error) {
		console.error('Error fetching RFDs:', error);
		return json({ error: 'Failed to fetch RFDs' }, { status: 500 });
	}
};
