import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { profileTable } from '@/lib/db/schema';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// This prevents the application from running with incomplete authentication configuration.
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
	throw new Error('Google Client ID and Secret must be set in environment variables');
}

export const authOptions: AuthOptions = {
	providers: [
		// Google OAuth provider
		GoogleProvider({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
		}),
	],
	session: {
		// Use JSON Web Tokens (JWT) for session management.
		// This is a stateless session strategy, suitable for scalable applications.
		strategy: 'jwt',
	},
	// Callbacks are functions that are called at various points in the authentication flow.
	callbacks: {
		// The signIn callback is called whenever a user attempts to sign in.
		async signIn({ user }) {
			try {
				// Check if the user already exists in the profile table.
				const existingProfile = await db.query.profileTable.findFirst({
					where: (profileTable, { eq }) => eq(profileTable.userId, user.id!),
				});
				// User already exists in the profile table, allow sign-in.
				if (existingProfile) return true;

				if (!user.id || !user.name || !user.email) throw new Error('User ID or name is missing');

				await db.insert(profileTable).values({
					userId: user.id,
					name: user.name,
					email: user.email,
					imageUrl: user.image || null,
				});

				// Returning true allows the user to sign in.

				return true;
			} catch (error) {
				console.error('Error Failed to insert user into profile table, during sign-in:', error);
				// Returning false denies the sign-in attempt.
				return false;
			}
		},
	},
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
	secret: process.env.NEXTAUTH_SECRET,
};
