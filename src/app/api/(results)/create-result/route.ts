import { db } from '@/lib/db';
import { Prediction } from '@/types';
import { eq, and } from 'drizzle-orm';
import { matchResultTable, predictionTable } from '@/lib/db/schema';

export async function POST(req: Request) {
	try {
		const authHeader = req.headers.get('authorization');
		if (!authHeader) return new Response('Opps, Unauthenticated', { status: 401 });

		const token = authHeader.replace('Bearer ', '');
		if (token !== process.env.CRON_JOB_SECRETE)
			return new Response('Unauthenticated', { status: 403 });

		const predictions = await db.query.predictionTable.findMany({
			where: (table, { eq }) => eq(table.status, 'unsettled'),
		});
		if (predictions.length === 0) return new Response('No unsettled Prediction', { status: 200 });

		await Promise.allSettled(
			predictions.map(async prediction => await calculateResult(prediction)),
		);

		return new Response('Successfully create Match Results', { status: 201 });
	} catch (error) {
		console.error('Failled to create Match Result: ', error);
		return new Response('Opps, failed to Post match Result', { status: 500 });
	}
}

const calculateResult = async (prediction: Prediction) => {
	try {
		const res = await fetch(
			`https://supersport.com/apix/football/v5.1/feed/score/summary?top=25&eventStatusIds=3&entityTagIds=${`c0ca5665-d9d9-42dc-ad86-a7f48a4da2c6`}&orderAscending=false&region=za&platform=indaleko-web`,
		);
		const data = await res.json();
		const matchResult = data.Summary.find(
			(match: { eventId: string }) => match.eventId === prediction.matchEventId,
		);

		const awayTeamScoreResult = matchResult?.score.total.away as number;
		const homeTeamScoreResult = matchResult?.score.total.home as number;
		// const isKnockout = false; //prediction.isKnockoutEvent ;

		if (
			isPerfectPrediction(
				awayTeamScoreResult,
				homeTeamScoreResult,
				prediction.awayTeamScore,
				prediction.homeTeamScore,
			)
		) {
			const existingResult = await db
				.select({ id: matchResultTable.id })
				.from(matchResultTable)
				.where(
					and(
						eq(matchResultTable.profileId, prediction.profileId),
						eq(matchResultTable.matchEventId, prediction.matchEventId),
					),
				)
				.limit(1);

			if (existingResult.length === 0) {
				await db.insert(matchResultTable).values({
					point: 2,
					homeTeamScoreResult,
					awayTeamScoreResult,
					profileId: prediction.profileId,
					matchEventId: prediction.matchEventId,
					homeTeamBadgeUrl: prediction.homeTeamBadgeUrl,
					awayTeamBadgeUrl: prediction.awayTeamBadgeUrl,
					homeTeamScorePrediction: prediction.homeTeamScore,
					awayTeamScorePrediction: prediction.awayTeamScore,
				});
			}

			await db
				.update(predictionTable)
				.set({
					status: 'settled',
					updateAt: new Date(),
				})
				.where(eq(predictionTable.id, prediction.id!));
		} else if (
			isCorrectResult(
				awayTeamScoreResult,
				homeTeamScoreResult,
				prediction.awayTeamScore,
				prediction.homeTeamScore,
			)
		) {
			const existingResult = await db
				.select({ id: matchResultTable.id })
				.from(matchResultTable)
				.where(
					and(
						eq(matchResultTable.profileId, prediction.profileId),
						eq(matchResultTable.matchEventId, prediction.matchEventId),
					),
				)
				.limit(1);

			if (existingResult.length === 0) {
				await db.insert(matchResultTable).values({
					point: 1,
					homeTeamScoreResult,
					awayTeamScoreResult,
					profileId: prediction.profileId,
					matchEventId: prediction.matchEventId,
					homeTeamBadgeUrl: prediction.homeTeamBadgeUrl,
					awayTeamBadgeUrl: prediction.awayTeamBadgeUrl,
					homeTeamScorePrediction: prediction.homeTeamScore,
					awayTeamScorePrediction: prediction.awayTeamScore,
				});
			}

			await db
				.update(predictionTable)
				.set({
					status: 'settled',
					updateAt: new Date(),
				})
				.where(eq(predictionTable.id, prediction.id!));
		} else {
			const existingResult = await db
				.select({ id: matchResultTable.id })
				.from(matchResultTable)
				.where(
					and(
						eq(matchResultTable.profileId, prediction.profileId),
						eq(matchResultTable.matchEventId, prediction.matchEventId),
					),
				)
				.limit(1);

			if (existingResult.length === 0) {
				await db.insert(matchResultTable).values({
					point: 0,
					homeTeamScoreResult,
					awayTeamScoreResult,
					profileId: prediction.profileId,
					matchEventId: prediction.matchEventId,
					homeTeamBadgeUrl: prediction.homeTeamBadgeUrl,
					awayTeamBadgeUrl: prediction.awayTeamBadgeUrl,
					homeTeamScorePrediction: prediction.homeTeamScore,
					awayTeamScorePrediction: prediction.awayTeamScore,
				});
			}

			await db
				.update(predictionTable)
				.set({
					status: 'settled',
					updateAt: new Date(),
				})
				.where(eq(predictionTable.id, prediction.id!));
		}
	} catch (error) {
		console.error(`Failed to calculate for prediction ${prediction.id}: `, error);
	}
};

const isPerfectPrediction = (
	awayTeamResult: number,
	homeTeamResult: number,
	awayTeamPrediction: number,
	homeTeamPrediction: number,
) => {
	return awayTeamPrediction === awayTeamResult && homeTeamPrediction === homeTeamResult;
};

const isCorrectResult = (
	awayTeamResult: number,
	homeTeamResult: number,
	awayTeamPrediction: number,
	homeTeamPrediction: number,
) => {
	return (
		(awayTeamResult > homeTeamResult && awayTeamPrediction > homeTeamPrediction) ||
		(homeTeamResult > awayTeamResult && homeTeamPrediction > awayTeamPrediction) ||
		(homeTeamResult === awayTeamResult && homeTeamPrediction === awayTeamPrediction)
	);
};
