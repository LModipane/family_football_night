import * as z from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { groupTable, predictionTable } from '@/lib/db/schema';

// ✅ Centralized form schemas for validation and type inference
export const createGroupSchema = createInsertSchema(groupTable);
export const PredictionSchema = createInsertSchema(predictionTable, {
	awayTeamScore: schema => schema.min(0, { error: 'Invalid Score' }),
	homeTeamScore: schema => schema.min(0, { error: 'Invalid Score' }),
}).omit({ profileId: true }).extend({
	// predictionId: z.string().optional(), // For edit mode, we need prediction id
});

// For adding leagues to group, we need to validate the selected league ids and group id
export const addLeagueSchema = z.object({
	leagueIds: z.array(z.string()).min(1, { message: 'Select at least one league' }),
	groupId: z.string(),
});
