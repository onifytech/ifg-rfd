/**
 * Shared utilities for RFD status handling
 * Provides consistent status colors, labels, and mappings across the application
 */

export const statusOptions = [
	{ value: 'draft', label: 'Draft' },
	{ value: 'open_for_review', label: 'Open for Review' },
	{ value: 'accepted', label: 'Accepted' },
	{ value: 'enforced', label: 'Enforced' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'retracted', label: 'Retracted' }
];

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
