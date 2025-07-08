/**
 * Shared utilities for RFD status handling
 * Provides consistent status colors, labels, and mappings across the application
 */

export type RfdStatus = 'draft' | 'open_for_review' | 'accepted' | 'enforced' | 'rejected' | 'retracted';

export type StatusOption = {
	value: RfdStatus;
	label: string;
};

export type StatusDescription = {
	title: string;
	icon: string;
	description: string;
	colorScheme: 'yellow' | 'blue' | 'green' | 'emerald' | 'red' | 'gray';
	visibility: 'private' | 'public';
	canEdit: boolean;
	showToOwner: boolean;
	showToOthers: boolean;
};

export type ColorScheme = {
	border: string;
	bg: string;
	icon: string;
	title: string;
	text: string;
};

export const statusOptions: StatusOption[] = [
	{ value: 'draft', label: 'Draft' },
	{ value: 'open_for_review', label: 'Open for Review' },
	{ value: 'accepted', label: 'Accepted' },
	{ value: 'enforced', label: 'Enforced' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'retracted', label: 'Retracted' }
];

/**
 * Status descriptions and information for each RFD status
 */
export const statusDescriptions: Record<RfdStatus, StatusDescription> = {
	draft: {
		title: 'Draft RFD - Private',
		icon: '⚠️',
		description: 'This RFD is currently in draft status and is only visible to you. Change the status to "Open for Review" to make it visible for team feedback.',
		colorScheme: 'yellow',
		visibility: 'private',
		canEdit: true,
		showToOwner: true,
		showToOthers: false
	},
	open_for_review: {
		title: 'Open for Review - Public',
		icon: '👀',
		description: 'This RFD is visible to all team members for feedback. You can change it back to "Draft" to make it private, or leave it for admin review.',
		colorScheme: 'blue',
		visibility: 'public',
		canEdit: true,
		showToOwner: true,
		showToOthers: true
	},
	accepted: {
		title: 'Accepted RFD',
		icon: '✅',
		description: 'This RFD has been reviewed and accepted by administrators. It represents an approved design decision.',
		colorScheme: 'green',
		visibility: 'public',
		canEdit: false,
		showToOwner: true,
		showToOthers: true
	},
	enforced: {
		title: 'Enforced RFD',
		icon: '🚀',
		description: 'This RFD has been accepted and is now being actively enforced. Implementation is in progress or completed.',
		colorScheme: 'emerald',
		visibility: 'public',
		canEdit: false,
		showToOwner: true,
		showToOthers: true
	},
	rejected: {
		title: 'Rejected RFD',
		icon: '❌',
		description: 'This RFD has been reviewed and rejected by administrators. It will not be implemented as proposed.',
		colorScheme: 'red',
		visibility: 'public',
		canEdit: false,
		showToOwner: true,
		showToOthers: true
	},
	retracted: {
		title: 'Retracted RFD',
		icon: '🗃️',
		description: 'This RFD has been retracted by the author or administrators. It is archived and no longer active.',
		colorScheme: 'gray',
		visibility: 'public',
		canEdit: false,
		showToOwner: true,
		showToOthers: true
	}
};

/**
 * Get consistent status color for all components
 * @param {string} status - The status value
 * @returns {string} Hex color code
 */
export function getStatusColor(status) {
	switch (status) {
		case 'draft':
			return '#94a3b8'; // slate-400
		case 'open_for_review':
		case 'review': // Legacy support
			return '#f59e0b'; // amber-500
		case 'accepted':
		case 'approved': // Legacy support
			return '#10b981'; // emerald-500
		case 'enforced':
			return '#059669'; // emerald-600
		case 'rejected':
			return '#ef4444'; // red-500
		case 'retracted':
		case 'archived': // Legacy support
			return '#6b7280'; // gray-500
		default:
			return '#94a3b8'; // slate-400 fallback
	}
}

/**
 * Get human-readable status label
 * @param {string} status - The status value
 * @returns {string} Display label
 */
export function getStatusLabel(status) {
	// Handle legacy status mappings
	const normalizedStatus = normalizeStatus(status);
	const option = statusOptions.find((opt) => opt.value === normalizedStatus);
	return option ? option.label : status;
}

/**
 * Normalize legacy status values to current standard
 * @param {string} status - The status value
 * @returns {string} Normalized status
 */
export function normalizeStatus(status) {
	switch (status) {
		case 'review':
			return 'open_for_review';
		case 'approved':
			return 'accepted';
		case 'archived':
			return 'retracted';
		default:
			return status;
	}
}

/**
 * Get status description information
 */
export function getStatusDescription(status: string): StatusDescription | null {
	const normalizedStatus = normalizeStatus(status) as RfdStatus;
	return statusDescriptions[normalizedStatus] || null;
}

/**
 * Check if status description should be shown to user
 */
export function shouldShowStatusDescription(status: string, isOwner: boolean, isAdmin: boolean): boolean {
	const description = getStatusDescription(status);
	if (!description) return false;
	
	if (isAdmin) return true; // Admins see all descriptions
	if (isOwner && description.showToOwner) return true;
	if (!isOwner && description.showToOthers) return true;
	
	return false;
}

/**
 * Get color scheme classes for status descriptions
 */
export function getStatusColorScheme(colorScheme: string): ColorScheme {
	const schemes: Record<string, ColorScheme> = {
		yellow: {
			border: 'border-yellow-200',
			bg: 'bg-yellow-50',
			icon: 'text-yellow-600',
			title: 'text-yellow-800',
			text: 'text-yellow-700'
		},
		blue: {
			border: 'border-blue-200',
			bg: 'bg-blue-50',
			icon: 'text-blue-600',
			title: 'text-blue-800',
			text: 'text-blue-700'
		},
		green: {
			border: 'border-green-200',
			bg: 'bg-green-50',
			icon: 'text-green-600',
			title: 'text-green-800',
			text: 'text-green-700'
		},
		emerald: {
			border: 'border-emerald-200',
			bg: 'bg-emerald-50',
			icon: 'text-emerald-600',
			title: 'text-emerald-800',
			text: 'text-emerald-700'
		},
		red: {
			border: 'border-red-200',
			bg: 'bg-red-50',
			icon: 'text-red-600',
			title: 'text-red-800',
			text: 'text-red-700'
		},
		gray: {
			border: 'border-gray-200',
			bg: 'bg-gray-50',
			icon: 'text-gray-600',
			title: 'text-gray-800',
			text: 'text-gray-700'
		}
	};
	
	return schemes[colorScheme] || schemes.gray;
}
