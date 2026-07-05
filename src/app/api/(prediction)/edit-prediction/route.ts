import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { predictionTable } from '@/lib/db/schema';
import { PredictionSchema } from '@/types/formSchema';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';
import { determineWinningSide } from '../util';

export async function PUT(req: Request) {
	try {
		const profile = await authenticateUser();
		if (!profile) return new Response('Opps, Unauthorised to Post Prediction', { status: 401 });

		const body = await req.json();
		const { success, data } = PredictionSchema.safeParse(body);

		if (!success || !data || !data.id) return new Response('Opps, Bad request!!!', { status: 400 });

		const winningSide = determineWinningSide(data);

		await db
			.update(predictionTable)
			.set({ ...data, winningSide })
			.where(eq(predictionTable.id, data.id));

		return new Response(`Success`, { status: 200 });
	} catch (error) {
		console.error('Failed To Edit Prediction!!!:', error);
		return new Response('Opps, Failed to Edit Prediction', { status: 500 });
	}
}
