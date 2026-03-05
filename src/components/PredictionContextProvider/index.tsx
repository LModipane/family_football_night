'use client';

import { MatchEvent } from '@/types';
import { createContext, useState, useMemo, type Dispatch, type SetStateAction } from 'react';

type PredictionStore = {
	carouselIndex: number;
	selectedMatchEventId: number | null;
	setCarouselIndex: Dispatch<SetStateAction<number>>;
};

export const PredictionContext = createContext<PredictionStore | undefined>(undefined);

const PredictionContextProvider = ({
	children,
	fixtures,
}: {
	children: React.ReactNode;
	fixtures: MatchEvent[];
}) => {
	const [carouselIndex, setCarouselIndex] = useState<number>(0);

	const selectedMatchEventId = useMemo(() => {
		return +fixtures[carouselIndex].id;
	}, [carouselIndex, fixtures]);

	return (
		<PredictionContext.Provider value={{ selectedMatchEventId, carouselIndex, setCarouselIndex }}>
			{children}
		</PredictionContext.Provider>
	);
};

export default PredictionContextProvider;
