import { db } from '@/lib/db';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getFixtures } from '@/lib';
import { desc, eq, sql } from 'drizzle-orm';
import { redirect, RedirectType } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Diff, EllipsisVertical, Minus, Plus } from 'lucide-react';
import { isUserAuthenticated } from '@/lib/nextAuth/is_user_authenticated';
import { LeaderBoard, PredictionWithProfileMatchEvent, ResultTableElement } from '@/types';
import { matchResultTable, profileTable, predictionTable, matchEventTable } from '@/lib/db/schema';

import {
	Accordion,
	AccordionItem,
	AccordionContent,
	AccordionTrigger,
} from '@/components/ui/accordion';

import {
	GroupHeader,
	FixturesCarousel,
	FilteredPredictionCards,
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

export const revalidate = 0;

export default async function Home({ params }: { params: Promise<{ groupId: string }> }) {
	const profile = await isUserAuthenticated();
	if (!profile) return redirect('/landing', RedirectType.replace);

	const { groupId } = await params;

	const group = await db.query.groupTable.findFirst({
		where: (table, { eq }) => eq(table.id, groupId),
		with: { leagues: true },
	});
	if (!group) throw new Error('Group Is Not Found');

	const isMember = await db.query.groupProfileTable.findFirst({
		where: (table, { eq, and }) =>
			and(eq(table.profileId, profile.id!), eq(table.groupId, groupId)),
	});
	if (!isMember)
		throw new Error('You are not a group member, Please ask for group Admin for invite Code!!!');

	const targetLeague = group.leagues[0].leagueId;

	const fixtures = await getFixtures(targetLeague);
	if (!fixtures) throw new Error('Failed to load fixtures');

	const predictions: PredictionWithProfileMatchEvent[] = await db.query.predictionTable.findMany({
		with: { profile: true, matchEvent: true },
		columns: {
			id: true,
			matchEventId: true,
			awayTeamScore: true,
			homeTeamScore: true,
		},
		where: (table, { eq, and }) => and(eq(table.status, 'unsettled'), eq(table.groupId, groupId)),
	});

	const totalScore = sql<number>`sum(${matchResultTable.point})`;

	const leaderboard = await db
		.select({
			profileId: matchResultTable.profileId,
			name: profileTable.name,
			imageUrl: profileTable.imageUrl,
			score: totalScore.as('score'),

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

		.innerJoin(profileTable, eq(matchResultTable.profileId, profileTable.id))

		// 🎯 scope to specific group
		.where(eq(predictionTable.groupId, groupId))

		.groupBy(matchResultTable.profileId, profileTable.name, profileTable.imageUrl)

		.orderBy(desc(totalScore));

	return (
		<main className="h-full w-full flex flex-col-reverse sm:flex-row overflow-scroll">
			<section className="bg-purple-900 h-full sm:max-w-[35%] flex-1 p-2 text-white flex flex-col gap-4">
				<PredictionContextProvider fixtures={fixtures}>
					<FixturesCarousel fixtures={fixtures} />
					<CreatePredictionModelButton
						fixtures={fixtures}
						groupId={groupId}
						leagueTagId={targetLeague}
					/>

					{/* Prediction Cards: */}
					{predictions && predictions.length !== 0 ? (
						<FilteredPredictionCards predictions={predictions} />
					) : (
						<div className="">Be the first to predict</div>
					)}
				</PredictionContextProvider>
			</section>
			{/* <div className="bg-blue-950 h-full w-full  text-white p-10 ">Chat</div> */}
			<section className="bg-blue-950 h-full w-full text-white flex flex-col gap-4 justify-start items-center">
				<GroupHeader
					name={group.name}
					groupId={group.id}
					imageUrl={group.imageUrl}
					inviteCode={group.inviteCode}
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
		<div className="relative flex flex-col w-full h-full p-2 pl-5 sm:px-10">
			<div className="absolute -right-3 z-10 mr-4 -top-2">
				<h2 className="font-extrabold text-white text-[17px] uppercase stroke-colour">
					Leaderboard
				</h2>
			</div>
			{leaderboard && leaderboard.length !== 0 ? (
				<ScrollArea className="flex flex-col justify-center items-center w-full h-full">
					{leaderboard.map((player, index) =>
						index === 0 ? (
							<LeaderPlace key={player.profileId} player={player} />
						) : (
							<FollowingPlace key={player.profileId} player={player} index={index} />
						),
					)}
				</ScrollArea>
			) : (
				<div className="flex justify-center items-center w-full h-full">
					<h2 className="text-white text-lg">No score yet. Be the first to get on the board!</h2>
				</div>
			)}
		</div>
	);
};

type LeaderPlaceProps = {
	player: LeaderBoard[number];
};

const LeaderPlace = async ({ player }: LeaderPlaceProps) => {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="Leader Place" className="w-full">
				<AccordionTrigger className="sm:w-full h-17.5 flex justify-between items-center bg-blue-700 text-left text-white font-bold">
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
				<AccordionContent className="w-full sm:max-w-[90%] max-w-[98%] mx-auto text-white">
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
				<AccordionContent className="w-full sm:max-w-[95%]  mx-auto text-white">
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
		<Table className="bg-blue-900 p-4 text-white ">
			<TableHeader>
				<TableRow className="flex items-center justify-end h-10 hover:bg-blue-800 border-b-2 border-slate-400">
					<TableHead className="border-[1.5px] border-slate-500 sm:w-14 w-5 h-10 flex justify-center items-center text-white ">
						# <span className="hidden sm:block">Pos</span>
					</TableHead>
					<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-[70px] flex justify-center items-center text-white">
						Match
					</TableHead>
					<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-[40px] flex justify-center items-center text-white">
						Result
					</TableHead>
					<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-[70px] flex justify-center items-center text-white truncate">
						Prediction
					</TableHead>
					<TableHead className="border-[1.5px] border-slate-500 flex-1 h-10 flex justify-center items-center text-white">
						Points
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{results.map((result, index) => (
					<TableRow
						key={result.id}
						className="flex items-center justify-start h-10 hover:bg-blue-800 border-b-[1.5px] border-slate-400">
						<TableCell className="border-[1.5px] border-slate-500 sm:w-14 w-5 h-10 flex justify-center items-center">
							<span>{++index}</span>
						</TableCell>
						<TableCell className="border-[1.5px] border-slate-500 flex-1 h-10 w-[70px] flex justify-center items-center sm:gap-x-1">
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
						<TableCell className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-[40px]  flex justify-center items-center">
							<span className="text-lg">{result.homeTeamScoreResult}</span>
							<div className="flex justify-center items-center">
								<EllipsisVertical className="h-3 w-3" />
							</div>
							<span className="text-lg">{result.awayTeamScoreResult}</span>
						</TableCell>
						<TableCell className="border-[1.5px] border-slate-500 flex-1 h-10 min-w-[70px] flex justify-center items-center">
							<span className="text-lg">{result.homeTeamScorePrediction}</span>
							<div className="flex justify-center items-center">
								<EllipsisVertical className="h-3 w-3" />
							</div>
							<span className="text-lg">{result.awayTeamScorePrediction}</span>
						</TableCell>
						{/* <TableCell
                                className={cn(
                                    'w-[17%] h-10 flex justify-center items-center',
                                    fouls < 0 ? 'text-slate-500' : 'text-gray-500',
                                )}>
                                {fouls > 0 ? (
                                    <span>NA</span>
                                ) : fouls < 0 ? (
                                    <Minus className="h-4 w-4" />
                                ) : (
                                    <Diff className="h-4 w-4" />
                                )}
                                {fouls <= 0 ? <span className="text-lg">{Math.abs(fouls)}</span> : <></>}
                            </TableCell> */}
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
		</Table>
	);
};
