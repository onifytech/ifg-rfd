<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let userEmail = '';

	onMount(() => {
		// Get user email from URL params if passed
		const $page = get(page);
		userEmail = $page.url.searchParams.get('email') || '';
	});
</script>

<svelte:head>
	<title>Access Restricted</title>
	<meta name="description" content="Access restricted to authorized users only" />
</svelte:head>

<div class="restricted-container">
	<div class="restricted-card">
		<div class="icon-wrapper">
			<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2" fill="none" opacity="0.2" />
				<path
					d="M12 8v4m0 4h.01"
					stroke="#ef4444"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>

		<h1>Access Restricted</h1>
		
		{#if userEmail}
			<p class="email-info">
				The email address <strong>{userEmail}</strong> is not authorized to access this application.
			</p>
		{:else}
			<p>Your account is not authorized to access this application.</p>
		{/if}

		<p class="info-text">
			Only authorized team members can access the RFD system. If you believe you should have access,
			please contact your administrator.
		</p>

		<div class="actions">
			<a href="/auth/google" class="login-button">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Sign in with another account
			</a>
		</div>
	</div>
</div>

<style>
	.restricted-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.restricted-card {
		background: white;
		border-radius: 12px;
		padding: 48px;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		width: 100%;
		max-width: 480px;
		text-align: center;
	}

	.icon-wrapper {
		margin-bottom: 24px;
		display: flex;
		justify-content: center;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 16px 0;
	}

	p {
		color: #6b7280;
		font-size: 16px;
		margin: 0 0 16px 0;
		line-height: 1.5;
	}

	.email-info {
		color: #374151;
		margin-bottom: 24px;
	}

	.email-info strong {
		color: #1f2937;
		font-weight: 600;
	}

	.info-text {
		margin-bottom: 32px;
	}

	.actions {
		display: flex;
		justify-content: center;
	}

	.login-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		background: #10b981;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.login-button:hover {
		background: #059669;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.login-button:active {
		transform: translateY(0);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@media (max-width: 768px) {
		.restricted-container {
			padding: 1rem;
		}

		.restricted-card {
			padding: 2rem 1.5rem;
			max-width: 350px;
		}

		h1 {
			font-size: 1.5rem;
		}

		p {
			font-size: 0.875rem;
		}
	}
</style>