import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
	throw new Error('Google Client ID and Secret must be set in environment variables');
}

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async signIn({ user }) {
			console.log('User: ', user);
			return true;
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
