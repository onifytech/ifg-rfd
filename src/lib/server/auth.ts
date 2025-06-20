import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Google } from 'arctic';
import { db } from './db';
import { session, user } from './db/schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const adapter = new DrizzlePostgreSQLAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			googleId: attributes.googleId,
			email: attributes.email,
			name: attributes.name,
			role: attributes.role,
			picture: attributes.picture,
			avatarBase64: attributes.avatarBase64
		};
	}
});

export const google = new Google(
	env.GOOGLE_CLIENT_ID!,
	env.GOOGLE_CLIENT_SECRET!,
	`${env.ORIGIN}/auth/google/callback`
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			googleId: string;
			email: string;
			name: string;
			role: string;
			picture: string | null;
			avatarBase64: string | null;
		};
	}
}
