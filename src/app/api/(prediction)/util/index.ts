type WinningSide = 'home' | 'away' | 'draw';

export function determineWinningSide(data: {
    awayTeamScore: number;
	homeTeamScore: number;
	winningSide?: WinningSide;
}): WinningSide {
	if (data.winningSide) return data.winningSide;
	if (data.awayTeamScore > data.homeTeamScore) return 'away';
	if (data.awayTeamScore < data.homeTeamScore) return 'home';
	return 'draw';
}
