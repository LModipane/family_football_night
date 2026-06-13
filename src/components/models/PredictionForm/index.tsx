'use client';

import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { useModel } from '@/hooks';
import { useRouter } from 'next/navigation';
import { cn, formatDate } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PredictionSchema } from '@/types/formSchema';
import { Field, FieldError } from '@/components/ui/field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, ArrowLeft, Asterisk, Loader2, MapPin } from 'lucide-react';
import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { MatchEvent, Prediction, PredictionWithProfileMatchEvent } from '@/types';
import { Carousel, CarouselApi, CarouselItem, CarouselContent } from '@/components/ui/carousel';

import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from '@/components/ui/dialog';

const PredictionFormModel = () => {
	const {
		type,
		onClose,
		isOpen,
		data: {
			match,
			groupId,
			fixtures,
			leagueTagId,
			carouselIndex,
			predictionMode,
			prevPrediction,
			userPredictions,
			setCarouselIndex,
			selectedMatchEventId,
		},
	} = useModel();

	const isModelOpen = type === 'Prediction' && isOpen;

	return (
		<Dialog open={isModelOpen} onOpenChange={() => onClose()}>
			<DialogContent className="text-black w-screen p-2 md:p-4">
				<DialogHeader className="flex flex-col items-center mt-10">
					<DialogTitle>Football Match Prediction Submission</DialogTitle>
					<DialogDescription>
						<p className="text-center text-xs md:text-sm">
							Share your match prediction by choosing the final scores for each team. Your
							submission will be locked once the match starts, so make your best call!
						</p>
					</DialogDescription>
				</DialogHeader>
				{predictionMode === 'CREATE' ? (
					<CreatePredictionForm
						groupId={groupId}
						fixtures={fixtures}
						leagueTagId={leagueTagId}
						carouselIndex={carouselIndex}
						userPredictions={userPredictions}
						setCarouselIndex={setCarouselIndex}
						selectedMatchEventId={selectedMatchEventId}
					/>
				) : null}
				{predictionMode === 'EDIT' && groupId && leagueTagId && match ? (
					<Form
						match={match}
						groupId={groupId}
						leagueTagId={leagueTagId}
						prevPrediction={prevPrediction}
						predictionMode={predictionMode}
					/>
				) : null}
				{predictionMode === 'DELETE' && match && groupId && leagueTagId && prevPrediction ? (
					<div className="h-75 p-3">
						<Form
							match={match}
							groupId={groupId}
							leagueTagId={leagueTagId}
							prevPrediction={prevPrediction}
							predictionMode={predictionMode}
						/>
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
};

type CreatePredictionFormProps = {
	groupId: string | undefined;
	leagueTagId: string | undefined;
	fixtures: MatchEvent[] | undefined;
	selectedMatchEventId?: string | null;
	carouselIndex: number | null | undefined;
	userPredictions?: PredictionWithProfileMatchEvent[];
	setCarouselIndex: Dispatch<SetStateAction<number>> | undefined;
};

const CreatePredictionForm = ({
	groupId,
	fixtures,
	leagueTagId,
	carouselIndex,
	userPredictions,
	setCarouselIndex,
	selectedMatchEventId,
}: CreatePredictionFormProps) => {
	const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(true);

	const nextForm = () => {
		if (!carouselApi) return;
		carouselApi.scrollNext();
	};

	const prevForm = () => {
		if (!carouselApi) return;
		carouselApi.scrollPrev();
	};

	// sync with fixtures carouse
	useEffect(() => {
		if (!carouselApi || !setCarouselIndex) return;

		setCarouselIndex(carouselApi.selectedScrollSnap());

		carouselApi.on('select', () => {
			setCanScrollPrev(carouselApi.canScrollPrev());
			setCanScrollNext(carouselApi.canScrollNext());
			setCarouselIndex(carouselApi.selectedScrollSnap());
		});
	}, [carouselApi, setCarouselIndex]);

	return (
		<div className="w-full overflow-hidden">
			{fixtures && fixtures.length > 0 ? (
				<div className="relative flex flex-col gap-y-3 ">
					<div className="w-full flex gap-x-3 justify-end">
						<Button
							variant="outline"
							onClick={prevForm}
							disabled={!canScrollPrev}
							className="flex items-center justify-center gap-2">
							<ArrowLeft className="h-5 w-5" />
							Back
						</Button>
						<Button
							variant="outline"
							onClick={nextForm}
							disabled={!canScrollNext}
							className="flex items-center justify-center gap-2">
							Next
							<ArrowRight className="h-5 w-5" />
						</Button>
					</div>
					<Carousel setApi={setCarouselApi} opts={{ startIndex: carouselIndex ?? 0 }}>
						<CarouselContent className="flex gap-x-3">
							{fixtures.map(match => {
								const userMatchPredictionIds =
									userPredictions?.map(prediction => prediction.matchEvent.id) ?? [];
								const isPredictionMode = !userMatchPredictionIds.includes(match.id);
								return (
									<CarouselItem key={match.id}>
										<Form
											match={match}
											groupId={groupId ?? ''}
											leagueTagId={leagueTagId ?? ''}
											predictionMode={isPredictionMode ? 'CREATE' : 'EDIT'}
											selectedMatchEventId={selectedMatchEventId}
											prevPrediction={userPredictions?.find(
												prediction => prediction.matchEvent.id === match.id,
											)}
										/>
									</CarouselItem>
								);
							})}
						</CarouselContent>
					</Carousel>
				</div>
			) : (
				<div>There is no fixtures</div>
			)}
		</div>
	);
};

export default PredictionFormModel;

type FormProps = {
	groupId: string;
	match: MatchEvent;
	leagueTagId: string;
	prevPrediction?: Prediction;
	selectedMatchEventId?: string | null;
	predictionMode: 'CREATE' | 'EDIT' | 'DELETE' | null;
};

const Form = ({
	match,
	groupId,
	leagueTagId,
	prevPrediction,
	predictionMode = 'CREATE',
}: FormProps) => {
	const router = useRouter();
	const { onClose } = useModel();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof PredictionSchema>>({
		defaultValues: {
			groupId,
			leagueTagId,
			matchEventId: match.id,
			predictionId: prevPrediction?.id!,
			hide: prevPrediction ? prevPrediction.hide : false,
			homeTeamScore: predictionMode === 'DELETE' ? prevPrediction?.homeTeamScore : undefined,
			awayTeamScore: predictionMode === 'DELETE' ? prevPrediction?.awayTeamScore : undefined,
		},
		resolver: zodResolver(PredictionSchema),
	});

	const isLateSubmission =  +new Date(match.kickOff) - +new Date() < 30 * 60 * 1000; // submission is late if kickoff is 30 minutes away

	const submitHandler = async (value: z.infer<typeof PredictionSchema>) => {
		if (isLateSubmission || isLoading) return;
		try {
			setIsLoading(true);
			switch (predictionMode) {
				case 'DELETE':
					if (prevPrediction) {
						await axios.delete('/api/delete-prediction', { data: value });
						toast.success('Successfully deleted Prediction');
					}
					onClose!();
					break;

				case 'EDIT':
					console.log('Editing Prediction with values: ');
					if (prevPrediction) {
						await axios.put('/api/edit-prediction', value);
						toast.success('Successfully edited Prediction');
					}
					onClose!();
					break;

				case 'CREATE':
					await axios.post('/api/create-prediction', value);
					toast.success('Successfully submitted Prediction');
					break;

				default:
					// Optional: Add handling for unsupported modes
					break;
			}
		} catch (error) {
			console.error('Failed to submit Prediction: ', error);
			toast.error(`Opps, failed to ${predictionMode === 'EDIT' ? 'edit' : 'submit'} Prediction!!!`);
		} finally {
			setIsLoading(false);
			router.refresh();
		}
	};

	const handleError = (error: any) => {
		console.error(error);
	};

	// const showWinningSideField =
	// 	!match.isKnockoutStage && form.getValues('awayTeamScore') === form.getValues('homeTeamScore');

	// useEffect(() => {
	// 	const subscription = form.watch(value => {
	// 		console.log(value);
	// 	});

	// 	return () => subscription.unsubscribe();
	// }, [form.watch]);

	return (
		<form
			className="h-fit w-full flex flex-col mx-auto"
			onSubmit={form.handleSubmit(submitHandler, handleError)}>
			<div className="flex gap-2 justify-between">
				<Controller
					name="hide"
					control={form.control}
					render={({ field }) => (
						<div className="flex items-center space-x-2 mb-4">
							<Switch checked={field.value} onCheckedChange={field.onChange} id="hide-prediction" />
							<Label htmlFor="hide-prediction" className="text-sm">
								Hide Prediction
							</Label>
						</div>
					)}
				/>
				{/* {showWinningSideField ? (
					<Controller
						name="winningSide"
						control={form.control}
						render={({ field }) => <div className="flex items-center space-x-2 mb-4">hello</div>}
					/>
				) : null} */}
			</div>
			<div className="flex flex-row w-full h-50 md:h-55 justify-between items-center">
				<div className="h-full w-full flex flex-col items-center justify-center text-sm text-center">
					<Avatar className="h-full w-full md:max-w-28 md:max-h-28 max-h-20 max-w-20 shadow-2xl border-none">
						<AvatarImage src={match.homeTeamBadgeUrl} className="w-full h-full" />
						<AvatarFallback />
					</Avatar>
					<h3 className="mt-2 font-semibold text-lg">{match.homeTeamName}</h3>
				</div>
				<div className="h-full w-fit flex flex-col justify-center items-center mb-15">
					<div className="flex flex-col items-center justify-center w-full">
						<p className="md:text-lg text-sm mb-0.5">{formatDate(match.kickOff)}</p>
						{match.venue ? (
							<div className="flex items-center text-center">
								<MapPin size={16} className="min-w-5" />
								<span className="md:text-sm text-xs text-center ">{match.venue}</span>
							</div>
						) : null}
					</div>
					<div className="flex flex-row justify-center items-center h-fit w-full md:mx-4 mx-2 my-3 mb-5">
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
										readOnly={predictionMode === 'DELETE'}
										placeholder={`${field.value ?? prevPrediction?.homeTeamScore ?? 0}`}
										value={field.value || field.value === 0 ? field.value : ''}
										onChange={event => {
											if (event.target.value === '') return field.onChange(undefined);
											field.onChange(+event.target.value);
										}}
										className="w-full h-full min-h-5 min-w-5 md:min-w-16 md:min-h-16 p-2 border-2 border-gray-500 rounded-xl text-black font-bold md:text-[40px] text-[25px] text-center placeholder:text-gray-700/30 no-toggle"
									/>
									{fieldState.invalid ? (
										<FieldError className="text-[10px]" errors={[{ message: 'Invalid Score' }]} />
									) : null}
								</Field>
							)}
						/>
						<h4 className="p-1">
							<Asterisk size={20} />
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
										readOnly={predictionMode === 'DELETE'}
										value={field.value || field.value === 0 ? field.value : ''}
										placeholder={`${field.value ?? prevPrediction?.awayTeamScore ?? 0}`}
										onChange={event => {
											if (event.target.value === '') return field.onChange(undefined);
											field.onChange(+event.target.value);
										}}
										className="w-full h-full min-h-5 min-w-5 md:min-w-16 md:min-h-16 p-2 border-2 border-gray-500 rounded-xl text-black font-bold md:text-[40px] text-[25px] text-center placeholder:text-gray-700/30 no-toggle"
									/>
									{fieldState.invalid ? (
										<FieldError className="text-[10px]" errors={[{ message: 'Invalid Score' }]} />
									) : null}
								</Field>
							)}
						/>
					</div>
				</div>
				<div className="h-full w-full flex flex-col items-center justify-center text-sm text-center">
					<Avatar className="h-full w-full md:max-w-28 md:max-h-28 max-h-20 max-w-20 shadow-xl">
						<AvatarImage src={match.awayTeamBadgeUrl} className="w-full h-full " />
						<AvatarFallback />
					</Avatar>
					<h3 className="mt-2 font-semibold text-lg">{match.awayTeamName}</h3>
				</div>
			</div>
			<div className="flex justify-end mt-auto">
				{isLateSubmission ? (
					<Button variant={'destructive'} disabled className="cursor-not-allowed">
						Late Submission
					</Button>
				) : (
					<Button disabled={isLoading}>
						{predictionMode === 'EDIT' ? 'Edit' : predictionMode === 'DELETE' ? 'Delete' : 'Submit'}
						<Loader2 className={cn('ml-2', isLoading ? 'animate-spin' : 'hidden')} />
					</Button>
				)}
			</div>
		</form>
	);
};
