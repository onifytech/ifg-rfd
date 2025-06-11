import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { google, lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('google_oauth_state') ?? null;
	const codeVerifier = cookies.get('google_code_verifier') ?? null;

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		const refreshToken = tokens.refreshToken();
		if (!refreshToken) {
			console.error('No refresh token received from Google OAuth');
			return new Response(null, {
				status: 500
			});
		}
		const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});
		const googleUser: GoogleUser = await googleUserResponse.json();

		const [existingUser] = await db.select().from(user).where(eq(user.googleId, googleUser.sub));

		if (existingUser) {
			// Update existing user with new tokens
			await db
				.update(user)
				.set({
					accessToken: tokens.accessToken(),
					refreshToken: refreshToken,
					tokenExpiresAt: tokens.accessTokenExpiresAt(),
					updatedAt: new Date()
				})
				.where(eq(user.id, existingUser.id));

			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateId(15);
			await db.insert(user).values({
				id: userId,
				googleId: googleUser.sub,
				email: googleUser.email,
				name: googleUser.name,
				picture: googleUser.picture,
				accessToken: tokens.accessToken(),
				refreshToken: tokens.refreshToken(),
				tokenExpiresAt: tokens.accessTokenExpiresAt()
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === 'bad_verification_code') {
			return new Response(null, {
				status: 400
			});
		}

		console.log(e);
		return new Response(null, {
			status: 500
		});
	}
};

interface GoogleUser {
	sub: string;
	name: string;
	email: string;
	picture: string;
}
