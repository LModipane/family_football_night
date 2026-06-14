'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePredictionContext } from '@/hooks';
import { fixturesWithLiveScore } from '@/types';
import { formatDate, trancateName } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import {
	Carousel,
	CarouselApi,
	CarouselNext,
	CarouselItem,
	CarouselContent,
	CarouselPrevious,
} from '@/components/ui/carousel';

type Props = {
	fixtures: fixturesWithLiveScore[];
	leagueName: string;
};

function FixturesCarousel({ fixtures, leagueName }: Props) {
	const [carouselAPI, setCarouselAPI] = useState<CarouselApi | null>(null);
	const { setCarouselIndex, carouselIndex } = usePredictionContext();
	const router = useRouter();

	useEffect(() => {
		if (!carouselAPI) return;

		setCarouselIndex(carouselAPI.selectedScrollSnap());
		carouselAPI.on('select', () => {
			setCarouselIndex(carouselAPI.selectedScrollSnap());
		});
	}, [carouselAPI, setCarouselIndex]);

	useEffect(() => {
		// Find if any game is currently live
		const hasLiveGame = fixtures?.some(obj => obj.isGameLive);

		if (!hasLiveGame) return;

		// Trigger an immediate refresh
		router.refresh();

		// Set up interval with the correct clear method
		const intervalId = setInterval(
			() => {
				router.refresh();
			},
			5 * 60 * 1000,
		);

		// Cleanup to prevent memory leaks and duplicate intervals
		return () => clearInterval(intervalId);
	}, [fixtures, router]);

	return fixtures.length === 0 ? (
		<p className="w-full flex items-center justify-center">{leagueName} is off season</p>
	) : (
		<Carousel
			setApi={setCarouselAPI}
			className="w-full rounded-md"
			opts={{ startIndex: carouselIndex ?? 0 }}>
			<CarouselContent>
				{fixtures.map(match => (
					<CarouselItem key={match.id} className="flex flex-col justify-center items-center">
						<div className="flex flex-row justify-center items-center">
							<div className="flex flex-col justify-center items-center h-full">
								<Avatar className="w-13 h-13">
									<AvatarImage
										src={match.homeTeamBadgeUrl}
										className="w-full h-full"
										alt={`Home Team, ${match.homeTeamName}`}
									/>
									<AvatarFallback className="text-black">home</AvatarFallback>
								</Avatar>
								<h3 className="uppercase">{trancateName(match.homeTeamName)}</h3>
							</div>
							{match.isGameLive ? (
								<div className="bg-blue-400 p-2 mx-3 mb-6 rounded-2xl animate-pulse">
									Live: <span>{match.homeTeamLiveScore}</span>-
									<span>{match.awayTeamLiveScore}</span>
								</div>
							) : (
								<div className="flex flex-col justify-center items-center mx-3 gap-0.px">
									<span className="text-sm">{formatDate(match.kickOff)}</span>
									<span className="mx-3">vs</span>
								</div>
							)}
							<div className="flex flex-col justify-center items-center h-full">
								<Avatar className="w-13 h-13">
									<AvatarImage
										src={match.awayTeamBadgeUrl}
										className="w-full h-full"
										alt={`Away Team, ${match.awayTeamName}`}
									/>
									<AvatarFallback className="text-black">Away</AvatarFallback>
								</Avatar>
								<h3 className="uppercase">{trancateName(match.awayTeamName)}</h3>
							</div>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<div className="relative h-10 mt-1 flex justify-center items-center rounded-md px-2 py-2">
				<CarouselNext className="bg-gray-700 text-white px-2 py-1 rounded-md mr-14" />
				<CarouselPrevious className="bg-gray-700 text-white px-2 py-1 rounded-md ml-14" />
			</div>
		</Carousel>
	);
}

export default FixturesCarousel;
