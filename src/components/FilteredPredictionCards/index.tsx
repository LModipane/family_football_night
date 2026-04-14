'use client';

import Image from 'next/image';
import { EllipsisVertical, EyeOff, PenLine, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PredictionWithProfileMatchEvent } from '@/types';
import usePredictionContext from '@/hooks/usePredictionContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useModel } from '@/hooks';

const FilteredPredictionCards = ({
	predictions,
	currentProfileId,
}: {
	currentProfileId?: string;
	predictions: PredictionWithProfileMatchEvent[];
}) => {
	const { selectedMatchEventId } = usePredictionContext();
	const filteredPredictions = selectedMatchEventId
		? predictions.filter(prediction => prediction.matchEventId === `${selectedMatchEventId}`)
		: predictions;

	return (
		<ScrollArea className="flex flex-col gap-2 flex-1 pr-4 overflow-scroll no-scrollbar">
			{filteredPredictions.map(prediction => (
				<PredictionCard key={prediction.id} {...prediction} currentProfileId={currentProfileId} />
			))}
		</ScrollArea>
	);
};

export default FilteredPredictionCards;

type PredictionCardProps = {
	currentProfileId?: string;
} & PredictionWithProfileMatchEvent;

const PredictionCard = ({
	profile,
	homeTeamScore,
	awayTeamScore,
	matchEvent,
	currentProfileId,
}: PredictionCardProps) => {
	const { onOpen } = useModel();
	return (
		<div className="flex items-center justify-between p-4 text-white">
			{/* Profile Section */}
			<div className="flex items-center gap-3">
				<Avatar className="size-9">
					<AvatarImage src={profile.imageUrl || undefined} alt={profile.name || 'User Avatar'} />
					<AvatarFallback>{profile.name ? profile.name[0] : 'U'}</AvatarFallback>
				</Avatar>
				<span className="font-medium text-xs truncate w-30">{profile.name}</span>
			</div>

			{/* Match Details Section */}
			<div className="flex items-center gap-1">
				{/* Home Team Badge */}
				<Image
					src={matchEvent.homeTeamBadgeUrl}
					alt={`${matchEvent.homeTeamName} badge`}
					width={32}
					height={32}
					className="rounded-full"
				/>

				{/* Prediction Section */}
				<div className="flex items-center gap-2 font-semibold text-xl">
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

				{/* Action Menu */}
				{currentProfileId === profile.id && (
					<DropdownMenu>
						<DropdownMenuTrigger className="ml-2 cursor-pointer hover:bg-purple-600 p-1 rounded">
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
									onClick={() => onOpen('Edit Prediction', {})}>
									<PenLine size={17} />
									edit prediction
									<DropdownMenuShortcut className="text-gray-400">Ctrl+P</DropdownMenuShortcut>
								</div>
								<div className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize">
									<EyeOff size={17} />
									hide prediction
									<DropdownMenuShortcut className="text-gray-400">Ctrl+H</DropdownMenuShortcut>
								</div>
								<div className="hover:bg-red-900 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize">
									<Trash2 size={17} />
									remove prediction
									<DropdownMenuShortcut className="text-gray-400">Ctrl+D</DropdownMenuShortcut>
								</div>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</div>
	);
};
