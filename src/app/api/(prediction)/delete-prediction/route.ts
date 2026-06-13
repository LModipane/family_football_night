import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { predictionTable } from '@/lib/db/schema';
import { PredictionSchema } from '@/types/formSchema';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';

export async function DELETE(request: Request) {
	try {
		const profile = await authenticateUser();
		if (!profile) return new Response('Opps, Unauthorised to Post Prediction', { status: 401 });

		const body = await request.json();
		const { success, data } = PredictionSchema.safeParse(body);

		if (!success || !data || !data.id) return new Response('Opps, Bad Request!', { status: 400 });

		await db.delete(predictionTable).where(eq(predictionTable.id, data.id));

		return new Response('Successfully deleted Prediction', { status: 200 });
	} catch (error) {
		console.error('Failed to delete Prediction: ', error);
		return new Response('Failed to delete Prediction', { status: 500 });
	}
}
