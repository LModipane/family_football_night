import { db } from '@/lib/db';
import { Match, MatchEvent, SummaryItem } from '@/types';
import { matchEventTable } from './db/schema';

export default async function getFixtures(leagueTagId: string) {
	try {
		const response = await fetch(
			`https://supersport.com/apix/football/v5.1/feed/score/summary?top=${20}&eventStatusIds=1,2&entityTagIds=${leagueTagId}&startDate=1723327200&orderAscending=true&region=za&platform=indaleko-web`,
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
		const data = (await response.json()) as { Summary: SummaryItem[] };
		const fixtures: MatchEvent[] = data.Summary.map((item: SummaryItem) => ({
			id: String(item.eventId),
			matchStatus: item.status.name,
			homeTeamName: item.teams.home.name,
			awayTeamName: item.teams.away.name,
			kickOff: new Date(item.eventDateEnd),
			isKnockoutStage: item.isKnockoutFixture,
			awayTeamBadgeUrl: `https://images.supersport.com${item.teams.away.icon}`,
			homeTeamBadgeUrl: `https://images.supersport.com${item.teams.home.icon}`,
		}));

		await db.insert(matchEventTable).values(fixtures).onConflictDoNothing();

		return fixtures;
	} catch (error) {
		console.error('Failed to fetch fixtures', error);
		return null;
	}
}
