import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { rfd, user as userTable, rfdStatusHistory } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';

const VALID_STATUSES = [
	'draft',
	'open_for_review',
	'accepted',
	'enforced',
	'rejected',
	'retracted'
] as const;

type RfdStatus = (typeof VALID_STATUSES)[number];

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

		// Get user info including role
		const [dbUser] = await db
			.select({ role: userTable.role })
			.from(userTable)
			.where(eq(userTable.id, user.id))
			.limit(1);

		if (!dbUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Parse request body
		const body = await request.json();
		const { rfdId, status, title, summary, comment, tags } = body;

		if (!rfdId) {
			return json({ error: 'RFD ID is required' }, { status: 400 });
		}

		// Check if RFD exists and get current values
		const [existingRfd] = await db
			.select({
				id: rfd.id,
				status: rfd.status,
				title: rfd.title,
				summary: rfd.summary,
				tags: rfd.tags,
				authorId: rfd.authorId
			})
			.from(rfd)
			.where(eq(rfd.id, rfdId))
			.limit(1);

		if (!existingRfd) {
			return json({ error: 'RFD not found' }, { status: 404 });
		}

		// Check permissions
		const isAdmin = dbUser.role === 'admin';
		const isOwner = user.id === existingRfd.authorId;

		// Validate status if provided
		if (status && !VALID_STATUSES.includes(status as RfdStatus)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		// Check permissions for status changes
		if (status && status !== existingRfd.status && !isAdmin) {
			return json({ error: 'Only administrators can change RFD status' }, { status: 403 });
		}

		// Check permissions for other changes
		if ((title || summary !== undefined || tags !== undefined) && !isOwner && !isAdmin) {
			return json(
				{ error: 'Only the RFD owner or administrator can edit RFD details' },
				{ status: 403 }
			);
		}

		// Prepare update data
		const updateData: Partial<{
			status: RfdStatus;
			title: string;
			summary: string;
			tags: string;
			updatedAt: Date;
		}> = {
			updatedAt: new Date()
		};

		if (title && title !== existingRfd.title) {
			updateData.title = title;
		}

		if (summary !== undefined && summary !== existingRfd.summary) {
			updateData.summary = summary;
		}

		if (status && status !== existingRfd.status) {
			updateData.status = status as RfdStatus;
		}

		if (tags !== undefined) {
			const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;
			if (tagsJson !== existingRfd.tags) {
				updateData.tags = tagsJson;
			}
		}

		// Check if there's anything to update
		if (Object.keys(updateData).length === 1) {
			// Only updatedAt
			return json({ error: 'No changes to update' }, { status: 400 });
		}

		// Update RFD
		await db.update(rfd).set(updateData).where(eq(rfd.id, rfdId));

		// Create status history entry if status changed
		if (status && status !== existingRfd.status) {
			const historyId = generateId(15);
			await db.insert(rfdStatusHistory).values({
				id: historyId,
				rfdId,
				fromStatus: existingRfd.status,
				toStatus: status as RfdStatus,
				changedById: user.id,
				comment: comment || null
			});
		}

		// Get updated RFD with author info
		const [updatedRfd] = await db
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
			.where(eq(rfd.id, rfdId))
			.limit(1);

		return json({
			message: 'RFD updated successfully',
			rfd: updatedRfd
		});
	} catch (error) {
		console.error('Error updating RFD:', error);
		return json({ error: 'Failed to update RFD' }, { status: 500 });
	}
};
