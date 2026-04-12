import { db } from '@/lib/db';
import { groupLeagueTable } from '@/lib/db/schema';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { selectedLeagueIds, groupId } = body;

		await db
			.insert(groupLeagueTable)
			.values(
				selectedLeagueIds.map((leagueId: string) => ({
					groupId,
					leagueId,
				})),
			)
			.onConflictDoNothing();

		return new Response('Leagues added to group successfully', { status: 200 });
	} catch (error) {
		console.error('Failed to add leagues to group:', error);
		return new Response('Opps, Failed to add leagues to group', { status: 500 });
	}
}
