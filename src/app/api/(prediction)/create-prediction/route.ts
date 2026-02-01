import { db } from '@/lib/db';
import { predictionTable } from '@/lib/db/schema';
import { authOptions } from '@/lib/nextAuth/options';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return new Response('Opps, unauthorissed To Post Prediction', { status: 401 });

		const profile = await db.query.profileTable.findFirst({
			where: (table, { eq }) => eq(table.userId, session?.user.id ?? 'NA'),
		});
		if (!profile) return new Response('Opps, Unauthorised to Post Prediction', { status: 400 });

		const {
			homeTeamScore,
			awayTeamScore,
			id: matchEventId,
			homeTeamName,
			awayTeamName,
			awayTeamBadgeUrl,
			homeTeamBadgeUrl,
		} = await req.json();

		await db.insert(predictionTable).values({
			awayTeamName,
			homeTeamName,
			matchEventId,
			awayTeamScore,
			homeTeamScore,
			awayTeamBadgeUrl,
			homeTeamBadgeUrl,
			profileId: profile.id,
		});

		return new Response('Success', { status: 200 });
	} catch (error) {
		console.log('Failed To Create Prediction!!!:', error);
		return new Response('Opps, Failed to Post Prediction', { status: 500 });
	}
}
