'use client';

import Image from 'next/image';
import { useModel } from '@/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PredictionWithProfileMatchEvent } from '@/types';
import usePredictionContext from '@/hooks/usePredictionContext';
import { EllipsisVertical, EyeOff, PenLine, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuGroup,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuShortcut,
} from '../ui/dropdown-menu';

type Props = {
	groupId: string;
	currentProfileId?: string;
	predictions: PredictionWithProfileMatchEvent[];
};

const PredictionCards = ({ groupId, predictions, currentProfileId }: Props) => {
	const { selectedMatchEventId } = usePredictionContext();
	const filteredPredictions = selectedMatchEventId
		? predictions.filter(prediction => prediction.matchEventId === `${selectedMatchEventId}`)
		: predictions;

	return (
		<ScrollArea className="flex flex-col gap-2 overflow-scroll no-scrollbar">
			{filteredPredictions.map(prediction => (
				<PredictionCard
					key={prediction.id}
					{...prediction}
					currentProfileId={currentProfileId}
					groupId={groupId}
				/>
			))}
		</ScrollArea>
	);
};

export default PredictionCards;

type PredictionCardProps = {
	groupId: string;
	currentProfileId?: string;
} & PredictionWithProfileMatchEvent;

const PredictionCard = ({
	id,
	profile,
	groupId,
	matchEvent,
	homeTeamScore,
	awayTeamScore,
	currentProfileId,
}: PredictionCardProps) => {
	const { onOpen } = useModel();

	return (
		<div className="flex items-center w-full max-w-full justify-between p-2 text-white ">
			{/* Profile Section */}
			<div className="flex items-center gap-3 flex-1 min-w-7">
				<Avatar className="size-9">
					<AvatarImage src={profile.imageUrl || undefined} alt={profile.name || 'User Avatar'} />
					<AvatarFallback>{profile.name ? profile.name[0] : 'U'}</AvatarFallback>
				</Avatar>
				<span className="font-medium text-md w-full truncate">{profile.name}</span>
			</div>

			{/* Match Details Section */}
			<div className="flex items-center gap-1 ml-auto">
				{/* Home Team Badge */}
				<Image
					src={matchEvent.homeTeamBadgeUrl}
					alt={`${matchEvent.homeTeamName} badge`}
					width={32}
					height={32}
					className="rounded-full"
				/>

				{/* Prediction Section */}
				<div className="flex items-center ml-auto gap-2 font-semibold text-xl">
					<span className="text-right">{homeTeamScore}</span>
					<span>-</span>
					<span className="text-left">{awayTeamScore}</span>
				</div>

				{/* Away Team Badge */}
				<Image
					src={matchEvent.awayTeamBadgeUrl}
					alt={`${matchEvent.awayTeamName} badge`}
					width={32}
					height={32}
					className="rounded-full"
				/>
			</div>

			{/* Action Menu */}
			{currentProfileId === profile.id && (
				<DropdownMenu>
					<DropdownMenuTrigger className="cursor-pointer hover:bg-purple-600 p-1 rounded">
						<EllipsisVertical size={24} />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="right"
						className="bg-purple-950 text-white shadow-lg p-2 boder-1 border-gray-400 rounded-lg">
						<DropdownMenuGroup>
							<DropdownMenuLabel>Prediction Menu</DropdownMenuLabel>
							<hr className="border-gray-400" />
							<div
								className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize"
								// Note: Add Edit Prediction model in root layout page
								onClick={() =>
									onOpen('Prediction', {
										predictionMode: 'EDIT',
										match: matchEvent,
										groupId,
										leagueTagId: matchEvent.leagueTagId,
										prevPrediction: {
											id,
											homeTeamScore,
											awayTeamScore,
										},
									})
								}>
								<PenLine size={17} />
								edit prediction
								<DropdownMenuShortcut className="text-gray-400">Ctrl+P</DropdownMenuShortcut>
							</div>
							<div className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize">
								<EyeOff size={17} />
								hide prediction
								<DropdownMenuShortcut className="text-gray-400">Ctrl+H</DropdownMenuShortcut>
							</div>
							<div
								className="hover:bg-red-900 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize"
								onClick={() =>
									onOpen('Prediction', {
										predictionMode: 'DELETE',
										match: matchEvent,
										groupId,
										leagueTagId: matchEvent.leagueTagId,
										prevPrediction: { id, homeTeamScore, awayTeamScore },
									})
								}>
								<Trash2 size={17} />
								remove prediction
								<DropdownMenuShortcut className="text-gray-400">Ctrl+D</DropdownMenuShortcut>
							</div>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
};
