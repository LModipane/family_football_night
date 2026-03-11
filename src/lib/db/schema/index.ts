import { relations } from 'drizzle-orm';

import {
	uuid,
	index,
	pgEnum,
	pgTable,
	integer,
	varchar,
	boolean,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core';

export const profileTable = pgTable('profile', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: varchar('user_id', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	imageUrl: varchar('image_url', { length: 512 }),
	createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
	updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
});

export const profileRelations = relations(profileTable, ({ many }) => ({
	groups: many(groupProfileTable),
	predictions: many(predictionTable),
}));

export const leagueCategoryEnum = pgEnum('league_category', [
	'local',
	'european',
	'african',
	'international',
]);

export const leagueTable = pgTable('leauge', {
	id: uuid('id').primaryKey().defaultRandom(),
	iconUrl: varchar('icon_url', { length: 512 }),
	isOffSeason: boolean('is_off_season').default(false),
	name: varchar('name', { length: 255 }).notNull().unique(),
	category: leagueCategoryEnum('category').default('international').notNull(),
	createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
	updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
});

export const leagueRelations = relations(leagueTable, ({ many }) => ({
	events: many(matchEventTable),
	groups: many(groupLeagueTable),
}));

export const groupLeagueTable = pgTable('group_league', {
	id: uuid('id').primaryKey().defaultRandom(),
	groupId: uuid('group_id')
		.notNull()
		.references(() => groupTable.id, { onDelete: 'cascade' }),
	leagueId: uuid('league_id')
		.notNull()
		.references(() => leagueTable.id, { onDelete: 'cascade' }),
	createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
	updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
});

export const groupLeagueRelation = relations(groupLeagueTable, ({ one }) => ({
	groups: one(groupTable, { fields: [groupLeagueTable.groupId], references: [groupTable.id] }),
	leagues: one(leagueTable, { fields: [groupLeagueTable.leagueId], references: [leagueTable.id] }),
}));

export const groupTable = pgTable('group', {
	id: uuid('id').primaryKey().defaultRandom(),
	imageUrl: varchar('image_url', { length: 512 }),
	name: varchar('name', { length: 255 }).notNull(),
	inviteCode: uuid('invite_code').notNull().defaultRandom(),
	createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
	updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
});

export const groupRelations = relations(groupTable, ({ many }) => ({
	leagues: many(groupLeagueTable),
	members: many(groupProfileTable),
	predictions: many(predictionTable),
}));

export const groupMemberRoleEnum = pgEnum('member_role', ['admin', 'moderator', 'player']);

export const groupProfileTable = pgTable(
	'group_profile',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		groupId: uuid('group_id')
			.notNull()
			.references(() => groupTable.id, { onDelete: 'cascade' }),
		profileId: uuid('profile_id')
			.notNull()
			.references(() => profileTable.id, { onDelete: 'cascade' }),
		role: groupMemberRoleEnum('group_role').default('player').notNull(),
		createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
		updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
	},
	table => [uniqueIndex('uniq_group_profile').on(table.groupId, table.profileId)],
);

export const groupProfileRelations = relations(groupProfileTable, ({ one }) => ({
	profile: one(profileTable, {
		fields: [groupProfileTable.profileId],
		references: [profileTable.id],
	}),
	group: one(groupTable, {
		fields: [groupProfileTable.groupId],
		references: [groupTable.id],
	}),
}));

export const matchEventTable = pgTable('match_event', {
	id: varchar('id').primaryKey(),
	leagueTagId: uuid('league_tag_id')
		.notNull()
		.references(() => leagueTable.id, { onDelete: 'cascade' }),
	kickOff: timestamp('kick_off', { mode: 'date' }).notNull(),
	isKnockoutStage: boolean('is_knockout_stage').default(false),
	homeTeamName: varchar('home_team_name', { length: 128 }).notNull(),
	awayTeamName: varchar('away_team_name', { length: 128 }).notNull(),
	homeTeamBadgeUrl: varchar('home_team_badge_url', { length: 512 }).notNull(),
	awayTeamBadgeUrl: varchar('away_team_badge_url', { length: 512 }).notNull(),
	createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
	updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
});

export const matchEventRelation = relations(matchEventTable, ({ one }) => ({
	league: one(leagueTable, {
		fields: [matchEventTable.leagueTagId],
		references: [leagueTable.id],
	}),
}));

export const predictionStatusEnum = pgEnum('prediction_status', ['settled', 'unsettled', 'review']);

export const predictionTable = pgTable(
	'prediction',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		profileId: uuid('profile_id')
			.notNull()
			.references(() => profileTable.id, { onDelete: 'cascade' }),
		groupId: uuid('group_id')
			.notNull()
			.references(() => groupTable.id, { onDelete: 'cascade' }),
		matchEventId: varchar('match_event_id', { length: 128 })
			.notNull()
			.references(() => matchEventTable.id, { onDelete: 'cascade' }),
		leagueTagId: varchar('league_tag_id').notNull(),
		homeTeamScore: integer('home_team_score').notNull(),
		awayTeamScore: integer('away_team_score').notNull(),
		status: predictionStatusEnum('status').default('unsettled').notNull(),
		createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
		updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
	},
	table => [
		index('prediction_match_idx').on(table.matchEventId),
		index('prediction_status_idx').on(table.status),
		uniqueIndex('uniq_prediction_profile_match').on(table.profileId, table.matchEventId),
	],
);

export const predictionRelations = relations(predictionTable, ({ one }) => ({
	profile: one(profileTable, {
		fields: [predictionTable.profileId],
		references: [profileTable.id],
	}),
	group: one(groupTable, {
		fields: [predictionTable.groupId],
		references: [groupTable.id],
	}),
	matchEvent: one(matchEventTable, {
		fields: [predictionTable.matchEventId],
		references: [matchEventTable.id],
	}),
}));

export const matchResultTable = pgTable(
	'match_result',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		profileId: uuid('profile_id')
			.notNull()
			.references(() => profileTable.id, { onDelete: 'cascade' }),
		predictionId: uuid('prediction_id')
			.notNull()
			.references(() => predictionTable.id, { onDelete: 'cascade' }),
		matchEventId: varchar('match_event_id')
			.notNull()
			.references(() => matchEventTable.id, {
				onDelete: 'cascade',
			}),
		point: integer('point').default(0).notNull(),
		homeTeamScoreResult: integer('home_team_score_result').notNull(),
		awayTeamScoreResult: integer('away_team_score_result').notNull(),
		createAt: timestamp('create_at', { mode: 'date' }).defaultNow(),
		updateAt: timestamp('update_at', { mode: 'date' }).defaultNow(),
	},
	table => [index('match_result_prediction_idx').on(table.predictionId)],
);

export const matchResultRelation = relations(matchResultTable, ({ one }) => ({
	profile: one(profileTable, {
		fields: [matchResultTable.profileId],
		references: [profileTable.id],
	}),
	prediction: one(predictionTable, {
		fields: [matchResultTable.predictionId],
		references: [predictionTable.id],
	}),
}));
