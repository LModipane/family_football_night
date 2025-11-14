// Import necessary types and modules for NextAuth.js configuration
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Retrieve Google Client ID and Secret from environment variables
// These are essential for Google OAuth to function correctly.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Ensure that the environment variables are set, otherwise throw an error
// This prevents the application from running with incomplete authentication configuration.
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
	throw new Error('Google Client ID and Secret must be set in environment variables');
}

// Main configuration object for NextAuth.js
export const authOptions: AuthOptions = {
	// Configure authentication providers
	providers: [
		// Google OAuth provider
		GoogleProvider({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
		}),
	],
	// Configure session management
	session: {
		// Use JSON Web Tokens (JWT) for session management.
		// This is a stateless session strategy, suitable for scalable applications.
		strategy: 'jwt',
	},
	// Callbacks are functions that are called at various points in the authentication flow.
	callbacks: {
		// The signIn callback is called whenever a user attempts to sign in.
		// It can be used to control if a user is allowed to sign in or not.
		async signIn({ user }) {
			console.log('User: ', user);
			// Returning true allows the user to sign in.
			// You could add custom logic here, e.g., checking if the user is authorized.
			return true;
		},
	},
	// Custom logger for NextAuth.js events.
	// This helps in debugging and monitoring authentication processes.
	logger: {
		error(code, error) {
			console.error('Next Auth Error: ', code, error);
		},
		warn(code) {
			console.warn('Next Auth Warning: ', code);
		},
		debug(code) {
			console.debug('Next Auth Debug: ', code);
		},
	},
	// The secret used to sign and encrypt the session cookie.
	// It is crucial for security and should be a long, random string.
	// Retrieved from environment variables.
	secret: process.env.NEXTAUTH_SECRET,
};
