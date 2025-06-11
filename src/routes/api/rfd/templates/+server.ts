import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleDriveService } from '$lib/server/google-drive';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ cookies }) => {
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

		// For templates, we can use either service account or user access
		// Try service account first, fallback to user access
		let driveService: GoogleDriveService;

		try {
			driveService = GoogleDriveService.createServiceInstance();
		} catch (serviceError) {
			console.error(serviceError);
			// Fallback to user access token for templates
			const accessToken = await getUserAccessToken(user.id);
			if (!accessToken) {
				return json({ error: 'Google Drive access required' }, { status: 401 });
			}
			driveService = GoogleDriveService.createUserInstance(accessToken);
		}

		// List available templates
		const templates = await driveService.listTemplates();

		return json({ templates });
	} catch (error) {
		console.error('Error fetching templates:', error);
		return json({ error: 'Failed to fetch templates' }, { status: 500 });
	}
};

// Helper function to get user's access token
async function getUserAccessToken(userId: string): Promise<string | null> {
	try {
		const [userData] = await db
			.select({
				accessToken: user.accessToken,
				refreshToken: user.refreshToken,
				tokenExpiresAt: user.tokenExpiresAt
			})
			.from(user)
			.where(eq(user.id, userId));

		if (!userData?.accessToken) {
			return null;
		}

		// Check if token is expired and refresh if needed
		if (userData.tokenExpiresAt && userData.tokenExpiresAt <= new Date()) {
			if (!userData.refreshToken) {
				return null;
			}

			// Refresh the token
			const refreshedTokens = await refreshGoogleToken(userData.refreshToken);
			if (refreshedTokens) {
				// Update the stored tokens
				await db
					.update(user)
					.set({
						accessToken: refreshedTokens.accessToken,
						refreshToken: refreshedTokens.refreshToken,
						tokenExpiresAt: refreshedTokens.expiresAt,
						updatedAt: new Date()
					})
					.where(eq(user.id, userId));

				return refreshedTokens.accessToken;
			}
			return null;
		}

		return userData.accessToken;
	} catch (error) {
		console.error('Error getting access token:', error);
		return null;
	}
}

// Helper function to refresh Google token
async function refreshGoogleToken(refreshToken: string) {
	try {
		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: env.GOOGLE_CLIENT_ID!,
				client_secret: env.GOOGLE_CLIENT_SECRET!,
				refresh_token: refreshToken,
				grant_type: 'refresh_token'
			})
		});

		if (!response.ok) {
			throw new Error('Failed to refresh token');
		}

		const data = await response.json();
		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token || refreshToken,
			expiresAt: new Date(Date.now() + data.expires_in * 1000)
		};
	} catch (error) {
		console.error('Error refreshing token:', error);
		return null;
	}
}
