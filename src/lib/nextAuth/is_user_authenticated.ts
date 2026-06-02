import 'server-only';
import { db } from '../db';
import { authOptions } from './options';
import { getServerSession } from 'next-auth/next';
import { Profile } from '@/types';

export const authenticateUser = async (): Promise<Profile | null> => {
	'use server';

	try {
		const session = await getServerSession(authOptions);
		if (!session) return null;

		const profile = await db.query.profileTable.findFirst({
			where: (table, { eq }) => eq(table.userId, session?.user.id ?? 'NA'),
		});
		if (!profile) return null;

		return profile;
	} catch (error) {
		console.error('Authentication check failed:', error);
		return null;
	}
};
