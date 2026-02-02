import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const profileTable = pgTable('profile', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: varchar('user_id', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	imageUrl: varchar('image_url', { length: 512 }),
	createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
	updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
});

export const predictionStatusEnum = pgEnum('prediction_status', ['settled', 'unsettled', 'review']);

export const predictionTable = pgTable('prediction', {
	id: uuid('id').primaryKey().defaultRandom(),
	status: predictionStatusEnum('status').default('unsettled'),
	profileId: uuid('profile_id').notNull(),
	matchEventId: varchar('match_event_id').notNull(),
	homeTeamScore: integer('home_team_core').notNull(),
	awayTeamScore: integer('away_team_score').notNull(),
	homeTeamName: varchar('home_team_name').notNull(),
	awayTeamName: varchar('away_team_name').notNull(),
	homeTeamBadgeUrl: varchar('home_team_badge_url').notNull(),
	awayTeamBadgeUrl: varchar('away_team_badge_url').notNull(),
	createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
	updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
});

export const predictionTableRelations = relations(predictionTable, ({ one }) => ({
	profile: one(profileTable, {
		fields: [predictionTable.profileId],
		references: [profileTable.id],
	}),
}));
