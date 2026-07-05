import { db } from '@/lib/db';
import { inArray } from 'drizzle-orm';
import { MatchResult, Points, Prediction } from '@/types';
import { matchResultTable, predictionTable, pointTable } from '@/lib/db/schema';

export async function POST(req: Request) {
	try {
		// Let's check if this is a valid cron-job request
		if (process.env.NODE_ENV === 'production' && !isCronJobAuthorized(req))
			return new Response('Unauthenticated!!!', { status: 401 });

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

		//Define inserts values:
		const matchResultToInsert: MatchResult[] = [];
		const pointsToInsert: Points[] = [];
		const predictionIdsToUpdate: string[] = [];

		const processedMatchEvents = new Set<string>();

		//Process Each Prediction
		for (const [leagueTagId, predictions] of leaguePredictionsMap) {
			const matches = await fetchMatchSummary(leagueTagId);
			if (!matches) continue;

			for (const prediction of predictions) {
				const matchResult = matches.Summary.find(obj => obj.eventId === prediction.matchEventId);
				if (!matchResult) continue;

				//Fetch results value
				const winningSide = matchResult.score.winner.side;
				const awayTeamScoreResult = matchResult.score.total.away;
				const homeTeamScoreResult = matchResult.score.total.home;

				//Calulate points
				const points = calculatePoints({
					winningSide,
					awayResult: awayTeamScoreResult,
					homeResult: homeTeamScoreResult,
					homePrediction: prediction.homeTeamScore,
					awayPrediction: prediction.awayTeamScore,
					winningPrediction: prediction.winningSide,
					isKnockoutFixture: matchResult.isKnockoutFixture,
				});

				// only insert matches for each match event
				if (!processedMatchEvents.has(prediction.matchEventId)) {
					matchResultToInsert.push({
						winningSide,
						awayTeamScoreResult,
						homeTeamScoreResult,
						matchEventId: prediction.matchEventId,
					});

					processedMatchEvents.add(prediction.matchEventId);
				}

				// add points to insert
				pointsToInsert.push({
					points,
					predictionId: prediction.id!,
				});

				// Add prediction ids to update
				predictionIdsToUpdate.push(prediction.id!);
			}
		}

		const dbQueries: Promise<unknown>[] = [];

		// Insert match results
		if (matchResultToInsert.length > 0) {
			const insertMatchResult = db
				.insert(matchResultTable)
				.values(matchResultToInsert)
				.onConflictDoNothing();

			dbQueries.push(insertMatchResult);
		}

		// Insert points
		if (pointsToInsert.length > 0) {
			const insertPoints = db.insert(pointTable).values(pointsToInsert).onConflictDoNothing();
			dbQueries.push(insertPoints);
		}

		// Update predictions
		if (predictionIdsToUpdate.length > 0) {
			const updatePrediction = db
				.update(predictionTable)
				.set({
					status: 'settled',
					updateAt: new Date(),
				})
				.where(inArray(predictionTable.id, predictionIdsToUpdate));

			dbQueries.push(updatePrediction);
		}

		await Promise.all(dbQueries);

		return new Response('Match results processed successfully', { status: 201 });
	} catch (error) {
		console.error('Failed to process match results:', error);
		return new Response('Failed to process match results', { status: 500 });
	}
}

/* -------------------------------------------------------------------------- */
/*                             POINT CALCULATION                              */
/* -------------------------------------------------------------------------- */

type Args = {
	awayResult: number;
	homeResult: number;
	awayPrediction: number;
	homePrediction: number;
	isKnockoutFixture: boolean;
	winningSide: WinningSide;
	winningPrediction?: WinningSide;
};

function calculatePoints({
	awayResult,
	homeResult,
	winningSide,
	homePrediction,
	awayPrediction,
	isKnockoutFixture,
	winningPrediction,
}: Args): number {
	const predictedDraw = awayPrediction === homePrediction;
	const isPerfectPrediction = awayPrediction === awayResult && homePrediction === homeResult;
	const isPerfectKnockoutPrediction =
		isKnockoutFixture && predictedDraw && isPerfectPrediction && winningSide === winningPrediction;

	if (isPerfectKnockoutPrediction) return 4;
	if (isPerfectPrediction) return 3;

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

type WinningSide = 'home' | 'away' | 'draw';

type MatchSummaryResponse = {
	Summary: {
		eventId: string;
		score: {
			total: {
				away: number;
				home: number;
			};
			shootout: {} | null;
			winner: { side: WinningSide };
		};
		isKnockoutFixture: boolean;
	}[];
};

async function fetchMatchSummary(leagueId: string): Promise<MatchSummaryResponse | null> {
	try {
		const res = await fetch(
			`https://supersport.com/apix/football/v5.1/feed/score/summary?top=25&eventStatusIds=3&entityTagIds=${leagueId}&orderAscending=false&region=za&platform=indaleko-web`,
		);
		if (!res.ok) throw new Error(res.statusText);

		const data = (await res.json()) as MatchSummaryResponse;
		return data;
	} catch (error) {
		console.error('Failed to fetch match Summary', error);
		return null;
	}
}
