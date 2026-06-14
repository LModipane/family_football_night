'use client';

import { useRouter } from 'next/navigation';
import { usePredictionContext } from '@/hooks';
import { fixturesWithLiveScore } from '@/types';
import { useEffect, useRef, useState } from 'react';
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

	// 1. Store the latest live status in a mutable ref
	const isLiveRef = useRef(false);
	isLiveRef.current = fixtures?.some(obj => obj.isGameLive);

	useEffect(() => {
		// 2. The interval only checks the stable ref, not the changing array
		const refreshIntervalId = setInterval(
			() => {
				if (isLiveRef.current) router.refresh();
			},
			1 * 60 * 1000,
		);

		return () => clearInterval(refreshIntervalId);
	}, [router]); // Empty of 'fixtures'—this effect only runs ONCE on mount

	return fixtures.length === 0 ? (
		<p className="w-full flex items-center justify-center">{leagueName} is off season</p>
	) : (
		<Carousel
			setApi={setCarouselAPI}
			className="w-full rounded-md"
			opts={{ startIndex: carouselIndex ?? 0 }}>
			<CarouselContent>
				{fixtures.map(match => {
					const gameOn = +new Date(match.kickOff) < +new Date();
					return (
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
								{gameOn ? (
									<div className="bg-blue-400 p-2 mx-3 mb-6 rounded-2xl animate-pulse">
										Live: <span>{match.homeTeamLiveScore}</span>
										{match.isGameLive ? ' - ' : ' HT '}
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
					);
				})}
			</CarouselContent>
			<div className="relative h-10 mt-1 flex justify-center items-center rounded-md px-2 py-2">
				<CarouselNext className="bg-gray-700 text-white px-2 py-1 rounded-md mr-14" />
				<CarouselPrevious className="bg-gray-700 text-white px-2 py-1 rounded-md ml-14" />
			</div>
		</Carousel>
	);
}

export default FixturesCarousel;
