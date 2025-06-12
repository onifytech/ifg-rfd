/**
 * Avatar synchronization utilities for downloading and storing user avatars as base64
 */

export interface AvatarSyncResult {
	success: boolean;
	base64?: string;
	error?: string;
}

/**
 * Download an image from URL and convert to base64
 */
export async function downloadImageAsBase64(imageUrl: string): Promise<AvatarSyncResult> {
	try {
		if (!imageUrl || !imageUrl.startsWith('http')) {
			return { success: false, error: 'Invalid image URL' };
		}

		const response = await fetch(imageUrl, {
			headers: {
				'User-Agent': 'RFD-Index-Avatar-Sync/1.0'
			},
			// Add timeout to prevent hanging
			signal: AbortSignal.timeout(10000) // 10 second timeout
		});

		if (!response.ok) {
			return { success: false, error: `Failed to fetch image: ${response.status}` };
		}

		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.startsWith('image/')) {
			return { success: false, error: 'URL does not point to an image' };
		}

		// Limit size to prevent huge avatars (5MB max)
		const contentLength = response.headers.get('content-length');
		if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
			return { success: false, error: 'Image too large (max 5MB)' };
		}

		const arrayBuffer = await response.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString('base64');
		
		// Create data URL with proper MIME type
		const dataUrl = `data:${contentType};base64,${base64}`;

		return { success: true, base64: dataUrl };
	} catch (error) {
		console.error('Error downloading avatar:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Check if avatar needs updating (older than 7 days or missing)
 */
export function shouldUpdateAvatar(avatarUpdatedAt: Date | null): boolean {
	if (!avatarUpdatedAt) return true;
	
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	
	return avatarUpdatedAt < sevenDaysAgo;
}

/**
 * Resize base64 image to optimal avatar size (100x100)
 * This is a simplified version - in production you might want to use a proper image processing library
 */
export function optimizeAvatarSize(base64Data: string): string {
	// For now, just return as-is
	// In production, you could use sharp, jimp, or canvas to resize
	return base64Data;
}