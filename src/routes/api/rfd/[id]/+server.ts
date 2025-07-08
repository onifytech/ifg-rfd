import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { rfd, user as userTable, rfdStatusHistory } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import {
	getRfdWithEndorsements,
	canUserEditRfd,
	canUserChangeStatus,
	canUserPublishDraft,
	isValidRfdStatus,
	type RfdStatus
} from '$lib/server/rfd-service';

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

		// Get RFD data with endorsements
		const rfdData = await getRfdWithEndorsements(rfdId, user.id);
		if (!rfdData) {
			return json({ error: 'RFD not found' }, { status: 404 });
		}

		// Check if user can access this RFD (draft privacy)
		if (rfdData.status === 'draft' && rfdData.authorId !== user.id) {
			return json({ error: 'RFD not found' }, { status: 404 });
		}

		return json({ rfd: rfdData });
	} catch (error) {
		console.error('Error fetching RFD:', error);
		return json({ error: 'Failed to fetch RFD' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
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

		// Get user role
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
		const { title, summary, status, tags, comment } = body;

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

		// Validate status if provided
		if (status && !isValidRfdStatus(status)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		// Check permissions for status changes
		
		if (status && status !== existingRfd.status && !canUserPublishDraft(user.id, dbUser.role, existingRfd.authorId, existingRfd.status, status)) {
			let errorMessage = 'Permission denied';
			
			if (existingRfd.authorId === user.id) {
				// User is the creator
				if (existingRfd.status === 'draft') {
					errorMessage = 'You can only change draft RFDs to "Open for Review"';
				} else if (existingRfd.status === 'open_for_review') {
					errorMessage = 'You can only change this RFD back to "Draft"';
				} else {
					errorMessage = 'Only administrators can change this RFD status';
				}
			} else {
				// User is not the creator
				errorMessage = 'Only the creator or administrators can change RFD status';
			}
			
			return json({ error: errorMessage }, { status: 403 });
		}

		// Check permissions for other changes
		if (
			(title || summary !== undefined || tags !== undefined) &&
			!canUserEditRfd(user.id, dbUser.role, existingRfd.authorId)
		) {
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

		// Get updated RFD data with endorsements
		const updatedRfd = await getRfdWithEndorsements(rfdId, user.id);

		return json({
			message: 'RFD updated successfully',
			rfd: updatedRfd
		});
	} catch (error) {
		console.error('Error updating RFD:', error);
		return json({ error: 'Failed to update RFD' }, { status: 500 });
	}
};
