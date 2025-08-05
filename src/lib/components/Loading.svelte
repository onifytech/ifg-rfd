<div class="loading-process">
	<p>Loading your dashboard...</p>
	<div class="spinner">
		<div class="spinner-circle"></div>
	</div>
</div>

<style>
	.loading-process {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		text-align: center;
		font-size: 1.25rem;
		color: #374151;
		animation: scaleIn 0.5s ease-out;
	}

	.spinner {
		margin-top: 1rem;
	}

	.spinner-circle {
		width: 40px;
		height: 40px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #10b981;
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
			transform: scale(0.95);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
