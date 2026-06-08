'use client';

import { useSession } from 'next-auth/react';
import { useModel, usePredictionContext } from '@/hooks';
import { MatchEvent, PredictionWithProfileMatchEvent } from '@/types';
import posthog from 'posthog-js';

type Props = {
	groupId: string;
	leagueTagId: string;
	fixtures: MatchEvent[];
	userPredictions: PredictionWithProfileMatchEvent[] | undefined;
};

const CreatePredictionModelButton = ({
	groupId,
	fixtures,
	leagueTagId,
	userPredictions,
}: Props) => {
	const { onOpen } = useModel();
	const { status } = useSession();
	const { carouselIndex, setCarouselIndex, selectedMatchEventId } = usePredictionContext();

	const openModel = () => {
		posthog.capture("open-model")
		if (status !== 'authenticated') return;
		onOpen('Prediction', {
			groupId,
			fixtures,
			leagueTagId,
			carouselIndex,
			userPredictions,
			setCarouselIndex,
			selectedMatchEventId,
			predictionMode: 'CREATE',
		});
	};

	return (
		<div className="w-full" onClick={openModel}>
			<button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer">
				Make Prediction
			</button>
		</div>
	);
};

export default CreatePredictionModelButton;
