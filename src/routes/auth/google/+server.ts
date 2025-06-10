import { redirect } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';
import { google } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);

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

	throw redirect(302, url.toString());
};
