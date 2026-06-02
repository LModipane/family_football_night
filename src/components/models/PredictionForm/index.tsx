'use client';

import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { useModel } from '@/hooks';
import { MatchEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PredictionSchema } from '@/types/formSchema';
import { Field, FieldError } from '@/components/ui/field';
import { ArrowRight, ArrowLeft, Asterisk } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
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
			setCarouselIndex,
			selectedMatchEventId,
		},
	} = useModel();
	const isModelOpen = type === 'Prediction' && isOpen; // Replace with actual logic to determine if the model should be open

	return (
		<Dialog open={isModelOpen} onOpenChange={() => onClose()}>
			<DialogContent className="text-black w-screen p-2 md:p-4">
				<DialogHeader className="flex flex-col items-center">
					<DialogTitle>Football Match Prediction Submission</DialogTitle>
					<DialogDescription>
						<p className="text-center text-sm">
							Share your match prediction by choosing the final scores for each team. Your
							submission will be locked once the match starts, so make your best call!
						</p>
					</DialogDescription>
				</DialogHeader>
				{predictionMode === 'CREATE' && (
					<CreatePredictionForm
						setCarouselIndex={setCarouselIndex}
						fixtures={fixtures}
						carouselIndex={carouselIndex}
						groupId={groupId}
						leagueTagId={leagueTagId}
						selectedMatchEventId={selectedMatchEventId}
					/>
				)}
				{predictionMode === 'EDIT' && groupId && leagueTagId && match ? (
					<Form
						match={match}
						groupId={groupId}
						close={() => onClose()}
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
							close={() => onClose()}
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
	setCarouselIndex: Dispatch<SetStateAction<number>> | undefined;
	fixtures: MatchEvent[] | undefined;
	carouselIndex: number | null | undefined;
	groupId: string | undefined;
	leagueTagId: string | undefined;
	selectedMatchEventId?: string | null;
};

const CreatePredictionForm = ({
	setCarouselIndex,
	fixtures,
	carouselIndex,
	groupId,
	leagueTagId,
	selectedMatchEventId
}: CreatePredictionFormProps) => {
	const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

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
		<div className="w-full overflow-hidden">
			{fixtures && fixtures.length > 0 ? (
				<div className="flex flex-col gap-y-3 ">
					<div className="w-full flex gap-x-3 justify-end">
						<button onClick={prevForm}>
							<ArrowLeft className="h-5 w-5" />
						</button>
						<button onClick={nextForm}>
							<ArrowRight className="h-5 w-5" />
						</button>
					</div>
					<Carousel setApi={setCarouselApi} opts={{ startIndex: carouselIndex ?? 0 }}>
						<CarouselContent className="flex gap-x-3">
							{fixtures.map(match => (
								<CarouselItem key={match.id}>
									<Form
										match={match}
										groupId={groupId ?? ''}
										leagueTagId={leagueTagId ?? ''}
										predictionMode="CREATE"
										selectedMatchEventId={selectedMatchEventId}
									/>
									{/* {match.awayTeamName} */}
								</CarouselItem>
							))}
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
	match: MatchEvent;
	groupId: string;
	leagueTagId: string;
	prevPrediction?: {
		id: string;
		homeTeamScore: number;
		awayTeamScore: number;
	};
	predictionMode: 'CREATE' | 'EDIT' | 'DELETE' | null;
	selectedMatchEventId?: string | null;
	close?: () => void;
};

const Form = ({
	match,
	groupId,
	leagueTagId,
	prevPrediction,
	predictionMode = 'CREATE',
	close,
	selectedMatchEventId = "Na",
}: FormProps) => {
	const router = useRouter();

	const form = useForm<z.infer<typeof PredictionSchema>>({
		defaultValues: {
			groupId,
			leagueTagId,
			matchEventId: match.id,
			predictionId: prevPrediction?.id,
			homeTeamScore: predictionMode === 'DELETE' ? prevPrediction?.homeTeamScore : undefined,
			awayTeamScore: predictionMode === 'DELETE' ? prevPrediction?.awayTeamScore : undefined,
		},
		resolver: zodResolver(PredictionSchema),
	});

	const submitPrediction = async (value: z.infer<typeof PredictionSchema>) => {
		try {
			if (predictionMode === 'DELETE' && prevPrediction && close) {
				await axios.delete(`/api/delete-prediction`, { data: value });
				toast.success('Successfully deleted Prediction');
				close();
			}
			if (predictionMode === 'EDIT' && prevPrediction && close) {
				await axios.put(`/api/edit-prediction`, value);
				toast.success('Successfully edited Prediction');
				close();
			}
			if (predictionMode === 'CREATE') {
				await axios.post('/api/create-prediction', value);
				toast.success('Successfully submitted Prediction');
			}
		} catch (error) {
			console.error('Failed to submit Prediction: ', error);
			toast.error(`Opps, failed to ${predictionMode === 'EDIT' ? 'edit' : 'submit'} Prediction!!!`);
		} finally {
			router.refresh();
		}
	};

	const handleError = (error: any) => {
		console.error(error);
	};

	return (
		<form
			className="h-fit w-full flex flex-col mx-auto"
			onSubmit={form.handleSubmit(submitPrediction, handleError)}>
			<div className="flex flex-row w-full h-50 md:h-55 justify-between items-center">
				<div className="h-full w-full flex flex-col items-center justify-center text-sm text-center">
					<Avatar className="h-full w-full md:max-w-28 md:max-h-28 max-h-20 max-w-20 ">
						<AvatarImage src={match.homeTeamBadgeUrl} className="w-full h-full" />
						<AvatarFallback />
					</Avatar>
					<h3 className="mt-2 font-semibold text-lg">{match.homeTeamName}</h3>
				</div>
				<div className="h-full w-fit flex flex-col justify-center items-center mb-15">
					<p className="text-md mb-0.5">{formatDate(match.kickOff.toDateString())}</p>
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
					<Avatar className="h-full w-full md:max-w-28 md:max-h-28 max-h-20 max-w-20 ">
						<AvatarImage src={match.awayTeamBadgeUrl} className="w-full h-full" />
						<AvatarFallback />
					</Avatar>
					<h3 className="mt-2 font-semibold text-lg">{match.awayTeamName}</h3>
				</div>
			</div>
			<div className="flex justify-end mt-auto">
				<Button>{predictionMode === 'EDIT' ? 'Edit' : 'Submit'}</Button>
			</div>
		</form>
	);
};
