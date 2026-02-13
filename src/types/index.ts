import { InferInsertModel } from 'drizzle-orm';
import { profileTable, predictionTable, matchResultTable } from '@/lib/db/schema';

type Profile = InferInsertModel<typeof profileTable>;
export type Prediction = InferInsertModel<typeof predictionTable>;
export type MatchResult = InferInsertModel<typeof matchResultTable>;

export type PredictionWithProfile = { profile: Profile } & Prediction;
export type LeaderBoard = {
	profileId: string;
	name: string;
	imageUrl: string | null;
	score: number;
	results: MatchResult[] | null;
}[];

export type Match = {
	id: number;
	date: string;
	matchStatus: string;
	homeTeamName: string;
	awayTeamName: string;
	isKnockoutStage: boolean;
	awayTeamBadgeUrl: string;
	homeTeamBadgeUrl: string;
};

export type SummaryItem = {
	eventId: number;
	eventDateEnd: string;
	status: { name: string };
	isKnockoutFixture: boolean;
	teams: {
		home: { name: string; icon: string };
		away: { name: string; icon: string };
	};
};
