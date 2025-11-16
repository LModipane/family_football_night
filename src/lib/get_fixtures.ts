import { Match, SummaryItem } from '@/types';

export default async function getFixtures() {
	try {
		const response = await fetch(
			`https://supersport.com/apix/football/v5.1/feed/score/summary?top=${20}&eventStatusIds=1,2&entityTagIds=${'7cd3e304-f089-436f-85e0-135114525b9e'}&startDate=1723327200&orderAscending=true&region=za&platform=indaleko-web`,
			{
				headers: {
					'accept': 'application/json',
					'accept-language': 'en-US,en;q=0.9',
					'sec-ch-ua': '"Opera GX";v="109", "Not:A-Brand";v="8", "Chromium";v="123"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-platform': '"Windows"',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-origin',
				},
				referrerPolicy: 'strict-origin-when-cross-origin',
				body: null,
				method: 'GET',
				mode: 'cors',
				credentials: 'include',
			},
		);
		const data = await response.json() as { Summary: SummaryItem[] };
		const fixtures: Match[] = data.Summary.map((item: SummaryItem) => ({
			id: item.eventId,
			date: item.eventDateEnd,
			matchStatus: item.status.name,
			homeTeamName: item.teams.home.name,
			awayTeamName: item.teams.away.name,
			homeTeamScore: item.score.total.home,
			awayTeamScore: item.score.total.away,
			isKnockoutStage: item.isKnockoutFixture,
			awayTeamBadgeUrl: `https://images.supersport.com${item.teams.away.icon}`,
			homeTeamBadgeUrl: `https://images.supersport.com${item.teams.home.icon}`,
		}));
		return fixtures;
	} catch (error) {
		console.error('Failed to fetch fixtures', error);
		return [];
	}
}