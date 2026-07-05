import { db } from '@/lib/db';
import { ZodError } from 'zod';
import posthogClient from '@/lib/posthog';
import { determineWinningSide } from '../util';
import { predictionTable } from '@/lib/db/schema';
import { PredictionSchema } from '@/types/formSchema';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';

export async function POST(req: Request) {
	try {
		const profile = await authenticateUser();
		if (!profile) return new Response('Opps, Unauthorised to Post Prediction', { status: 401 });

		const body = await req.json();
		const { success, data } = PredictionSchema.safeParse(body);
		if (!success || !data) return new Response('Opps, Bad Request', { status: 400 });

		const matchEvent = await db.query.matchEventTable.findFirst({
			where: (table, { eq }) => eq(table.id, data.matchEventId),
		});
		if (!matchEvent) return new Response('Opps, Bad Request!!!', { status: 400 });

		const existingPrediction = await db.query.predictionTable.findFirst({
			where: (table, { eq, and }) =>
				and(
					eq(table.groupId, data.groupId),
					eq(table.profileId, profile.id!),
					eq(table.matchEventId, data.matchEventId),
				),
		});
		if (existingPrediction) return new Response('Existing Prediction', { status: 204 });

		const isSubmissionOpen = +new Date(matchEvent.kickOff) - +new Date() > 10 * 60 * 1000;
		if (!isSubmissionOpen)
			return new Response('Opps, submission for prediction are closed', { status: 422 });

		const winningSide = determineWinningSide(data);

		await db.insert(predictionTable).values({
			...data,
			winningSide,
			profileId: profile.id!,
		});

		const posthog = posthogClient();

		posthog.capture({
			distinctId: profile.id,
			event: 'prediction_created',
			properties: {
				message: 'user has created prediction',
			},
		});

		return new Response('Success Created Predictions', { status: 200 });
	} catch (error) {
		if (error instanceof ZodError) {
			console.error('Bad Request Data', error);
			return new Response('Opps, Bad Request', { status: 400 });
		}
		console.error('Failed To Create Prediction!!!:', error);
		return new Response('Opps, Failed to Post Prediction', { status: 500 });
	}
}
