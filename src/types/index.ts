export type Match = {
	date: string;
	matchStatus: string;
	homeTeamName: string;
	awayTeamName: string;
	homeTeamScore: number | null;
	awayTeamScore: number | null;
	isKnockoutStage: boolean;
	awayTeamBadgeUrl: string;
	homeTeamBadgeUrl: string;
};

export type SummaryItem = {
	eventDateEnd: string;
	status: { name: string };
	teams: {
		home: { name: string; icon: string };
		away: { name: string; icon: string };
	};
	score: { total: { home: number | null; away: number | null } };
	isKnockoutFixture: boolean;
};
