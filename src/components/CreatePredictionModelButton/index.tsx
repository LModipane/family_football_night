'use client';

import { MatchEvent } from '@/types';
import { useModel, usePredictionContext } from '@/hooks';
import { useSession } from 'next-auth/react';

type Props = {
	groupId: string;
	leagueTagId: string;
	fixtures: MatchEvent[];
};

const CreatePredictionModelButton = ({ fixtures, groupId, leagueTagId }: Props) => {
	const { onOpen } = useModel();
	const { status } = useSession();
	const { carouselIndex, setCarouselIndex } = usePredictionContext();

	const openModel = () => {
		if (status !== 'authenticated') return;
		onOpen('Prediction', { fixtures, carouselIndex, setCarouselIndex, groupId, leagueTagId });
	};

	return (
		<div className="w-full mt-3" onClick={openModel}>
			<button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
				Create Prediction Model
			</button>
		</div>
	);
};

export default CreatePredictionModelButton;
