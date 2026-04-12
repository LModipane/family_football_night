import * as z from 'zod';
import { db } from '@/lib/db';
import { groupLeagueTable } from '@/lib/db/schema';
import { addLeagueSchema } from '@/types/formSchema';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsedData = addLeagueSchema.parse(body);

		await db
			.insert(groupLeagueTable)
			.values(
				parsedData.leagueIds.map(leagueId => ({
                    groupId: parsedData.groupId,
                    leagueId,
                })),
			)
			.onConflictDoNothing();

		return new Response('Leagues added to group successfully', { status: 200 });
    } catch (error) {
        if(error instanceof z.ZodError) {
            console.error('Bad Request Data', error);
            return new Response('Opps, Bad Request', { status: 400 });
        }
		console.error('Failed to add leagues to group:', error);
		return new Response('Opps, Failed to add leagues to group', { status: 500 });
	}
}
