import { db } from '@/lib/db';
import { and } from 'drizzle-orm';
import { predictionTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ predictionId: string }> },
) {
	try {
		const profile = await authenticateUser();
		if (!profile) return new Response('Unauthenticated', { status: 401 });

		const { predictionId } = await params;
		const { hide } = await request.json();

		await db
			.update(predictionTable)
			.set({ hide })
			.where(and(eq(predictionTable.id, predictionId), eq(predictionTable.profileId, profile.id!)));

		return new Response(JSON.stringify({ message: 'Prediction hidden successfully' }), {
			status: 200,
		});
	} catch (error) {
		console.error('Error hiding prediction:', error);
		return new Response(JSON.stringify({ message: 'Failed to hide prediction' }), { status: 500 });
	}
}
