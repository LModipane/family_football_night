'use client';

import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { useModel } from '@/hooks';
import { MatchEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError } from '@/components/ui/field';
import { createPredictionSchema } from '@/types/formSchema';
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

	const {
		type,
		onClose,
		isOpen,
		data: { fixtures, carouselIndex, setCarouselIndex, groupId, leagueTagId },
	} = useModel();

	// const { carouselIndex, setCarouselIndex } = usePredictionContext();

	const isModelOpen = type === 'Prediction' && isOpen; // Replace with actual logic to determine if the model should be open

	const nextForm = () => {
		if (!carouselApi) return;
		carouselApi.scrollNext();
	};

	const prevForm = () => {
		if (!carouselApi) return;
		carouselApi.scrollPrev();
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
										<CarouselItem key={match.id} className="h-75 p-3">
											{groupId && leagueTagId ? (
												<Form match={match} groupId={groupId} leagueTagId={leagueTagId} />
											) : (
												<div>Missing Group ID or League Tag Id!!!</div>
											)}
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

type FormProps = {
	match: MatchEvent;
	groupId: string;
	leagueTagId: string;
};

const Form = ({ match, groupId, leagueTagId }: FormProps) => {
	const router = useRouter();

	const form = useForm<z.infer<typeof createPredictionSchema>>({
		defaultValues: {
			groupId,
			leagueTagId,
			matchEventId: match.id,
			awayTeamScore: undefined,
			homeTeamScore: undefined,
		},
		resolver: zodResolver(createPredictionSchema),
	});

	const submitPrediction = async (value: z.infer<typeof createPredictionSchema>) => {
		try {
			await axios.post('/api/create-prediction', value);
			toast.success('Successfully submitted Prediction');
		} catch (error) {
			console.error('Failed to submit Prediction: ', error);
			toast.error('Opps, failed to Submit Prediction!!!');
		} finally {
			router.refresh();
		}
	};

	const handleError = (error: any) => {
		console.error(error);
	};

	return (
		<form
			className="h-full w-full flex flex-col"
			onSubmit={form.handleSubmit(submitPrediction, handleError)}>
			<div className="flex flex-row h-full w-full justify-center items-center ">
				<div className="flex flex-col items-center">
					<Avatar className="w-28 h-28">
						<AvatarImage src={match.homeTeamBadgeUrl} className="w-full h-full" />
						<AvatarFallback />
					</Avatar>
					<h3>{match.homeTeamName}</h3>
				</div>
				<div className="flex flex-col justify-center items-center mx-1">
					<p className="text-sm -mb-3">{formatDate(match.kickOff.toDateString())}</p>
					<div className="flex flex-row justify-center items-center mx-4 my-3 mb-10 ">
						<Controller
							name="homeTeamScore"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<input
										min={0}
										required
										{...field}
										type="number"
										aria-invalid={fieldState.invalid}
										placeholder={`${field.value ?? 0}`}
										value={field.value || field.value === 0 ? field.value : ''}
										onChange={event => {
											if (event.target.value === '') return field.onChange(undefined);
											field.onChange(+event.target.value);
										}}
										className="min-w-16 h-16 border-2 border-gray-500 rounded-xl p-1 text-black font-bold text-[40px] text-center placeholder:text-gray-700/30 no-toggle"
									/>
									{fieldState.invalid ? (
										<FieldError className="text-[10px]" errors={[{ message: 'Invalid Score' }]} />
									) : null}
								</Field>
							)}
						/>
						<h4 className="mx-3">
							<Asterisk className="h-5 w-5" />
						</h4>
						<Controller
							name="awayTeamScore"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<input
										min={0}
										required
										{...field}
										type="number"
										aria-invalid={fieldState.invalid}
										placeholder={`${field.value ?? 0}`}
										value={field.value || field.value === 0 ? field.value : ''}
										onChange={event => {
											if (event.target.value === '') return field.onChange(undefined);
											field.onChange(+event.target.value);
										}}
										className="min-w-16 h-16 border-2 border-gray-500 rounded-xl p-1 text-black font-bold text-[40px] text-center placeholder:text-gray-700/30 no-toggle"
									/>
									{fieldState.invalid ? (
										<FieldError className="text-[10px]" errors={[{ message: 'Invalid Score' }]} />
									) : null}
								</Field>
							)}
						/>
					</div>
				</div>
				<div className="flex flex-col items-center">
					<Avatar className="w-28 h-28">
						<AvatarImage src={match.awayTeamBadgeUrl} className="w-full h-full" />
						<AvatarFallback />
					</Avatar>
					<h3>{match.awayTeamName}</h3>
				</div>
			</div>
			<div className="flex justify-end">
				<button>Submit</button>
			</div>
		</form>
	);
};
