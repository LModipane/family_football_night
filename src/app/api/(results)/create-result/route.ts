import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { Prediction } from '@/types';
import { matchResultTable, predictionTable } from '@/lib/db/schema';

const ENTITY_TAG_ID = 'c0ca5665-d9d9-42dc-ad86-a7f48a4da2c6';

export async function POST(req: Request) {
	try {
		if (!isCronJobAuthorized(req)) return new Response('Unauthenticated!!!', { status: 401 });

		const predictions = await db.query.predictionTable.findMany({
			where: (table, { eq }) => eq(table.status, 'unsettled'),
		});
		if (!predictions.length) return new Response('No unsettled predictions', { status: 200 });

		const data = await fetchMatchSummary(ENTITY_TAG_ID);

		await Promise.allSettled(predictions.map(prediction => settlePrediction(prediction, data)));

		return new Response('Match results processed successfully', { status: 201 });
	} catch (error) {
		console.error('Failed to create match results:', error);
		return new Response('Failed to process match results', { status: 500 });
	}
}

/* -------------------------------------------------------------------------- */
/*                                CORE LOGIC                                  */
/* -------------------------------------------------------------------------- */

async function settlePrediction(prediction: Prediction, data: MatchSummaryResponse) {
	try {
		// Find the match summary for the prediction's match event ID
		const match = data.Summary.find(m => m.eventId === prediction.matchEventId);
		if (!match) return;

		const awayResult = match.score.total.away;
		const homeResult = match.score.total.home;

		// Calculate points based on prediction vs actual result
		const points = calculatePoints(
			awayResult,
			homeResult,
			prediction.awayTeamScore,
			prediction.homeTeamScore,
		);

		// Insert match result if it doesn't already exist
		await db
			.insert(matchResultTable)
			.values({
				point: points,
				homeTeamScoreResult: homeResult,
				awayTeamScoreResult: awayResult,
				profileId: prediction.profileId,
				matchEventId: prediction.matchEventId,
				homeTeamBadgeUrl: prediction.homeTeamBadgeUrl,
				awayTeamBadgeUrl: prediction.awayTeamBadgeUrl,
				homeTeamScorePrediction: prediction.homeTeamScore,
				awayTeamScorePrediction: prediction.awayTeamScore,
			})
			.onConflictDoNothing();

		// Update prediction status to settled
		await db
			.update(predictionTable)
			.set({
				status: 'settled',
				updateAt: new Date(),
			})
			.where(eq(predictionTable.id, prediction.id!));
	} catch (error) {
		console.error(`Failed settling prediction ${prediction.id}`, error);
	}
}

/* -------------------------------------------------------------------------- */
/*                             POINT CALCULATION                              */
/* -------------------------------------------------------------------------- */

function calculatePoints(
	awayResult: number,
	homeResult: number,
	awayPrediction: number,
	homePrediction: number,
): number {
	if (awayPrediction === awayResult && homePrediction === homeResult) return 2; // perfect
	
	const correctOutcome =
		(awayResult > homeResult && awayPrediction > homePrediction) ||
		(homeResult > awayResult && homePrediction > awayPrediction) ||
		(homeResult === awayResult && homePrediction === awayPrediction);

	return correctOutcome ? 1 : 0;
}

/* -------------------------------------------------------------------------- */
/*                                 UTILITIES                                  */
/* -------------------------------------------------------------------------- */

function isCronJobAuthorized(req: Request): boolean {
	const authHeader = req.headers.get('authorization');
	if (!authHeader) return false;

	const token = authHeader.replace('Bearer ', '');
	return token === process.env.CRON_JOB_SECRET!;
}

type MatchSummaryResponse = {
	Summary: {
		eventId: string;
		score: {
			total: {
				away: number;
				home: number;
			};
		};
	}[];
};

async function fetchMatchSummary(league: string): Promise<MatchSummaryResponse> {
	const res = await fetch(
		`https://supersport.com/apix/football/v5.1/feed/score/summary?top=25&eventStatusIds=3&entityTagIds=${league}&orderAscending=false&region=za&platform=indaleko-web`,
	);
	if (!res.ok) throw new Error('Failed to fetch match summary');

	return res.json();
}
