<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let processingMessage = 'Setting up your account...';
	let progress = 0;

	onMount(() => {
		const redirectUrl = $page.url.searchParams.get('redirect') || '/';

		// Simulate processing steps with progress
		const steps = [
			'Verifying your account...',
			'Setting up your profile...',
			'Loading your dashboard...'
		];

		let currentStep = 0;
		const stepDuration = 800; // 800ms per step

		const interval = setInterval(() => {
			progress += 33.33;
			if (currentStep < steps.length) {
				processingMessage = steps[currentStep];
				currentStep++;
			}

			if (progress >= 100) {
				clearInterval(interval);
				processingMessage = 'Almost ready!';

				// Add a final small delay to ensure everything is ready
				setTimeout(() => {
					goto(redirectUrl, { replaceState: true });
				}, 300);
			}
		}, stepDuration);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Setting up your account...</title>
	<meta name="description" content="Setting up your account" />
</svelte:head>

<div class="processing-container">
	<div class="processing-card">
		<div class="logo">
			<div class="success-icon">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke="#10b981"
						stroke-width="2"
						fill="none"
						opacity="0.2"
					/>
					<path
						d="m9 12 2 2 4-4"
						stroke="#10b981"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<h1>Welcome!</h1>
			<p>Successfully signed in with Google</p>
		</div>

		<div class="processing-content">
			<div class="progress-container">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
				<p class="processing-message">{processingMessage}</p>
			</div>

			<div class="spinner">
				<div class="spinner-circle"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.processing-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.processing-card {
		background: white;
		border-radius: 12px;
		padding: 48px;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		width: 100%;
		max-width: 400px;
		text-align: center;
	}

	.logo {
		margin-bottom: 32px;
	}

	.success-icon {
		margin-bottom: 16px;
		display: flex;
		justify-content: center;
		animation: scaleIn 0.5s ease-out;
	}

	.logo h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 8px 0;
	}

	.logo p {
		color: #6b7280;
		font-size: 16px;
		margin: 0;
	}

	.processing-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
		align-items: center;
	}

	.progress-container {
		width: 100%;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 12px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #10b981, #059669);
		border-radius: 4px;
		transition: width 0.8s ease;
	}

	.processing-message {
		color: #6b7280;
		font-size: 14px;
		margin: 0;
		min-height: 20px;
	}

	.spinner {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.spinner-circle {
		width: 24px;
		height: 24px;
		border: 2px solid #e5e7eb;
		border-top: 2px solid #10b981;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes scaleIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@media (max-width: 768px) {
		.processing-container {
			padding: 1rem;
		}

		.processing-card {
			padding: 2rem 1.5rem;
			max-width: 350px;
		}

		.logo h1 {
			font-size: 1.5rem;
			line-height: 1.5rem;
		}
	}
</style>
