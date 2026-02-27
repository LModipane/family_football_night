import { db } from '@/lib/db';
import { ZodError } from 'zod';
import { groupProfileTable, groupTable } from '@/lib/db/schema';
import { createGroupSchema } from '@/types/formSchema';
import { isUserAuthenticated } from '@/lib/nextAuth/is_user_authenticated';

export async function POST(req: Request) {
	try {
		const profile = await isUserAuthenticated();
		if (!profile) return new Response('Unauthenticated', { status: 401 });

		const body = await req.json();
		const parsedData = createGroupSchema.parse(body);
		const res = await db.insert(groupTable).values(parsedData).returning({ id: groupTable.id });
		await db.insert(groupProfileTable).values({ profileId: profile.id!, groupId: res[0].id, role: "admin" }).returning();
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
