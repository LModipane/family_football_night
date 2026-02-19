'use client';

import { Match } from '@/types';
import { useEffect, useState } from 'react';
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
import { usePredictionContext } from '@/hooks';

type Props = {
	fixtures: Match[];
};

function FixturesCarousel({ fixtures }: Props) {
	const [carouselAPI, setCarouselAPI] = useState<CarouselApi | null>(null);
	const { setCarouselIndex, carouselIndex } = usePredictionContext();

	useEffect(() => {
		if (!carouselAPI) return;

		carouselAPI.on('select', () => {
			setCarouselIndex(carouselAPI.selectedScrollSnap());
		});
	}, [carouselAPI, setCarouselIndex]);

	console.log('Selected Carousel Index:', carouselIndex);

	return fixtures.length === 0 ? (
		<p>No fixtures available</p>
	) : (
		<Carousel
			setApi={setCarouselAPI}
			className="w-full rounded-md p-2"
			opts={{ startIndex: carouselIndex ?? 0 }}>
			<CarouselContent>
				{fixtures.map(match => (
					<CarouselItem key={match.id} className="flex flex-col justify-center items-center">
						<div className="flex flex-row justify-center items-center">
							<div className="flex flex-col justify-center items-center mb-2 h-full">
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
							<div className="flex flex-col justify-center items-center gap-3 mx-3">
								<p className="text-sm -mb-3">{formatDate(match.date)}</p>
								<h4 className="mx-3">vs</h4>
							</div>
							<div className="flex flex-col justify-center items-center mb-2 h-full">
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
			<div className="relative h-10 mt-4 flex justify-center items-center rounded-md px-2 py-2">
				<CarouselNext className="bg-gray-700 text-white px-2 py-1 rounded-md mr-14" />
				<CarouselPrevious className="bg-gray-700 text-white px-2 py-1 rounded-md ml-14" />
			</div>
		</Carousel>
	);
}

export default FixturesCarousel;
