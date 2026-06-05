'use client';

import { MatchEvent } from '@/types';
import { useEffect, useState } from 'react';
import { usePredictionContext } from '@/hooks';
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
import { MapPin } from 'lucide-react';
import { ConsoleLogWriter } from 'drizzle-orm';

type Props = {
	fixtures: MatchEvent[];
};

function FixturesCarousel({ fixtures }: Props) {
	const { carouselIndex } = usePredictionContext();

	return fixtures.length === 0 ? (
		<p>No fixtures available</p>
	) : (
		<Carousel className="w-full rounded-md" opts={{startIndex: carouselIndex}}>
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
							<div className="flex flex-col justify-center items-center mx-3 gap-0.px">
								<span className="text-sm">{formatDate(match.kickOff)}</span>
								<span className="mx-3">vs</span>
							</div>
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
