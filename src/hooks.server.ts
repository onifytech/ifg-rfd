import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { isEmailAuthorized } from '$lib/server/auth-utils';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	
	// Check if the user's email is still authorized
	if (user && !isEmailAuthorized(user.email)) {
		// Invalidate the session
		await lucia.invalidateSession(session!.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		
		// Redirect to restricted page if not on auth routes
		if (!event.url.pathname.startsWith('/auth/') && event.url.pathname !== '/restricted') {
			return new Response(null, {
				status: 302,
				headers: {
					Location: `/restricted?email=${encodeURIComponent(user.email)}`
				}
			});
		}
		
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}
	
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
