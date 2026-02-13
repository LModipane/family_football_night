import { db } from '@/lib/db';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getFixtures } from '@/lib';
import { sql, desc, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth/options';
import { redirect, RedirectType } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { matchResultTable, profileTable } from '@/lib/db/schema';
import { EllipsisVertical, Plus, Minus, Diff } from 'lucide-react';
import { MatchResult, PredictionWithProfile, LeaderBoard } from '@/types';

import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';
import {
	PredictionCard,
	FixturesCarousel,
	PredictionContextProvider,
	CreatePredictionModelButton,
} from '@/components';

export default async function Home() {
	const session = await getServerSession(authOptions);
	if (!session) redirect('/Landing', RedirectType.replace);

	const fixtures = await getFixtures();
	if (!fixtures) throw new Error('Failed to load fixtures');

	const predictions: PredictionWithProfile[] = await db.query.predictionTable.findMany({
		with: { profile: true },
	});

	const totalScore = sql<number>`sum(${matchResultTable.point})`;
	const leaderboard = await db
		.select({
			profileId: matchResultTable.profileId,
			name: profileTable.name,
			imageUrl: profileTable.imageUrl,
			score: totalScore.as('score'),
			results: sql<MatchResult[] | null>`
					json_agg(
						json_build_object(
						'id', ${matchResultTable.id},
						'matchEventId', ${matchResultTable.matchEventId},
						'point', ${matchResultTable.point},
						'homeTeamScoreResult', ${matchResultTable.homeTeamScoreResult},
						'awayTeamScoreResult', ${matchResultTable.awayTeamScoreResult},
						'homeTeamScorePrediction', ${matchResultTable.homeTeamScorePrediction},
						'awayTeamScorePrediction', ${matchResultTable.awayTeamScorePrediction},
						'homeTeamBadgeUrl', ${matchResultTable.homeTeamBadgeUrl},
						'awayTeamBadgeUrl', ${matchResultTable.awayTeamBadgeUrl},
						'createAt', ${matchResultTable.createAt}
						)
					)
					`.as('results'),
		})
		.from(matchResultTable)
		.innerJoin(profileTable, eq(matchResultTable.profileId, profileTable.id))
		.groupBy(matchResultTable.profileId, profileTable.name, profileTable.imageUrl)
		.orderBy(desc(totalScore));

	return (
		<main className="h-full w-full flex">
			<div className="bg-purple-900 h-full max-w-[35%] p-2 text-white sm:flex sm:flex-col hidden border-2 border-gray-300">
				<PredictionContextProvider fixtures={fixtures}>
					<FixturesCarousel fixtures={fixtures} />
					<CreatePredictionModelButton fixtures={fixtures} />

					{/* Prediction Cards: */}
					{predictions && predictions.length !== 0 ? (
						<ScrollArea className="flex flex-col gap-2 flex-1 pr-4 overflow-scroll no-scrollbar">
							{predictions.map(prediction => (
								<PredictionCard key={prediction.id} {...prediction} />
							))}
						</ScrollArea>
					) : (
						<div className="">Be the first to predict</div>
					)}
				</PredictionContextProvider>
			</div>
			{/* <div className="bg-blue-950 h-full w-full  text-white p-10 ">Chat</div> */}
			<div className="bg-blue-950 h-full w-full text-white p-10 hidden md:block">
				<LeaderTable leaderboard={leaderboard} />
			</div>
		</main>
	);
}

type Props = {
	leaderboard: LeaderBoard;
};

const LeaderTable = ({ leaderboard }: Props) => {
	return (
		<div className="relative flex flex-col w-full h-full p-4">
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
					<h2 className="text-white text-lg">No predictions yet. Be the first to predict!</h2>
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
				<AccordionTrigger className="w-full h-17.5 flex justify-between items-center bg-blue-800 text-left text-white font-bold text-lg">
					<span className="bg-pink-700 w-8 h-8 z-40 absolute -left-5 flex justify-center items-center">
						1
					</span>
					<div className="flex justify-between items-center w-full ">
						<div className="flex justify-between item-center gap-x-2 mr-auto">
							<div className="relative ml-3 min-h-16 min-w-16">
								<Image
									src={player.imageUrl ?? '/default-profile.png'}
									alt={`${player.name} Image`}
									fill
									className="object-cover"
								/>
							</div>
							<h2 className="my-auto text-start text-xs w-33.75 truncate">{player.name}</h2>
						</div>
						<div className="border-r-2 border-white px-1 text-2xl mr-4">{player.score}</div>
					</div>
				</AccordionTrigger>
				<AccordionContent>
					<div className="bg-blue-800 dark:bg-blue-950 p-4 w-[90%] mx-auto">
						{player.results && player.results.length !== 0 ? (
							player.results.map((result, index) => (
								<ResultCard key={result.id} result={result} index={index} />
							))
						) : (
							<div className="text-center text-white">No results yet.</div>
						)}
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

type ResultCardProps = {
	result: MatchResult;
	index: number;
};

const ResultCard = ({ result, index }: ResultCardProps) => {
	const fouls = 0
	return (
		<div className="h-10 border-b-2 border-slate-400 w-full flex items-center">
			<div className="border-x-2 border-slate-400 w-[10.5%] h-10 flex justify-center items-center">
				<span>{++index}</span>
			</div>
			<div className="border-r-2 border-slate-400 w-[17.25%] h-10 flex justify-between items-center px-1">
				<div className="relative min-w-4 min-h-4">
					<Image src={result.homeTeamBadgeUrl} alt="home-team-logo" fill className="object-fit" />
				</div>
				<div className="flex justify-center items-center">
					<EllipsisVertical className="h-3 w-3" />
				</div>
				<div className="relative min-w-4 min-h-4">
					<Image src={result.awayTeamBadgeUrl} alt="home-team-logo" fill className="object-fit" />
				</div>
			</div>
			<div className="border-r-2 border-slate-400 w-[17.25%] h-10 flex justify-center items-center">
				<span className="text-lg">{result.homeTeamScoreResult}</span>
				<div className="flex justify-center items-center">
					<EllipsisVertical className="h-3 w-3" />
				</div>
				<span className="text-lg">{result.awayTeamScoreResult}</span>
			</div>
			<div className="border-r-2 border-slate-400 w-[18.5%] h-10 flex justify-center items-center">
				<span className="text-lg">{result.homeTeamScorePrediction}</span>
				<div className="flex justify-center items-center">
					<EllipsisVertical className="h-3 w-3" />
				</div>
				<span className="text-lg">{result.awayTeamScorePrediction}</span>
			</div>
			<div
				className={cn(
					'border-r-2 border-slate-400 w-[17%] h-10 flex justify-center items-center',
					fouls < 0 ? 'text-red-500' : 'text-gray-500',
				)}>
				{fouls > 0 ? (
					<span>NA</span>
				) : fouls < 0 ? (
					<Minus className="h-4 w-4" />
				) : (
					<Diff className="h-4 w-4" />
				)}
				{fouls <= 0 ? <span className="text-lg">{Math.abs(fouls)}</span> : <></>}
			</div>
			<div
				className={cn(
					'border-r-2 border-slate-400 w-14 h-10 flex justify-center items-center ',
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
			</div>
		</div>
	);
};

type FollowingPlaceProps = {
	player: LeaderBoard[number];
	index: number;
};

const FollowingPlace = async ({ player, index }: FollowingPlaceProps) => {
	return (
		<Accordion type="single" collapsible className="w-[90%] mx-auto">
			<AccordionItem value="Following Place" className="w-full">
				<AccordionTrigger className="relative bg-blue-900 justify-center items-center">
					<div className="absolute top-0 left-0 flex items-center justify-center w-5 h-5 p-2 bg-pink-700">
						<span className="text-xs">{++index}</span>
					</div>
					<div className="relative ml-4 min-h-10 min-w-10">
						<Image
							src={player.imageUrl ?? '/default-profile.png'}
							alt={`${player.name} Image`}
							fill
							className="border-2 rounded-full border-slate-600"
						/>
					</div>
					<div className="flex items-center justify-between w-full p-2">
						<h3 className="text-xs text-start w-32 truncate">{player.name}</h3>
						<span className="border-r-2 border-white pr-2 text-lg">{player.score}</span>
					</div>
				</AccordionTrigger>
				<AccordionContent>
					<div className="bg-blue-800 dark:bg-blue-950 p-4 w-[90%] mx-auto">helloworld</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};
