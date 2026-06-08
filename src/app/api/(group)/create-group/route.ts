import { db } from '@/lib/db';
import { ZodError } from 'zod';
import { groupLeagueTable, groupProfileTable, groupTable } from '@/lib/db/schema';
import { createGroupSchema } from '@/types/formSchema';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';
import posthogClient from '@/lib/posthog';

export async function POST(req: Request) {
	try {
		// check if request is authentic
		const profile = await authenticateUser();
		if (!profile) return new Response('Unauthenticated', { status: 401 });

		// parse request body
		const body = await req.json();
		const parsedData = createGroupSchema.parse(body);

		// create group entry then return group id
		const res = await db.insert(groupTable).values(parsedData).returning({ id: groupTable.id });
		// add user as admin to new group
		await db
			.insert(groupProfileTable)
			.values({ profileId: profile.id!, groupId: res[0].id, role: 'admin' });
		// add selected leagues
		await db.insert(groupLeagueTable).values({ groupId: res[0].id, leagueId: body.leagueTagId });

		const posthog = posthogClient();

		posthog.capture({
			distinctId: profile.id,
			event: 'group_created',
			properties: {
				message: 'user created group successfully',
			},
		});

		//send successful post request
		return new Response('Group created successfully', { status: 201 });
	} catch (error) {
		if (error instanceof ZodError) {
			console.error('Validation error:', error);
			return new Response('Invalid input data', { status: 400 });
		}

		console.error('Failed to create group:', error);
		return new Response('Failed to create group', { status: 500 });
	}
}
