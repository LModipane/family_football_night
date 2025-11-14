import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const profile = pgTable("profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).notNull(),
});