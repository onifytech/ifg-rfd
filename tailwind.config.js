/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// Vertical Rhythm Configuration
			// Base unit: 24px (1.5rem) - our baseline grid
			spacing: {
				// Baseline multiples for consistent vertical rhythm
				'rhythm-xs': '0.375rem', // 6px - 0.25 baseline
				'rhythm-sm': '0.75rem', // 12px - 0.5 baseline
				'rhythm-base': '1.5rem', // 24px - 1 baseline
				'rhythm-lg': '3rem', // 48px - 2 baseline
				'rhythm-xl': '4.5rem', // 72px - 3 baseline
				'rhythm-2xl': '6rem', // 96px - 4 baseline
				'rhythm-3xl': '7.5rem', // 120px - 5 baseline
				'rhythm-4xl': '9rem' // 144px - 6 baseline
			},
			fontSize: {
				// Typography scale aligned to baseline grid
				xs: ['0.75rem', { lineHeight: '1.5rem' }], // 12px, 24px line-height
				sm: ['0.875rem', { lineHeight: '1.5rem' }], // 14px, 24px line-height
				base: ['1rem', { lineHeight: '1.5rem' }], // 16px, 24px line-height
				lg: ['1.125rem', { lineHeight: '1.5rem' }], // 18px, 24px line-height
				xl: ['1.25rem', { lineHeight: '1.5rem' }], // 20px, 24px line-height
				'2xl': ['1.5rem', { lineHeight: '3rem' }], // 24px, 48px line-height
				'3xl': ['1.875rem', { lineHeight: '3rem' }], // 30px, 48px line-height
				'4xl': ['2.25rem', { lineHeight: '3rem' }], // 36px, 48px line-height
				'5xl': ['3rem', { lineHeight: '4.5rem' }], // 48px, 72px line-height
				'6xl': ['3.75rem', { lineHeight: '4.5rem' }] // 60px, 72px line-height
			},
			lineHeight: {
				// Line heights that align to baseline grid
				rhythm: '1.5rem', // 24px - 1 baseline
				'rhythm-lg': '3rem', // 48px - 2 baseline
				'rhythm-xl': '4.5rem' // 72px - 3 baseline
			},
			margin: {
				// Margin utilities following baseline grid
				'rhythm-xs': '0.375rem',
				'rhythm-sm': '0.75rem',
				'rhythm-base': '1.5rem',
				'rhythm-lg': '3rem',
				'rhythm-xl': '4.5rem'
			},
			padding: {
				// Padding utilities following baseline grid
				'rhythm-xs': '0.375rem',
				'rhythm-sm': '0.75rem',
				'rhythm-base': '1.5rem',
				'rhythm-lg': '3rem',
				'rhythm-xl': '4.5rem'
			},
			gap: {
				// Gap utilities for flexbox/grid following baseline grid
				'rhythm-xs': '0.375rem',
				'rhythm-sm': '0.75rem',
				'rhythm-base': '1.5rem',
				'rhythm-lg': '3rem',
				'rhythm-xl': '4.5rem'
			},
			height: {
				// Height utilities that align to baseline grid
				'rhythm-sm': '0.75rem',
				'rhythm-base': '1.5rem',
				'rhythm-lg': '3rem',
				'rhythm-xl': '4.5rem',
				'rhythm-2xl': '6rem',
				'rhythm-3xl': '7.5rem'
			},
			colors: {
				// Status colors for RFD system
				status: {
					draft: '#94a3b8',
					review: '#f59e0b',
					approved: '#10b981',
					rejected: '#ef4444',
					archived: '#6b7280'
				}
			}
		}
	},
	plugins: []
};
