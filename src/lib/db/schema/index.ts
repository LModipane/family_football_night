import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const profileTable = pgTable("profile", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    image: varchar("image", { length: 512 }),
});