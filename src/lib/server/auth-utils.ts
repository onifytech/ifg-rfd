import { env } from '$env/dynamic/private';

export function isEmailAuthorized(email: string): boolean {
	// If no authorized domains are set, allow all users
	if (!env.AUTHORIZED_DOMAINS) {
		return true;
	}

	// Get the domain from the email
	const emailDomain = email.split('@')[1];
	if (!emailDomain) {
		return false;
	}

	// Check if the email domain is in the authorized list
	const authorizedDomains = env.AUTHORIZED_DOMAINS
		.split(',')
		.map(d => d.trim().toLowerCase())
		.filter(d => d.length > 0);
		
	return authorizedDomains.includes(emailDomain.toLowerCase());
}