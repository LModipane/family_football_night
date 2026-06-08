import { db } from '@/lib/db';
import { ZodError } from 'zod';
import posthogClient from '@/lib/posthog';
import { getServerSession } from 'next-auth';
import { predictionTable } from '@/lib/db/schema';
import { authOptions } from '@/lib/nextAuth/options';
import { PredictionSchema } from '@/types/formSchema';

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return new Response('Opps, unauthorissed To Post Prediction', { status: 401 });

		const profile = await db.query.profileTable.findFirst({
			where: (table, { eq }) => eq(table.userId, session?.user.id ?? 'NA'),
		});
		if (!profile) return new Response('Opps, Unauthorised to Post Prediction', { status: 400 });

		const body = await req.json();
		const parsedData = PredictionSchema.omit({ predictionId: true }).parse(body);

		await db.insert(predictionTable).values({
			...parsedData,
			profileId: profile.id,
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
