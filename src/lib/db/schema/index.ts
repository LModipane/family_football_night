import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, integer, timestamp, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';

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

export const predictionTable = pgTable(
	'prediction',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		profileId: uuid('profile_id').notNull(),
		status: predictionStatusEnum('status').default('unsettled').notNull(),
		matchEventId: varchar('match_event_id', { length: 128 }).notNull(),
		homeTeamScore: integer('home_team_score').notNull(),
		awayTeamScore: integer('away_team_score').notNull(),
		homeTeamName: varchar('home_team_name', { length: 128 }).notNull(),
		awayTeamName: varchar('away_team_name', { length: 128 }).notNull(),
		homeTeamBadgeUrl: varchar('home_team_badge_url', { length: 512 }).notNull(),
		awayTeamBadgeUrl: varchar('away_team_badge_url', { length: 512 }).notNull(),
		createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
		updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
	},
	table => ({
		matchIdx: index('prediction_match_idx').on(table.matchEventId),
		statusIdx: index('prediction_status_idx').on(table.status),
		uniqPrediction: uniqueIndex('uniq_prediction_profile_match').on(
			table.profileId,
			table.matchEventId,
		),
	}),
);

export const predictionRelations = relations(predictionTable, ({ one }) => ({
	profile: one(profileTable, {
		fields: [predictionTable.profileId],
		references: [profileTable.id],
	}),
}));

export const matchResultTable = pgTable(
	'match_result',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		profileId: uuid('profile_id').notNull(),
		matchEventId: varchar('match_event_id', { length: 128 }).notNull(),
		point: integer('point').default(0).notNull(),
		homeTeamScoreResult: integer('home_team_score_result').notNull(),
		awayTeamScoreResult: integer('away_team_score_result').notNull(),
		homeTeamScorePrediction: integer('home_team_score_prediction').notNull(),
		awayTeamScorePrediction: integer('away_team_score_prediction').notNull(),
		homeTeamBadgeUrl: varchar('home_team_badge_url', { length: 512 }).notNull(),
		awayTeamBadgeUrl: varchar('away_team_badge_url', { length: 512 }).notNull(),
		createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
		updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
	},
	table => ({
		/**
		 * 🔐 Idempotency guarantee
		 * Cron can run multiple times safely
		 */
		matchIdx: index('match_result_match_idx').on(table.matchEventId),
		profileIdx: index('match_result_profile_idx').on(table.profileId),
		uniqResult: uniqueIndex('uniq_result_profile_match').on(table.profileId, table.matchEventId),
	}),
);


export const matchResultRelation = relations(matchResultTable, ({ one }) => ({
	profile: one(profileTable, {
		fields: [matchResultTable.profileId],
		references: [profileTable.id],
	}),
}));
