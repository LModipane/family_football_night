import { db } from '@/lib/db';
import { leagueTable } from '@/lib/db/schema';
import { TOURNOMINATE_SELECTIONS } from '@/contants';

export async function POST(req: Request) {
	try {
		const legaues = TOURNOMINATE_SELECTIONS.flatMap(item =>
			item.options.map(option => ({
				id: option.tagId,
				name: option.name,
				category: item.category as any,
				iconUrl: option.iconUrl,
			})),
		);
		await db.insert(leagueTable).values(legaues);
		return new Response('successfully initialise Leagues', { status: 200 });
	} catch (error) {
		console.error('Failed to initialise leagues: ', error);
		return new Response('Opps, failed to intialise Leagues', { status: 500 });
	}
}
