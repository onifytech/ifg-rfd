import { db } from '$lib/server/db';
import { rfd, user as userTable, rfdEndorsement } from '$lib/server/db/schema';
import { eq, count, and } from 'drizzle-orm';

export const VALID_RFD_STATUSES = [
	'draft',
	'open_for_review',
	'accepted',
	'enforced',
	'rejected',
	'retracted'
] as const;

export type RfdStatus = (typeof VALID_RFD_STATUSES)[number];

export interface RfdWithEndorsements {
	id: string;
	rfdNumber: number;
	title: string;
	summary: string | null;
	status: string;
	authorId: string;
	authorName: string | null;
	authorEmail: string | null;
	googleDocId: string | null;
	googleDocUrl: string;
	tags: string | null;
	version: number | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	lastSyncedAt: Date | null;
	endorsementCount: number;
	userHasEndorsed: boolean;
	endorsers: Array<{
		userId: string;
		name: string | null;
		picture: string | null;
		createdAt: Date;
	}>;
}

/**
 * Get RFD with endorsement data
 */
export async function getRfdWithEndorsements(
	rfdId: string,
	userId: string
): Promise<RfdWithEndorsements | null> {
	// Get RFD with author info
	const [rfdData] = await db
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

	if (!rfdData) {
		return null;
	}

	// Get endorsement data
	const endorsementCount = await db
		.select({ count: count(rfdEndorsement.id) })
		.from(rfdEndorsement)
		.where(eq(rfdEndorsement.rfdId, rfdId));

	const userHasEndorsed = await db
		.select()
		.from(rfdEndorsement)
		.where(and(eq(rfdEndorsement.rfdId, rfdId), eq(rfdEndorsement.userId, userId)))
		.limit(1);

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

	return {
		...rfdData,
		endorsementCount: endorsementCount[0]?.count || 0,
		userHasEndorsed: userHasEndorsed.length > 0,
		endorsers: endorsementDetails.map((ed) => ({
			userId: ed.userId,
			name: ed.userName,
			picture: ed.userAvatarBase64 || ed.userPicture,
			createdAt: ed.createdAt
		}))
	};
}

/**
 * Check if user can edit RFD
 */
export function canUserEditRfd(userId: string, userRole: string, rfdAuthorId: string): boolean {
	return userRole === 'admin' || userId === rfdAuthorId;
}

/**
 * Check if user can change RFD status
 */
export function canUserChangeStatus(userRole: string): boolean {
	return userRole === 'admin';
}

/**
 * Check if user can change RFD status from draft (publish)
 */
export function canUserPublishDraft(userId: string, userRole: string, rfdAuthorId: string, currentStatus: string): boolean {
	// Only the creator can publish their own draft RFD
	if (currentStatus === 'draft') {
		return userId === rfdAuthorId;
	}
	// For non-draft RFDs, only admins can change status
	return userRole === 'admin';
}

/**
 * Validate RFD status
 */
export function isValidRfdStatus(status: string): status is RfdStatus {
	return VALID_RFD_STATUSES.includes(status as RfdStatus);
}
