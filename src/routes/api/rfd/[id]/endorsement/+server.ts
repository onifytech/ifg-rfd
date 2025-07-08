import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { rfd, rfdEndorsement } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { eq, and } from 'drizzle-orm';
import { generateId } from 'lucia';
import { getRfdWithEndorsements } from '$lib/server/rfd-service';

export const POST: RequestHandler = async ({ params, cookies }) => {
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

		// Check if RFD exists
		const [rfdExists] = await db.select().from(rfd).where(eq(rfd.id, rfdId)).limit(1);
		if (!rfdExists) {
			return json({ error: 'RFD not found' }, { status: 404 });
		}

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

		// Return updated RFD data with endorsements
		const updatedRfd = await getRfdWithEndorsements(rfdId, user.id);

		return json({
			message: 'RFD endorsed successfully',
			rfd: updatedRfd
		});
	} catch (error) {
		console.error('Error endorsing RFD:', error);
		return json({ error: 'Failed to endorse RFD' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
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

		// Check if user has endorsed this RFD
		const [existingEndorsement] = await db
			.select()
			.from(rfdEndorsement)
			.where(and(eq(rfdEndorsement.rfdId, rfdId), eq(rfdEndorsement.userId, user.id)))
			.limit(1);

		if (!existingEndorsement) {
			return json({ error: 'You have not endorsed this RFD' }, { status: 400 });
		}

		// Remove endorsement
		await db
			.delete(rfdEndorsement)
			.where(and(eq(rfdEndorsement.rfdId, rfdId), eq(rfdEndorsement.userId, user.id)));

		// Return updated RFD data with endorsements
		const updatedRfd = await getRfdWithEndorsements(rfdId, user.id);

		return json({
			message: 'Endorsement removed successfully',
			rfd: updatedRfd
		});
	} catch (error) {
		console.error('Error removing endorsement:', error);
		return json({ error: 'Failed to remove endorsement' }, { status: 500 });
	}
};
