'use client';

import Image from 'next/image';
import { PredictionWithProfile } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import usePredictionContext from '@/hooks/usePredictionContext';

const FilteredPredictionCards = ({ predictions }: { predictions: PredictionWithProfile[] }) => {
	const { selectedMatchEventId } = usePredictionContext();
    console.log('Selected Match Event ID:', selectedMatchEventId);
    
	const filteredPredictions = selectedMatchEventId
		? predictions.filter(prediction => prediction.matchEventId === `${selectedMatchEventId}`)
        : predictions;
    
	return (
		<ScrollArea className="flex flex-col gap-2 flex-1 pr-4 overflow-scroll no-scrollbar">
			{filteredPredictions.map(prediction => (
				<PredictionCard key={prediction.id} {...prediction} />
			))}
		</ScrollArea>
	);
};

export default FilteredPredictionCards;

const PredictionCard = ({
	profile,
	homeTeamScore,
	awayTeamScore,
	homeTeamName,
	awayTeamName,
	homeTeamBadgeUrl,
	awayTeamBadgeUrl,
}: PredictionWithProfile) => {
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
					src={homeTeamBadgeUrl}
					alt={`${homeTeamName} badge`}
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
					src={awayTeamBadgeUrl}
					alt={`${awayTeamName} badge`}
					width={32}
					height={32}
					className="rounded-full"
				/>
			</div>
		</div>
	);
};
