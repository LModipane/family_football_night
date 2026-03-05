import { createInsertSchema } from 'drizzle-zod';
import { groupTable, predictionTable } from '@/lib/db/schema';

export const createGroupSchema = createInsertSchema(groupTable);
export const createPredictionSchema = createInsertSchema(predictionTable, {
	awayTeamScore: schema => schema.min(0, { error: 'Invalid Score' }),
	homeTeamScore: schema => schema.min(0, { error: 'Invalid Score' }),
}).omit({ profileId: true });
