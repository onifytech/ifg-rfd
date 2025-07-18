import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

export interface RFDTemplateData {
	title: string;
	author: string;
	description?: string;
	tags?: string[];
}

export class GoogleDriveService {
	private drive;
	private docs;
	private isServiceAccount: boolean;

	constructor(accessToken?: string, impersonateEmail?: string) {
		let auth;

		if (env.GOOGLE_SERVICE_ACCOUNT_KEY) {
			// Use service account for RFD storage
			this.isServiceAccount = true;
			const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY);
			auth = new google.auth.JWT({
				email: credentials.client_email,
				key: credentials.private_key,
				scopes: [
					'https://www.googleapis.com/auth/drive',
					'https://www.googleapis.com/auth/documents'
				],
				// Enable domain-wide delegation by impersonating a user
				subject: impersonateEmail
			});
		} else if (accessToken) {
			// Fallback to user OAuth for templates/reading
			this.isServiceAccount = false;
			auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
			auth.setCredentials({
				access_token: accessToken
			});
		} else {
			throw new Error('No authentication method available');
		}

		this.drive = google.drive({ version: 'v3', auth });
		this.docs = google.docs({ version: 'v1', auth });
	}

	/**
	 * Create a new RFD document from template using service account
	 * Note: When using domain-wide delegation, the service account should be impersonating the userEmail
	 */
	async createRFDFromTemplate(templateId: string, data: RFDTemplateData, userEmail?: string) {
		try {
			// Ensure we're using service account for creation
			if (!this.isServiceAccount) {
				throw new Error('RFD creation requires service account authentication');
			}

			// Copy the template document to service account's Drive
			const copyResponse = await this.drive.files.copy({
				fileId: templateId,
				requestBody: {
					name: `RFD: ${data.title}`,
					driveId: env.GOOGLE_SHARED_DRIVE_ID
				},
				supportsAllDrives: true
			});

			const newDocId = copyResponse.data.id!;

			// Replace template placeholders
			const requests = this.buildReplaceRequests(data);

			if (requests.length > 0) {
				await this.docs.documents.batchUpdate({
					documentId: newDocId,
					requestBody: {
						requests
					}
				});
			}

			// Set appropriate permissions for the document
			await this.updateDocumentPermissions(newDocId, userEmail);

			// Get the document URL
			const fileResponse = await this.drive.files.get({
				fileId: newDocId,
				fields: 'webViewLink,webContentLink',
				supportsAllDrives: true
			});

			return {
				id: newDocId,
				url: fileResponse.data.webViewLink!,
				title: `RFD: ${data.title}`
			};
		} catch (error) {
			console.error('Error creating RFD from template:', error);
			throw new Error('Failed to create RFD document');
		}
	}

	/**
	 * List available RFD templates
	 */
	async listTemplates() {
		try {
			const query = `name contains 'RFD Template' and mimeType='application/vnd.google-apps.document' and '${env.GOOGLE_SHARED_DRIVE_ID}' in parents`;

			const response = await this.drive.files.list({
				q: query,
				fields: 'files(id,name,createdTime,modifiedTime)',
				supportsAllDrives: true,
				includeItemsFromAllDrives: true
			});
			return response.data.files || [];
		} catch (error) {
			console.error('Error listing templates:', error);
			throw new Error('Failed to list RFD templates');
		}
	}

	/**
	 * Build replace requests for template placeholders
	 */
	private buildReplaceRequests(data: RFDTemplateData) {
		const requests: Array<{
			replaceAllText: {
				containsText: { text: string; matchCase: boolean };
				replaceText: string;
			};
		}> = [];

		// Replace common placeholders
		const replacements = {
			'{{TITLE}}': data.title,
			'{{AUTHOR}}': data.author,
			'{{DESCRIPTION}}': data.description || '',
			'{{DATE}}': new Date().toLocaleDateString(),
			'{{TAGS}}': data.tags?.join(', ') || ''
		};

		Object.entries(replacements).forEach(([placeholder, replacement]) => {
			requests.push({
				replaceAllText: {
					containsText: {
						text: placeholder,
						matchCase: true
					},
					replaceText: replacement
				}
			});
		});

		return requests;
	}

	/**
	 * Get document metadata
	 */
	async getDocumentMetadata(docId: string) {
		try {
			const response = await this.drive.files.get({
				fileId: docId,
				fields: 'id,name,createdTime,modifiedTime,owners,webViewLink',
				supportsAllDrives: true
			});
			return response.data;
		} catch (error) {
			console.error('Error fetching document metadata:', error);
			throw new Error('Failed to fetch document metadata');
		}
	}

	/**
	 * Update document permissions: Creator gets editor access, anyone can comment
	 */
	async updateDocumentPermissions(docId: string, creatorEmail?: string) {
		try {
			// Give the creating user editor access
			if (creatorEmail) {
				await this.drive.permissions.create({
					fileId: docId,
					requestBody: {
						role: 'writer',
						type: 'user',
						emailAddress: creatorEmail
					},
					supportsAllDrives: true
				});
			}

			// Fallback: Make document accessible to anyone with the link (comment access)
			await this.drive.permissions.create({
				fileId: docId,
				requestBody: {
					role: 'commenter',
					type: 'anyone'
				},
				supportsAllDrives: true
			});

			// Add specific team members with editor access if configured
			if (env.GOOGLE_RFD_TEAM_EMAILS) {
				const teamEmails = env.GOOGLE_RFD_TEAM_EMAILS.split(',');
				for (const email of teamEmails) {
					const trimmedEmail = email.trim();
					// Skip if it's the same as creator email
					if (trimmedEmail === creatorEmail) continue;

					try {
						await this.drive.permissions.create({
							fileId: docId,
							requestBody: {
								role: 'writer',
								type: 'user',
								emailAddress: trimmedEmail
							},
							supportsAllDrives: true
						});
					} catch (permError) {
						console.warn(`Failed to add editor permission for ${trimmedEmail}:`, permError);
					}
				}
			}
		} catch (error) {
			console.error('Error updating document permissions:', error);
			throw new Error('Failed to update document permissions');
		}
	}

	/**
	 * Create a service account instance for RFD management
	 * @param impersonateEmail - Optional email to impersonate using domain-wide delegation
	 */
	static createServiceInstance(impersonateEmail?: string): GoogleDriveService {
		return new GoogleDriveService(undefined, impersonateEmail);
	}

	/**
	 * Create a user instance for template access
	 */
	static createUserInstance(accessToken: string): GoogleDriveService {
		return new GoogleDriveService(accessToken);
	}
}
