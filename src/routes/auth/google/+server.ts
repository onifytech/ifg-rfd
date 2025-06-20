import { redirect } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';
import { google } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const authUrl = google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);
	const redirectParam = url.searchParams.get('redirect');

	authUrl.searchParams.set('access_type', 'offline');
	authUrl.searchParams.set('prompt', 'consent');

	cookies.set('google_oauth_state', state, {
		path: '/',
		secure: true,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		secure: true,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	if (redirectParam) {
		cookies.set('google_redirect_url', redirectParam, {
			path: '/',
			secure: true,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
	}

	throw redirect(302, authUrl.toString());
};
