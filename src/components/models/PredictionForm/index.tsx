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
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
	const [selectWinner, setSelectWinner] = useState(false);

	const form = useForm<z.infer<typeof PredictionSchema>>({
		defaultValues: {
			groupId,
			leagueTagId,
			matchEventId: match.id,
			id: prevPrediction?.id,
			hide: prevPrediction ? prevPrediction.hide : false,
			homeTeamScore: predictionMode === 'DELETE' ? prevPrediction?.homeTeamScore : undefined,
			awayTeamScore: predictionMode === 'DELETE' ? prevPrediction?.awayTeamScore : undefined,
		},
		resolver: zodResolver(PredictionSchema),
	});

	const isLateSubmission = +new Date(match.kickOff) - +new Date() < 30 * 60 * 1000; // submission is late if kickoff is 30 minutes away

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

	useEffect(() => {
		const awayTeamScoreFormValue = form.getValues('awayTeamScore');
		const homeTeamScoreFormValue = form.getValues('homeTeamScore');
		if (!match || !match.isKnockoutStage || !awayTeamScoreFormValue || !homeTeamScoreFormValue)
			return;

		const predictedDraw = awayTeamScoreFormValue === homeTeamScoreFormValue;
		setSelectWinner(match.isKnockoutStage && predictedDraw);
	}, [form.watch(), match?.isKnockoutStage]);

	return (
		<form
			className="h-full w-full flex flex-col gap-3"
			onSubmit={form.handleSubmit(submitHandler, handleError)}>
			<ScrollArea className="flex flex-col md:h-80 h-50 p-2 overflow-y-scroll no-scrollbar">
				<div className="flex flex-col md:flex-row gap-2 m-2">
					{/* Hide Prediction */}
					<Controller
						name="hide"
						control={form.control}
						render={({ field }) => (
							<div className="flex items-center justify-between rounded-2xl border bg-muted/40 px-2 py-1 shadow-sm transition-colors hover:bg-muted/60">
								<div className="space-y-1">
									<Label htmlFor="hide-prediction" className="text-sm font-semibold cursor-pointer">
										Hide Prediction
									</Label>

									<p className="text-[10px] text-muted-foreground max-w-[70%]">
										Keep your prediction hidden until the match starts.
									</p>
								</div>

								<Switch
									id="hide-prediction"
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</div>
						)}
					/>

					{/* Winner Selection */}
					{selectWinner && (
						<Controller
							name="winningSide"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									aria-invalid={fieldState.invalid}
									className="rounded-2xl border bg-muted/40 p-4 shadow-sm">
									<div className="mb-3">
										<FieldLabel className="text-sm font-semibold">Match Winner</FieldLabel>

										<p className="mt-1 text-xs text-muted-foreground">
											Choose who you think will win after full time.
										</p>
									</div>

									<FieldContent>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger className="h-11 w-full">
												<SelectValue placeholder="Select winning team" />
											</SelectTrigger>

											<SelectContent>
												<SelectGroup>
													<SelectLabel>Teams</SelectLabel>

													<SelectItem value="home" className="py-3">
														<div className="flex items-center gap-3">
															<Avatar className="size-8 md:size-10 border shadow-sm">
																<AvatarImage src={match.homeTeamBadgeUrl} />
																<AvatarFallback />
															</Avatar>

															<span className="font-medium">{match.homeTeamName}</span>
														</div>
													</SelectItem>

													<SelectItem value="away" className="py-3">
														<div className="flex items-center gap-3">
															<Avatar className="size-8 md:size-10 border shadow-sm">
																<AvatarImage src={match.awayTeamBadgeUrl} />
																<AvatarFallback />
															</Avatar>

															<span className="font-medium">{match.awayTeamName}</span>
														</div>
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</FieldContent>
								</Field>
							)}
						/>
					)}
				</div>
				<div className="rounded-3xl border bg-card shadow-sm p-4 md:p-3 ">
					<div className="flex items-start justify-between gap-4">
						{/* Home Team */}
						<div className="flex flex-1 flex-col items-center text-center">
							<Avatar className="size-17 md:size-28 rounded-full border bg-background shadow-md">
								<AvatarImage src={match.homeTeamBadgeUrl} />
								<AvatarFallback />
							</Avatar>

							<h3 className="mt-3 text-sm md:text-lg font-semibold leading-tight">
								{match.homeTeamName}
							</h3>
						</div>

						{/* Center */}
						<div className="flex flex-col items-center shrink-0">
							<div className="rounded-full bg-muted px-2 py-1">
								<p className="text-xs md:text-sm font-medium">{formatDate(match.kickOff)}</p>
							</div>

							{match.venue && (
								<div className="mt-2 flex items-center gap-1 text-muted-foreground max-w-30">
									<span className="text-[11px] md:text-xs text-center">{match.venue}</span>
								</div>
							)}

							<div className="mt-5 flex items-center gap-3">
								{/* Home Score */}
								<Controller
									name="homeTeamScore"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid} className="md:max-w-14 max-w-10">
											<input
												{...field}
												type="number"
												min={0}
												readOnly={predictionMode === 'DELETE'}
												value={field.value ?? ''}
												placeholder={`${prevPrediction?.homeTeamScore ?? 0}`}
												onChange={e =>
													field.onChange(e.target.value === '' ? undefined : +e.target.value)
												}
												className="md:size-14 size-10 rounded-2xl border bg-background text-center text-2xl md:text-4xl font-bold shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none no-toggle"
											/>

											{fieldState.invalid && (
												<FieldError
													className="mt-1 text-[10px]"
													errors={[{ message: 'Invalid' }]}
												/>
											)}
										</Field>
									)}
								/>
								<div className="text-2xl md:text-3xl font-bold text-muted-foreground">:</div>
								{/* Away Score */}
								<Controller
									name="awayTeamScore"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid} className="md:max-w-14 max-w-10">
											<input
												{...field}
												type="number"
												min={0}
												readOnly={predictionMode === 'DELETE'}
												value={field.value ?? ''}
												placeholder={`${prevPrediction?.awayTeamScore ?? 0}`}
												onChange={e =>
													field.onChange(e.target.value === '' ? undefined : +e.target.value)
												}
												className="md:size-14 size-10 rounded-2xl border bg-background text-center text-2xl md:text-4xl font-bold shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none no-toggle"
											/>

											{fieldState.invalid && (
												<FieldError
													className="mt-1 text-[10px]"
													errors={[{ message: 'Invalid' }]}
												/>
											)}
										</Field>
									)}
								/>
							</div>
						</div>

						{/* Away Team */}
						<div className="flex flex-1 flex-col items-center text-center">
							<Avatar className="size-17 md:size-28 rounded-full border bg-background shadow-md">
								<AvatarImage src={match.awayTeamBadgeUrl} />
								<AvatarFallback />
							</Avatar>

							<h3 className="mt-3 text-sm md:text-lg font-semibold leading-tight">
								{match.awayTeamName}
							</h3>
						</div>
					</div>
				</div>
			</ScrollArea>
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
