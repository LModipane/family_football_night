import { Match } from '@/types';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

type Props = {
	fixtures: Match[];
};

function FixturesCarousel ({ fixtures }: Props) {
	return fixtures.length === 0 ? (
		<p>No fixtures available</p>
	) : (
		<Carousel>
			<CarouselContent>
				{fixtures.map(fixture => (
					<CarouselItem key={fixture.id} className="mx-2">
						<h3 className="text-lg font-bold mb-2">
							{fixture.homeTeamName} vs {fixture.awayTeamName}
						</h3>
						<p className="text-sm">
							Date: {new Date(fixture.date).toLocaleDateString()} Time:{' '}
							{new Date(fixture.date).toLocaleTimeString()}
						</p>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="bg-gray-700 text-white p-2 rounded-full mr-2">
				&lt;
			</CarouselPrevious>
			<CarouselNext className="bg-gray-700 text-white p-2 rounded-full">&gt;</CarouselNext>
		</Carousel>
	);
};

export default FixturesCarousel;
