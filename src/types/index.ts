import { InferInsertModel } from 'drizzle-orm';
import { profileTable, predictionTable, matchResultTable, matchEventTable } from '@/lib/db/schema';

export type Profile = InferInsertModel<typeof profileTable>;
export type Prediction = InferInsertModel<typeof predictionTable>;
export type MatchEvent = InferInsertModel<typeof matchEventTable>;
export type MatchResult = InferInsertModel<typeof matchResultTable>;

export type PredictionWithProfileMatchEvent = {
	id: string;
	matchEventId: string;
	homeTeamScore: number;
	awayTeamScore: number;
	profile: {
		id: string;
		name: string;
		imageUrl: string | null;
	};
	matchEvent: MatchEvent;
};

export type LeaderBoard = {
	profileId: string;
	name: string;
	imageUrl: string | null;
	score: number;
	results: ResultTableElement[] | null;
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

export type ResultTableElement = {
	id: string;
	point: number;

	homeTeamScoreResult: number;
	awayTeamScoreResult: number;

	homeTeamScorePrediction: number;
	awayTeamScorePrediction: number;

	homeTeamBadgeUrl: string;
	awayTeamBadgeUrl: string;
};

export type SummaryItem = {
	eventId: number;
	eventDateStart: string;
	status: { name: string };
	isKnockoutFixture: boolean;
	teams: {
		home: { name: string; icon: string };
		away: { name: string; icon: string };
	};
};
