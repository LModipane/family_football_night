import { db } from '../db';
import { AuthOptions } from 'next-auth';
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
				// 1. Generate a fallback email if none is provided by Facebook
				const safeEmail = user.email ?? `${user.id}@facebook-no-email.com`;

				const existingProfile = await db.query.profileTable.findFirst({
					where: (table, { eq, or }) => or(eq(table.userId, user.id), eq(table.email, safeEmail)),
				});

				if (existingProfile) return true;

				// Remove email check from requirements since it can be missing
				if (!user.name || !user.id) return false;

				// 2. Use the safe email when creating the record
				const profile = await db
					.insert(profileTable)
					.values({
						userId: user.id,
						name: user.name,
						email: safeEmail,
						imageUrl: user.image ?? null,
					})
					.returning({ id: profileTable.id });

				// The rest of your profile/group creation logic remains unchanged
				const group = await db
					.insert(groupTable)
					.values({
						name: 'Untitled Group',
					})
					.returning({ id: groupTable.id });

				await db.insert(groupProfileTable).values({
					groupId: group[0].id,
					profileId: profile[0].id,
					role: 'admin',
				});

				await db.insert(groupLeagueTable).values({
					groupId: group[0].id,
					leagueId: '882fc52f-14b7-4e7c-a259-5ff5d18bde67', // Betway Premier League as default league
				});

				return true;
			} catch (error) {
				console.error('Error in signIn callback:', error);
				return false;
			}
		},
		async session({ session }) {
			const existingProfile = await db.query.profileTable.findFirst({
				where: (table, { eq, or }) =>
					or(
						eq(table.userId, session.user.id ?? 'NA'),
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
