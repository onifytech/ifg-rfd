import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleDriveService } from '$lib/server/google-drive';
import { db } from '$lib/server/db';
import { rfd, user as userTable, rfdEndorsement } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { eq, count, max, and } from 'drizzle-orm';
import { generateId } from 'lucia';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Check authentication
		const sessionId = cookies.get(lucia.sessionCookieName);
		if (!sessionId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (!session) {
			return json({ error: 'Invalid session' }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		const { title, description, tags, templateId } = body;

		if (!title || !templateId) {
			return json({ error: 'Title and template ID are required' }, { status: 400 });
		}

		// Create Google Drive service using service account for RFD storage
		const driveService = GoogleDriveService.createServiceInstance();

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

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		// Check authentication
		const sessionId = cookies.get(lucia.sessionCookieName);
		if (!sessionId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (!session) {
			return json({ error: 'Invalid session' }, { status: 401 });
		}

		// Get query parameters
		const status = url.searchParams.get('status');
		const authorId = url.searchParams.get('author');
		const tag = url.searchParams.get('tag');

		// Add filters if provided
		// Note: This is a simplified example. You'd want to use proper query building

		// Get all RFDs with author information
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
			.where(eq(rfd.isActive, true))
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

		// Combine data
		const rfdsWithEndorsements = allRfds.map((rfdItem) => {
			const endorsementCount = endorsementCounts.find((ec) => ec.rfdId === rfdItem.id)?.count || 0;
			const userHasEndorsed = userEndorsements.some((ue) => ue.rfdId === rfdItem.id);

			return {
				...rfdItem,
				endorsementCount,
				userHasEndorsed
			};
		});

		return json({ rfds: rfdsWithEndorsements });
	} catch (error) {
		console.error('Error fetching RFDs:', error);
		return json({ error: 'Failed to fetch RFDs' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, cookies }) => {
	try {
		// Check authentication
		const sessionId = cookies.get(lucia.sessionCookieName);
		if (!sessionId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (!session) {
			return json({ error: 'Invalid session' }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		const { rfdId, action } = body;

		if (!rfdId || !action || !['endorse', 'unendorse'].includes(action)) {
			return json(
				{ error: 'Invalid request. Need rfdId and action (endorse/unendorse)' },
				{ status: 400 }
			);
		}

		// Check if RFD exists
		const [rfdExists] = await db.select().from(rfd).where(eq(rfd.id, rfdId)).limit(1);
		if (!rfdExists) {
			return json({ error: 'RFD not found' }, { status: 404 });
		}

		if (action === 'endorse') {
			// Check if user already endorsed this RFD
			const [existingEndorsement] = await db
				.select()
				.from(rfdEndorsement)
				.where(and(eq(rfdEndorsement.rfdId, rfdId), eq(rfdEndorsement.userId, user.id)))
				.limit(1);

			if (existingEndorsement) {
				return json({ error: 'You have already endorsed this RFD' }, { status: 400 });
			}

			// Create endorsement
			const endorsementId = generateId(15);
			await db.insert(rfdEndorsement).values({
				id: endorsementId,
				rfdId,
				userId: user.id
			});

			return json({ message: 'RFD endorsed successfully' });
		} else {
			// Remove endorsement
			await db
				.delete(rfdEndorsement)
				.where(and(eq(rfdEndorsement.rfdId, rfdId), eq(rfdEndorsement.userId, user.id)));

			return json({ message: 'Endorsement removed successfully' });
		}
	} catch (error) {
		console.error('Error handling endorsement:', error);
		return json({ error: 'Failed to handle endorsement' }, { status: 500 });
	}
};
