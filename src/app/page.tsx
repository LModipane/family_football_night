import { db } from '@/lib/db';
import { getFixtures } from '@/lib';
import { getServerSession } from 'next-auth';
import { PredictionWithProfile } from '@/types';
import { authOptions } from '@/lib/nextAuth/options';
import { redirect, RedirectType } from 'next/navigation';

import {
	PredictionCard,
	FixturesCarousel,
	PredictionContextProvider,
	CreatePredictionModelButton,
} from '@/components';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function Home() {
	const session = await getServerSession(authOptions);
	if (!session) redirect('/Landing', RedirectType.replace);

	const fixtures = await getFixtures();
	if (!fixtures) throw new Error('Failed to load fixtures');

	const predictions: PredictionWithProfile[] = await db.query.predictionTable.findMany({
		with: { profile: true },
	});

	return (
		<main className="h-full w-full flex">
			<div className="bg-purple-900 h-full max-w-[35%] p-2 text-white sm:flex sm:flex-col hidden border-2 border-gray-300">
				<PredictionContextProvider fixtures={fixtures}>
					<FixturesCarousel fixtures={fixtures} />
					<CreatePredictionModelButton fixtures={fixtures} />

					{/* Prediction Cards: */}
					{predictions && predictions.length !== 0 ? (
						<ScrollArea className="flex flex-col gap-2 flex-1 pr-4 overflow-scroll no-scrollbar">
							{predictions.map(prediction => (
								<PredictionCard key={prediction.id} {...prediction} />
							))}
						</ScrollArea>
					) : (
						<div className="">Be the first to predict</div>
					)}
				</PredictionContextProvider>
			</div>
			<div className="bg-blue-950 h-full w-full  text-white p-10 ">Chat</div>
			<div className="bg-green-900 h-full w-[35%] text-white p-10 hidden md:block">Score Table</div>
		</main>
	);
}
