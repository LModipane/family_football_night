import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { PredictionSchema } from '@/types/formSchema';
import { predictionTable } from '@/lib/db/schema';

export async function DELETE(request: Request) {
	try {
		const body = await request.json();
		const parsedData = PredictionSchema.parse(body);
		if (!parsedData.predictionId)
			throw new Error('Prediction ID is required for deleting prediction');

		await db.delete(predictionTable).where(eq(predictionTable.id, parsedData.predictionId));

		return new Response('Successfully deleted Prediction', { status: 200 });
	} catch (error) {
		console.error('Failed to delete Prediction: ', error);
		return new Response('Failed to delete Prediction', { status: 500 });
	}
}
