import { db } from '@/lib/db';
import { Prediction } from '@/types';
import { inArray } from 'drizzle-orm';
import { matchResultTable, predictionTable } from '@/lib/db/schema';

export async function POST(req: Request) {
	try {
		// Let's check if this is a valid cron-job request 
		if (!isCronJobAuthorized(req)) return new Response('Unauthenticated!!!', { status: 401 });

		// let's fetch all the prediction that needs to calculate results from 
		const predictions = await db.query.predictionTable.findMany({
			where: (table, { eq }) => eq(table.status, 'unsettled'),
		});

		// If there is no prediction let response to the cron-job with 200 message
		if (!predictions || predictions.length === 0)
			return new Response('No unsettled predictions', { status: 200 });

		// Let's group the predictions by leagues to reduce the number of time we make requests 
		const leaguePredictionsMap = new Map<string, Prediction[]>();

		// For every prediction, push the prediction in group only if it is in the same league else create a new group within the intial prediction
		for (const prediction of predictions) {
			if (leaguePredictionsMap.has(prediction.leagueTagId)) {
				leaguePredictionsMap.get(prediction.leagueTagId)!.push(prediction);
			} else {
				leaguePredictionsMap.set(prediction.leagueTagId, [prediction]);
			}
		}

		// let's batch all request to 
		const matchResultsToInsert = [];
		const predictionIdsToUpdate: string[] = [];

		// For each league group, let's fetch match results 
		for (const [leagueTagId, leaguePredictions] of leaguePredictionsMap) {
			const data = await fetchMatchSummary(leagueTagId);
			
			// For each prediction in league group, find the match results, calculate points finally push it to batch array else just skip prediction
			for (const prediction of leaguePredictions) {
				const match = data.Summary.find(obj => obj.eventId === prediction.matchEventId)
				if (!match) continue;

				const awayTeamScoreResult = match.score.total.away;
				const homeTeamScoreResult = match.score.total.home;

				const point = calculatePoints(
					awayTeamScoreResult,
					homeTeamScoreResult,
					prediction.awayTeamScore,
					prediction.homeTeamScore,
				);

				matchResultsToInsert.push({
					point,
					awayTeamScoreResult,
					homeTeamScoreResult,
					predictionId: prediction.id!,
					profileId: prediction.profileId,
					matchEventId: prediction.matchEventId,
				});

				predictionIdsToUpdate.push(prediction.id!);
			}
		}

		// If batch size is greater than zero, let's insert the results 
		if (matchResultsToInsert.length)
			await db.insert(matchResultTable).values(matchResultsToInsert).onConflictDoNothing();

		// if batch size i greater than zero, let's update predictions to be settled
		if (predictionIdsToUpdate.length)
			await db
				.update(predictionTable)
				.set({
					status: 'settled',
					updateAt: new Date(),
				})
				.where(inArray(predictionTable.id, predictionIdsToUpdate));

		return new Response('Match results processed successfully', { status: 201 });
	} catch (error) {
		console.error('Failed to process match results:', error);
		return new Response('Failed to process match results', { status: 500 });
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

	const token = authHeader.replace('Bearer ', '').trim();
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
