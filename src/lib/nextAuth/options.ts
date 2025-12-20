// import { db } from '@/lib/db';
import { AuthOptions } from 'next-auth';
// import { profileTable } from '@/lib/db/schema';
import GoogleProvider from 'next-auth/providers/google';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
	throw new Error('Google OAuth environment variables are not set');

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async signIn({ user }) {
			try {
				console.log('User signing in:', user);
				return true;
			} catch (error) {
				console.error('Error in signIn callback:', error);
				return false;
			}
		},
	},
	jwt: {
		secret: process.env.NEXTAUTH_SECRET,
	},
	secret: process.env.NEXTAUTH_SECRET,
	logger: {
		error(code, error) {
			console.error(code, error);
		},
		warn(code) {
			console.warn(code);
		},
		debug(code) {
			console.debug(code);
		},
	},
};
