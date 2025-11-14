import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const profileTable = pgTable("profile", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 512 }),
});