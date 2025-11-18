import { getFixtures } from '@/lib';
import { CreatePredictionModelButton, FixturesCarousel, PredictionContextProvider } from '@/components';

export default async function Home() {
	const fixtures = await getFixtures();
	if (!fixtures) throw new Error('Failed to load fixtures');

	return (
		<main className="h-full w-full flex">
			<div className="bg-purple-900 h-full max-w-[30%] p-2 text-white sm:block hidden border-2 border-gray-300">
				<PredictionContextProvider fixtures={fixtures}>
					<FixturesCarousel fixtures={fixtures} />
					<CreatePredictionModelButton />
				</PredictionContextProvider>
			</div>
			<div className="bg-blue-950 h-full w-full  text-white p-10 ">Chat</div>
			<div className="bg-green-900 h-full w-[35%] text-white p-10 hidden md:block">Score Table</div>
		</main>
	);
}
