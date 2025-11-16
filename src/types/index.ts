export type Match = {
	id: number;
	date: string;
	matchStatus: string;
	homeTeamName: string;
	awayTeamName: string;
	isKnockoutStage: boolean;
	awayTeamBadgeUrl: string;
	homeTeamBadgeUrl: string;
	homeTeamScore: number;
	awayTeamScore: number;
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
	score: { total: { home: number; away: number } };
};
