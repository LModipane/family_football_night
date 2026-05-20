import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { PredictionSchema } from '@/types/formSchema';
import { predictionTable } from '@/lib/db/schema';

export async function PUT(req: Request) {
	try {
		const body = await req.json();
        const parsedData = PredictionSchema.parse(body);
        
		if (!parsedData.predictionId)
			throw new Error('Prediction ID is required for editing prediction');

		await db
			.update(predictionTable)
			.set(parsedData)
            .where(eq(predictionTable.id, parsedData.predictionId));
        
		return new Response(`Success`, { status: 200 });
	} catch (error) {
		console.error('Failed To Edit Prediction!!!:', error);
		return new Response('Opps, Failed to Edit Prediction', { status: 500 });
	}
}
