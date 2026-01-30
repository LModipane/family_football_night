'use client';

// import { toast } from "sonner";
import axios from 'axios';
import { useModel } from '@/hooks';
import { useState, useEffect } from 'react';
import { formatDate, trancateName } from '@/lib/utils';
import { ArrowRight, ArrowLeft, Asterisk } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselApi, CarouselItem, CarouselContent } from '@/components/ui/carousel';

import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from '@/components/ui/dialog';

const PredictionFormModel = () => {
	const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
	const [homeTeamScore, setHomeTeamScore] = useState<number | null>(null);
	const [awayTeamScore, setAwayTeamScore] = useState<number | null>(null);

	const {
		type,
		onClose,
		data: { fixtures, carouselIndex, setCarouselIndex, profileId },
	} = useModel();

	// const { carouselIndex, setCarouselIndex } = usePredictionContext();

	const isModelOpen = type === 'Prediction'; // Replace with actual logic to determine if the model should be open

	const nextForm = () => {
		if (!carouselApi) return;
		carouselApi.scrollNext();
	};

	const prevForm = () => {
		if (!carouselApi) return;
		carouselApi.scrollPrev();
	};

	const submitPrediction = async () => {
		try {
			console.log('Submitting Prediction');
			await axios.post('/api/create-prediction', { homeTeamScore, awayTeamScore, profileId });
		} catch (error) {
			console.error('Failed to submit Prediction: ', error);
			// toast.error("Opps, failed to Submit Prediction!!!")
		}
	};

	useEffect(() => {
		if (!carouselApi || !setCarouselIndex) return;

		carouselApi.on('select', () => {
			setCarouselIndex(carouselApi.selectedScrollSnap());
		});
	}, [carouselApi, setCarouselIndex]);

	return (
		<Dialog open={isModelOpen} onOpenChange={() => onClose()}>
			<DialogContent className="text-black w-screen">
				<DialogHeader className="flex flex-col items-center">
					<DialogTitle>Football Match Prediction Submission</DialogTitle>
					<DialogDescription>
						Share your match prediction by choosing the final scores for each team. Your submission
						will be locked once the match starts, so make your best call!
					</DialogDescription>
				</DialogHeader>
				<div className="w-full overflow-hidden">
					{fixtures && fixtures.length > 0 ? (
						<div className="flex flex-col gap-y-3">
							<div className="w-full flex gap-x-3 justify-end">
								<button onClick={prevForm}>
									<ArrowLeft className="h-5 w-5" />
								</button>
								<button onClick={nextForm}>
									<ArrowRight className="h-5 w-5" />
								</button>
							</div>
							<Carousel setApi={setCarouselApi} opts={{ startIndex: carouselIndex ?? 0 }}>
								<CarouselContent className="mx-1 flex gap-x-3 ">
									{fixtures.map(match => (
										<CarouselItem key={match.id} className="h-[300px] p-3">
											<form className="h-full w-full flex flex-col" onSubmit={submitPrediction}>
												<div className="flex h-full w-full justify-center items-center">
													<div className="flex flex-col items-center">
														<Avatar className="w-28 h-28">
															<AvatarImage src={match.homeTeamBadgeUrl} className="w-full h-full" />
															<AvatarFallback />
														</Avatar>
														<h3>{trancateName(match.homeTeamName)}</h3>
													</div>
													<div className="flex flex-col justify-center items-center mx-1">
														<p className="text-sm -mb-3">{formatDate(match.date)}</p>
														<div className="flex justify-center items-center mx-4 my-3 mb-10">
															<input
																type="number"
																placeholder={`${0}`}
																value={homeTeamScore ?? 0}
																onChange={event => setHomeTeamScore(Math.abs(+event.target.value))}
																className="w-16 h-16 border-2 border-gray-500 rounded-xl focus:border-blue-500 text-center text-black text-3xl"
															/>
															<h4 className="mx-3">
																<Asterisk className="h-5 w-5" />
															</h4>
															<input
																type="number"
																placeholder={`${0}`}
																value={awayTeamScore ?? 0}
																onChange={event => setAwayTeamScore(Math.abs(+event.target.value))}
																className="w-16 h-16 border-2 border-gray-500 rounded-xl focus:border-blue-500 text-center text-black text-3xl"
															/>
														</div>
													</div>
													<div className="flex flex-col items-center">
														<Avatar className="w-28 h-28">
															<AvatarImage src={match.awayTeamBadgeUrl} className="w-full h-full" />
															<AvatarFallback />
														</Avatar>
														<h3>{trancateName(match.awayTeamName)}</h3>
													</div>
												</div>
												<div className="flex justify-end">
													<button>Submit</button>
												</div>
											</form>
										</CarouselItem>
									))}
								</CarouselContent>
							</Carousel>
						</div>
					) : (
						<div>There is no fixtures</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PredictionFormModel;
