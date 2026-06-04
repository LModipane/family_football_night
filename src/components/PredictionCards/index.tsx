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
import { cn } from '@/lib/utils';

type Props = {
	groupId: string;
	currentProfileId?: string;
	predictions: PredictionWithProfileMatchEvent[];
};

const PredictionCards = ({ groupId, predictions, currentProfileId }: Props) => {
	const { selectedMatchEventId } = usePredictionContext();
	const filteredPredictions = selectedMatchEventId
		? predictions.filter(prediction => prediction.matchEventId === selectedMatchEventId)
		: predictions;
	filteredPredictions.sort((a, b) => {
		// If 'a' matches the target ID, move it to the front (-1)
		if (a.profile.id === currentProfileId) return -1;
		// If 'b' matches the target ID, move it to the front (1)
		if (b.profile.id === currentProfileId) return 1;

		// Otherwise, sort alphabetically by 'letter'
		return a.profile.name.localeCompare(b.profile.name);
	});

	return (
		<ScrollArea className="flex flex-col gap-2 overflow-scroll no-scrollbar">
			{filteredPredictions.map(prediction => (
				<PredictionCard
					groupId={groupId}
					key={prediction.id}
					prediction={prediction}
					currentProfileId={currentProfileId}
				/>
			))}
		</ScrollArea>
	);
};

export default PredictionCards;

type PredictionCardProps = {
	groupId: string;
	currentProfileId?: string;
	prediction: PredictionWithProfileMatchEvent;
};

const PredictionCard = ({ groupId, prediction, currentProfileId }: PredictionCardProps) => {
	const { onOpen } = useModel();

	return (
		<div className="flex items-center w-full max-w-full justify-between p-2 text-white ">
			{/* Profile Section */}
			<div className="flex items-center gap-3 flex-1 min-w-7">
				<Avatar className="size-9">
					<AvatarImage
						src={prediction.profile.imageUrl || undefined}
						alt={prediction.profile.name || 'User Avatar'}
					/>
					<AvatarFallback>
						{prediction.profile.name ? prediction.profile.name[0] : 'U'}
					</AvatarFallback>
				</Avatar>
				<span className="font-medium text-md w-full truncate">{prediction.profile.name}</span>
			</div>

			{/* Match Details Section */}
			<div
				className={cn(
					'flex items-center gap-1 ml-auto',
					currentProfileId === prediction.profile.id ? 'md:mr-4 mr-1' : 'md:mr-11.5 mr-8.5',
				)}>
				{/* Home Team Badge */}
				<Image
					width={32}
					height={32}
					className="rounded-full"
					src={prediction.matchEvent.homeTeamBadgeUrl}
					alt={`${prediction.matchEvent.homeTeamName} badge`}
				/>

				{/* Prediction Section */}
				{prediction.hide && prediction.profile.id === currentProfileId ? (
					<div className="flex items-center ml-auto gap-2 font-semibold text-xl animate-pulse text-yellow-400">
						<span className="text-right">Hidden</span>
					</div>
				): (
					<div className="flex items-center ml-auto gap-2 font-semibold text-xl">
					<span className="text-right">{prediction.homeTeamScore}</span>
					<span>-</span>
					<span className="text-left">{prediction.awayTeamScore}</span>
				</div>
				)}
				

				{/* Away Team Badge */}
				<Image
					width={32}
					height={32}
					className="rounded-full"
					src={prediction.matchEvent.awayTeamBadgeUrl}
					alt={`${prediction.matchEvent.awayTeamName} badge`}
				/>
			</div>

			{/* Action Menu */}
			{currentProfileId === prediction.profile.id && (
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
										groupId,
										predictionMode: 'EDIT',
										prevPrediction: prediction,
										match: prediction.matchEvent,
										leagueTagId: prediction.matchEvent.leagueTagId,
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
										groupId,
										predictionMode: 'DELETE',
										prevPrediction: prediction,
										match: prediction.matchEvent,
										leagueTagId: prediction.matchEvent.leagueTagId,
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
