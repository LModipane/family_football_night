import { db } from '@/lib/db';
import { and, eq, not, sql } from 'drizzle-orm';
import { SummaryItem, fixturesWithLiveScore } from '@/types';
import { leagueTable, matchEventTable } from './db/schema';

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
		const isOffSeason = response.status === 204;

		await db
			.update(leagueTable)
			.set({ isOffSeason })
			.where(
				and(
					eq(leagueTable.id, leagueTagId),
					not(eq(leagueTable.isOffSeason, isOffSeason)), // Only write if value changes
				),
			);

		if (isOffSeason || response.status !== 200) return [];

		const data = (await response.json()) as { Summary: SummaryItem[] };
		const fixtures: fixturesWithLiveScore[] = data.Summary.map((item: SummaryItem) => ({
			leagueTagId,
			venue: item.venueName,
			id: String(item.eventId),
			matchStatus: item.status.name,
			homeTeamName: item.teams.home.name,
			awayTeamName: item.teams.away.name,
			kickOff: new Date(item.eventDateStart),
			isKnockoutStage: item.isKnockoutFixture,
			awayTeamLiveScore: item.score.total.away,
			homeTeamLiveScore: item.score.total.home,
			// Add end of match, match status,
			awayTeamBadgeUrl: `https://images.supersport.com${item.teams.away.icon}`,
			homeTeamBadgeUrl: `https://images.supersport.com${item.teams.home.icon}`,
		}));

		await db
			.insert(matchEventTable)
			.values(fixtures)
			.onConflictDoUpdate({
				// 1. Specify the unique column or constraint that causes the conflict
				target: matchEventTable.id,

				// 2. Define which columns to overwrite with the new data
				set: {
					kickOff: sql`EXCLUDED.kick_off`,
					venue: sql`EXCLUDED.match_venue`,
					// status: sql`EXCLUDED.status`,
					// Add any other fields you want updated on conflict
				},
			});

		return fixtures;
	} catch (error) {
		console.error('Failed to fetch fixtures', error);
		return [];
	}
}
