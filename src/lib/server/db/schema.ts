import { pgTable, text, timestamp, integer, boolean, unique } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	googleId: text('google_id').unique().notNull(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	picture: text('picture'),
	avatarBase64: text('avatar_base64'), // Store base64 encoded avatar
	avatarUpdatedAt: timestamp('avatar_updated_at'), // Track when avatar was last synced
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	tokenExpiresAt: timestamp('token_expires_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const rfd = pgTable('rfd', {
	id: text('id').primaryKey(),
	rfdNumber: integer('rfd_number').unique().notNull(),
	title: text('title').notNull(),
	summary: text('summary'),
	status: text('status').notNull().default('draft'), // draft, review, approved, rejected, archived
	authorId: text('author_id')
		.notNull()
		.references(() => user.id),
	googleDocId: text('google_doc_id').unique().notNull(),
	googleDocUrl: text('google_doc_url').notNull(),
	tags: text('tags'), // JSON array stored as text
	version: integer('version').default(1).notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	lastSyncedAt: timestamp('last_synced_at')
});

export const rfdStatusHistory = pgTable('rfd_status_history', {
	id: text('id').primaryKey(),
	rfdId: text('rfd_id')
		.notNull()
		.references(() => rfd.id),
	fromStatus: text('from_status'),
	toStatus: text('to_status').notNull(),
	changedById: text('changed_by_id')
		.notNull()
		.references(() => user.id),
	comment: text('comment'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rfdComment = pgTable('rfd_comment', {
	id: text('id').primaryKey(),
	rfdId: text('rfd_id')
		.notNull()
		.references(() => rfd.id),
	authorId: text('author_id')
		.notNull()
		.references(() => user.id),
	content: text('content').notNull(),
	parentId: text('parent_id'), // For threaded comments
	isResolved: boolean('is_resolved').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const rfdTag = pgTable('rfd_tag', {
	id: text('id').primaryKey(),
	name: text('name').unique().notNull(),
	color: text('color'), // Hex color for UI
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rfdTagRelation = pgTable('rfd_tag_relation', {
	id: text('id').primaryKey(),
	rfdId: text('rfd_id')
		.notNull()
		.references(() => rfd.id),
	tagId: text('tag_id')
		.notNull()
		.references(() => rfdTag.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rfdEndorsement = pgTable('rfd_endorsement', {
	id: text('id').primaryKey(),
	rfdId: text('rfd_id')
		.notNull()
		.references(() => rfd.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
	// Ensure one endorsement per user per RFD
	uniqueUserRfd: unique().on(table.rfdId, table.userId)
}));
