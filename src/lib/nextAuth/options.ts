import { db } from '../db';
import { AuthOptions } from 'next-auth';
import posthogClient from '@/lib/posthog';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { profileTable, groupTable, groupProfileTable, groupLeagueTable } from '../db/schema';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
	throw new Error('Google OAuth environment variables are not set');

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		FacebookProvider({
			clientId: process.env.FACEBOOK_CLIENT_ID!,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async signIn({ user }) {
			try {
				const safeEmail = user.email ?? `${user.id}@facebook-no-email.com`;

				const existingProfile = await db.query.profileTable.findFirst({
					where: (table, { eq, or }) => or(eq(table.userId, user.id), eq(table.email, safeEmail)),
				});

				if (existingProfile || !user.name || !user.id) return true;

				const [{ id: profileId }] = await db
					.insert(profileTable)
					.values({
						userId: user.id,
						name: user.name,
						email: safeEmail,
						imageUrl: user.image ?? null,
					})
					.returning({ id: profileTable.id });

				const [{ id: groupId }] = await db
					.insert(groupTable)
					.values({
						name: 'Untitled Group',
					})
					.returning({ id: groupTable.id });

				await db.insert(groupProfileTable).values({
					groupId,
					profileId,
					role: 'admin',
				});

				await db.insert(groupLeagueTable).values({
					groupId,
					leagueId: '882fc52f-14b7-4e7c-a259-5ff5d18bde67', // Betway Premier League as default league
				});

				const posthog = posthogClient();

				posthog.capture({
					distinctId: profileId,
					event: 'user_signed_up',
					properties: {
						message: 'New user has signed in successfully',
					},
				});

				return true;
			} catch (error) {
				console.error('Error in signIn callback:', error);
				return false;
			}
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			const existingProfile = await db.query.profileTable.findFirst({
				where: (table, { eq, or }) =>
					or(
						eq(table.userId, (token.id as string) ?? 'NA'),
						eq(table.email, session.user.email ?? 'NA'),
					),
			});

			if (existingProfile) session.user.id = existingProfile.userId;

			return session;
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
