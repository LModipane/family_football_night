import { db } from '@/lib/db';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getFixtures } from '@/lib';
import { desc, eq, sql, and } from 'drizzle-orm';
import { redirect, RedirectType } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeaderBoard, ResultTableElement } from '@/types';
import { Diff, EllipsisVertical, Minus, Plus } from 'lucide-react';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';
import { matchResultTable, profileTable, predictionTable, matchEventTable } from '@/lib/db/schema';

import {
	Accordion,
	AccordionItem,
	AccordionContent,
	AccordionTrigger,
} from '@/components/ui/accordion';

import {
	GroupHeader,
	PredictionCards,
	FixturesCarousel,
	PredictionContextProvider,
	CreatePredictionModelButton,
} from '@/components';

import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from '@/components/ui/table';

export const revalidate = 5;

export default async function Home({
	params,
	searchParams,
}: {
	params: Promise<{ groupId: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	// 1) Check if user is authenticated:
	const profile = await authenticateUser();
	if (!profile) return redirect('/landing', RedirectType.replace);

	// 2) Parallise request params:
	const [{ groupId }, { leagueId }] = await Promise.all([params, searchParams]);

	// 3) Check if user is member and fetch essential group details:
	const userGroupMembership = await db.query.groupProfileTable.findFirst({
		where: (table, { eq, and }) =>
			and(eq(table.profileId, profile.id!), eq(table.groupId, groupId)),
		with: {
			group: {
				with: {
					leagues: {
						with: { league: { columns: { id: true, name: true, iconUrl: true } } },
						columns: { leagueId: true },
					},
				},
			},
		},
	});
	if (!userGroupMembership)
		throw new Error('You are not a group member, Please ask for group Admin for invite Code!!!');

	const currentGroup = userGroupMembership.group;
	if (!currentGroup) throw new Error('Group Is Not Found');
	if (currentGroup.leagues.length === 0)
		throw new Error(
			'No league is associated with this group. Please ask for group Admin to add league!!!',
		);

	const targetLeagueId = leagueId?.toString() || currentGroup.leagues[0].leagueId; // rrefactor to select recent viewed legaue
	const isLeagueValid = currentGroup.leagues.some(obj => obj.leagueId === targetLeagueId);
	if (!isLeagueValid) throw new Error('Invalid league ID context for this group.');

	// 5) Run remaining tasks concurrently
	const otherGroupsPromise = db.query.groupProfileTable
		.findMany({
			where: (table, { eq, not, and }) =>
				and(eq(table.profileId, profile.id!), not(eq(table.groupId, groupId))),
			with: { group: { columns: { name: true, id: true, imageUrl: true } } },
			columns: { role: false, profileId: false, groupId: false },
		})
		.then(res => res.map(item => item.group));

	const fixturesPromise = getFixtures(targetLeagueId);

	const predictionsPromise = db.query.predictionTable.findMany({
		with: { profile: true, matchEvent: true },
		where: (table, { eq, and }) => and(eq(table.status, 'unsettled'), eq(table.groupId, groupId)),
	});

	const totalScore = sql<number>`sum(${matchResultTable.point})`;
	const leaderboardPromise = db
		.select({
			// 📊 Basic user profile mapping for the leaderboard row
			profileId: matchResultTable.profileId,
			name: profileTable.name,
			imageUrl: profileTable.imageUrl,

			// 🧮 Aggregate total calculated score for this user
			score: totalScore.as('score'),

			// 🛠️ Advanced JSON aggregation to pack all historic match data into a single array per user
			results: sql<ResultTableElement[]>`
						json_agg(
							json_build_object(
							'id', ${matchResultTable.id},
							'point', ${matchResultTable.point},

							-- ✅ actual result
							'homeTeamScoreResult', ${matchResultTable.homeTeamScoreResult},
							'awayTeamScoreResult', ${matchResultTable.awayTeamScoreResult},

							-- ✅ prediction score (from prediction table)
							'homeTeamScorePrediction', ${predictionTable.homeTeamScore},
							'awayTeamScorePrediction', ${predictionTable.awayTeamScore},

							-- ✅ badge URLs (from match_event table)
							'homeTeamBadgeUrl', ${matchEventTable.homeTeamBadgeUrl},
							'awayTeamBadgeUrl', ${matchEventTable.awayTeamBadgeUrl},

							'createAt', ${matchResultTable.createAt}
							)
							ORDER BY ${matchResultTable.createAt} DESC
						)
						`.as('results'),
		})

		.from(matchResultTable)
		// 🔗 join prediction (needed for group + prediction scores)
		.innerJoin(predictionTable, eq(matchResultTable.predictionId, predictionTable.id))
		// 🔗 join match_event (needed for badge URLs)
		.innerJoin(matchEventTable, eq(matchResultTable.matchEventId, matchEventTable.id))
		// 🔗 Join profile table (Required to match the score results back to a human name and avatar)
		.innerJoin(profileTable, eq(matchResultTable.profileId, profileTable.id))
		// 🎯 scope to specific group aand league
		.where(
			and(eq(predictionTable.groupId, groupId), eq(matchEventTable.leagueTagId, targetLeagueId)),
		)
		// 👥 Group by user identity fields so the sum() and json_agg() calculations execute cleanly per person
		.groupBy(matchResultTable.profileId, profileTable.name, profileTable.imageUrl)
		// 🏆 Rank the leaderboard with the highest total scores placed at the top
		.orderBy(desc(totalScore));

	//
	const [otherGroups, fixtures, predictions, leaderboard] = await Promise.all([
		otherGroupsPromise,
		fixturesPromise,
		predictionsPromise,
		leaderboardPromise,
	]);

	const userPredictions = predictions.filter(p => p.profile.id === profile.id!);
	const currentLeagueName =
		currentGroup.leagues.find(obj => obj.leagueId === targetLeagueId)?.league.name ?? 'league';

	return (
		<main className="h-full w-full flex flex-col-reverse sm:flex-row">
			<section className="bg-purple-900 h-full md:max-w-[35%] min-w-87.5 min-h-80 p-2 text-white flex flex-col gap-4 flex-1">
				<PredictionContextProvider fixtures={fixtures}>
					<FixturesCarousel fixtures={fixtures} leagueName={currentLeagueName} />
					<CreatePredictionModelButton
						groupId={groupId}
						fixtures={fixtures}
						leagueTagId={targetLeagueId}
						userPredictions={userPredictions}
					/>

					{/* Prediction Cards: */}
					{predictions && predictions.length !== 0 ? (
						<PredictionCards
							groupId={groupId}
							predictions={predictions}
							currentProfileId={profile.id!}
						/>
					) : (
						<div className="">Be the first to predict</div>
					)}
				</PredictionContextProvider>
			</section>
			{/* <div className="bg-blue-950 h-full w-full  text-white p-10 ">Chat</div> */}
			<section className="bg-blue-950 h-full min-w-87.5 text-white flex flex-col flex-1 gap-4 justify-start items-center overflow-y-scroll no-scrollbar">
				<GroupHeader
					currentLegaueId={targetLeagueId}
					name={currentGroup.name}
					groupId={currentGroup.id}
					otherGroups={otherGroups}
					imageUrl={currentGroup.imageUrl}
					inviteCode={currentGroup.inviteCode}
					leagues={currentGroup.leagues.map(item => item.league)}
				/>
				<LeaderTable leaderboard={leaderboard} />
			</section>
		</main>
	);
}

type Props = {
	leaderboard: LeaderBoard;
};

const LeaderTable = ({ leaderboard }: Props) => {
	return (
		<div className="relative flex flex-col w-full h-full p-2 pl-5">
			<div className="absolute -right-3 z-10 mr-4 -top-2">
				<h2 className="font-extrabold text-white text-[17px] uppercase stroke-colour">
					Leaderboard
				</h2>
			</div>
			{leaderboard && leaderboard.length !== 0 ? (
				<div className="flex flex-col justify-start items-center w-full h-full px-4">
					{leaderboard.map((player, index) =>
						index === 0 ? (
							<FirstPlace key={player.profileId} player={player} />
						) : (
							<FollowingPlace key={player.profileId} player={player} index={index} />
						),
					)}
				</div>
			) : (
				<div className="flex justify-center items-center w-full h-full">
					<h2 className="text-white text-lg">No score yet. Be the first to get on the board!</h2>
				</div>
			)}
		</div>
	);
};

type FirstPlaceProps = {
	player: LeaderBoard[number];
};

const FirstPlace = async ({ player }: FirstPlaceProps) => {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="Leader Place" className="w-full">
				<AccordionTrigger className="relative sm:w-full h-17.5 flex justify-between items-center bg-blue-700 text-left text-white font-bold">
					<span className="bg-pink-700 w-8 h-8 z-40 absolute sm:-left-6 -left-4 flex justify-center items-center">
						1
					</span>
					<div className="flex justify-start items-center w-full">
						<div className="absolute -top-2 left-0 sm:ml-3 ml-5 min-h-18 min-w-18">
							<Image
								src={player.imageUrl ?? '/default-profile.png'}
								alt={`${player.name} Image`}
								fill
								className="object-cover"
							/>
						</div>
						<h2 className="ml-25 mr-auto text-start sm:text-xl text-sm flex-1  truncate">
							{player.name}
						</h2>
						<span className="border-r-2 border-white pr-2 text-4xl">{player.score}</span>
					</div>
				</AccordionTrigger>
				<AccordionContent className="w-full h-full sm:max-w-[90%] max-w-[98%] mx-auto text-white">
					{player.results && player.results.length !== 0 ? (
						<ResultTable results={player.results} />
					) : (
						<div className="text-center text-white">No results yet.</div>
					)}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

type FollowingPlaceProps = {
	player: LeaderBoard[number];
	index: number;
};

const FollowingPlace = async ({ player, index }: FollowingPlaceProps) => {
	return (
		<Accordion type="single" collapsible className="sm:w-[95%] w-[98%] mx-auto">
			<AccordionItem value="Following Place" className="w-full">
				<AccordionTrigger className="relative bg-blue-800 justify-start items-center rounded-tl-md ">
					<div
						className={cn(
							'absolute top-0 left-0 flex items-center justify-center w-5 h-5 p-2 bg-pink-700 ',
							index === 1 ? 'rounded-tl-md' : '',
						)}>
						<span className="text-xs">{++index}</span>
					</div>
					<div className="flex justify-start items-center gap-x-2 w-full">
						<div className="relative ml-7 min-h-10 min-w-10 ">
							<Image
								src={player.imageUrl ?? '/default-profile.png'}
								alt={`${player.name} Image`}
								fill
								className="border-2 rounded-full border-slate-600"
							/>
						</div>
						<div className="flex items-center justify-between w-full">
							<h3 className="sm:text-lg text-sm text-start flex-1 truncate">{player.name}</h3>
							<span className="border-r-2 border-white pr-2 text-3xl">{player.score}</span>
						</div>
					</div>
				</AccordionTrigger>
				<AccordionContent className="w-full h-full mx-auto text-white ">
					{player.results && player.results.length !== 0 ? (
						<ResultTable results={player.results} />
					) : (
						<div className="text-center text-white">No results yet.</div>
					)}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

type ResultTableProps = {
	results: ResultTableElement[];
};

const ResultTable = ({ results }: ResultTableProps) => {
	return (
			<Table className="bg-blue-900 p-4 text-white w-full h-fit">
				<TableHeader className="h-full">
					<TableRow className="flex items-center justify-end h-10  hover:bg-blue-800 border-b-2 border-slate-400">
						<TableHead className="border-[1.5px] border-slate-500 sm:w-14 w-5 h-10 flex justify-center items-center text-white ">
							# <span className="hidden sm:block">Pos</span>
						</TableHead>
						<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-17.5 flex justify-center items-center text-white">
							Match
						</TableHead>
						<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-10 flex justify-center items-center text-white">
							Result
						</TableHead>
						<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-17.5 flex justify-center items-center text-white truncate">
							Prediction
						</TableHead>
						<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 flex justify-center items-center text-white">
							Points
						</TableHead>
					</TableRow>
				</TableHeader>
				<ScrollArea className="h-fit md:max-h-[25vh] max-h-[15vh] overflow-y-scroll no-scrollbar">
					<TableBody>
						{results.map((result, index) => (
							<TableRow
								key={result.id}
								className="flex items-center justify-start h-10 hover:bg-blue-800 border-b-[1.5px] border-slate-400">
								<TableCell className="border-[1.5px] border-slate-500 sm:w-14 w-5 h-10 flex justify-center items-center">
									<span>{results.length - index }</span>
								</TableCell>
								<TableCell className="border-[1.5px] border-slate-500 flex-1 h-10 w-17.5` flex justify-center items-center sm:gap-x-1">
									<div className="relative min-w-6 min-h-6">
										<Image
											src={result.homeTeamBadgeUrl}
											alt="home-team-logo"
											fill
											className="object-fit"
										/>
									</div>
									<div className="flex justify-center items-center">
										<EllipsisVertical className="h-3 w-3" />
									</div>
									<div className="relative min-w-6 min-h-6">
										<Image
											src={result.awayTeamBadgeUrl}
											alt="home-team-logo"
											fill
											className="object-fit"
										/>
									</div>
								</TableCell>
								<TableCell className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-10  flex justify-center items-center">
									<span className="text-lg">{result.homeTeamScoreResult}</span>
									<div className="flex justify-center items-center">
										<EllipsisVertical className="h-3 w-3" />
									</div>
									<span className="text-lg">{result.awayTeamScoreResult}</span>
								</TableCell>
								<TableCell className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-17.5 flex justify-center items-center">
									<span className="text-lg">{result.homeTeamScorePrediction}</span>
									<div className="flex justify-center items-center">
										<EllipsisVertical className="h-3 w-3" />
									</div>
									<span className="text-lg">{result.awayTeamScorePrediction}</span>
								</TableCell>
								<TableCell
									className={cn(
										'border-[1.5px] border-slate-500 flex-1 h-10 flex justify-center items-center',
										result.point! > 0
											? 'text-green-500'
											: result.point! < 0
												? 'text-red-500'
												: 'text-gray-500',
									)}>
									{result.point! > 0 ? <Plus className="h-4 w-4" /> : <></>}
									{result.point! < 0 ? <Minus className="h-4 w-4" /> : <></>}
									{result.point === 0 ? <Diff className="h-4 w-4" /> : <></>}
									<span className="text-lg">{Math.abs(result.point!)}</span>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</ScrollArea>
			</Table>
	);
};
