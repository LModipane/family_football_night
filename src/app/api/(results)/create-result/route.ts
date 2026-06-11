import { db } from '@/lib/db';
import { MatchResult, Prediction } from '@/types';
import { inArray, sql } from 'drizzle-orm';
import { matchResultTable, predictionTable } from '@/lib/db/schema';
import { point } from 'drizzle-orm/pg-core';

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

		// let's batch all request into:
		const matchResultsToInsert = [] as MatchResult[];
		const predictionIdsToUpdate: string[] = [];

		// For each league group, let's fetch match results
		for (const [leagueTagId, leaguePredictions] of leaguePredictionsMap) {
			const data = await fetchMatchSummary(leagueTagId);
			if (!data) continue;

			// For each prediction in league group, find the match results, calculate points finally push it to batch array else just skip prediction
			for (const prediction of leaguePredictions) {
				const match = data.Summary.find(obj => obj.eventId === prediction.matchEventId);
				if (!match) continue;

				const awayTeamScoreResult = match.score.total.away;
				const homeTeamScoreResult = match.score.total.home;

				const point = calculatePoints({
					awayResult: awayTeamScoreResult,
					homeResult: homeTeamScoreResult,
					winningSide: match.score.winner.side,
					homePrediction: prediction.homeTeamScore,
					awayPrediction: prediction.awayTeamScore,
					winningPrediction: prediction.winningSide,
					isKnockoutFixture: match.isKnockoutFixture,
				});

				matchResultsToInsert.push({
					point,
					awayTeamScoreResult,
					homeTeamScoreResult,
					predictionId: prediction.id!,
					profileId: prediction.profileId,
					winningSide: match.score.winner.side,
					matchEventId: prediction.matchEventId,
				});

				predictionIdsToUpdate.push(prediction.id!);
			}
		}

		// If batch size is greater than zero, let's insert the results
		if (matchResultsToInsert.length > 0)
			await db
				.insert(matchResultTable)
				.values(matchResultsToInsert)
				.onConflictDoNothing();

		// if batch size i greater than zero, let's update predictions to be settled
		if (predictionIdsToUpdate.length > 0)
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
	winningPrediction = 'home',
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
		console.log(res);
		if (!res.ok) throw new Error(res.statusText);

		const data = (await res.json()) as MatchSummaryResponse;
		return data;
	} catch (error) {
		console.error('Failed to fetch match Summary', error);
		return null;
	}
}
