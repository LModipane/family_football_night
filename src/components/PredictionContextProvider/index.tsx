'use client';

import { Match } from '@/types';
import { createContext, useState, useMemo } from 'react';

type PredictionStore =
	| {
			selectedMatch: Match | null;
			carouselIndex: number | null;
			setCarouselIndex: React.Dispatch<React.SetStateAction<number | null>>;
	  }
	| undefined;

export const PredictionContext = createContext<PredictionStore>(undefined);

const PredictionContextProvider = ({
	children,
	fixtures,
}: {
	children: React.ReactNode;
	fixtures: Match[];
}) => {
	const [carouselIndex, setCarouselIndex] = useState<number | null>(null);
	const selectedMatch = useMemo(() => {
		if (!carouselIndex) return null;

		return fixtures[carouselIndex];
	}, [carouselIndex, fixtures]);

	return (
		<PredictionContext.Provider value={{ selectedMatch, carouselIndex, setCarouselIndex }}>
			{children}
		</PredictionContext.Provider>
	);
};

export default PredictionContextProvider;
