<svelte:head>
	<title>Sign In</title>
	<meta name="description" content="Sign in to your account" />
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="logo">
			<h1>Welcome Back</h1>
			<p>Sign in to continue to your account</p>
		</div>

		<div class="login-form">
			<a href="/auth/google" class="google-signin-btn">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				Continue with Google
			</a>
		</div>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.login-card {
		background: white;
		border-radius: 12px;
		padding: 48px;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		width: 100%;
		max-width: 400px;
	}

	.logo {
		text-align: center;
		margin-bottom: 32px;
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

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.google-signin-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 12px 24px;
		font-size: 16px;
		font-weight: 500;
		color: #374151;
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.google-signin-btn:hover {
		border-color: #d1d5db;
		background: #f9fafb;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.google-signin-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.login-container {
			padding: 1rem;
		}

		.login-card {
			padding: 2rem 1.5rem;
			max-width: 350px;
		}

		.logo h1 {
			font-size: 1.5rem; /* 24px - following vertical rhythm */
			line-height: 1.5rem;
		}

		.logo {
			margin-bottom: 2rem;
		}

		.google-signin-btn {
			padding: 0.75rem 1.5rem;
			font-size: 0.875rem;
		}
	}
</style>
