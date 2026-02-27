import { createInsertSchema } from 'drizzle-zod';
import { groupTable } from '@/lib/db/schema';

export const createGroupSchema = createInsertSchema(groupTable);