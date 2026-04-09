'use client';

import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { useState } from 'react';
import { useModel } from '@/hooks';
import { TOURNOMINATE_SELECTIONS } from '@/contants';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from '@/components/ui/dialog';

import {
	Select,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectLabel,
	SelectTrigger,
	SelectContent,
} from '@/components/ui/select';

const GroupFormModel = () => {
	const [name, setName] = useState<string>('');
	const [leagueTagId, setLeagueTagId] = useState<string>('');

	const { isOpen, onClose, type } = useModel();
	const isModelOpen = type === 'GroupForm' && isOpen; // Replace with actual logic to determine if the model should be open

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();

		try {
			await axios.post('/api/create-group', { leagueTagId, name });
		} catch (error) {
			console.error('Failed to create Group:', error);
			toast.error('Opps, failed to create group!!!');
		}
	};

	return (
		<Dialog open={isModelOpen} onOpenChange={onClose}>
			<DialogContent className="text-black">
				<DialogHeader>
					<DialogTitle>Group Form</DialogTitle>
					<DialogDescription>Create a group to invite frends to play with</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="max-w-md w-full mx-auto bg-white dark:bg-zinc-900 
             rounded-2xl p-2 space-y-6 dark:border-zinc-800">
					<div className="space-y-2">
						<label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Group Name:
						</label>

						<input
							required
							type="text"
							id="name"
							name="name"
							value={name}
							onChange={event => setName(event.target.value)}
							placeholder="Enter group name"
							className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700
                                bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 
                                focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
						/>
					</div>

					<Select onValueChange={value => setLeagueTagId(value)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Choose Group Tournominate " />
						</SelectTrigger>
						<SelectContent className="mt-20">
							<ScrollArea className="max-h-62.5 overflow-y-scroll">
								{TOURNOMINATE_SELECTIONS.map(obj => (
									<SelectGroup key={obj.category}>
										<SelectLabel>{obj.category}</SelectLabel>
										{obj.options.map(option => (
											<SelectItem
												key={option.tagId}
												value={option.tagId}
												className="cursor-pointer">
												<div className="flex items-center gap-2">
													<Image
														src={option.iconUrl}
														alt={option.name + '-Icon'}
														width={20}
														height={20}
													/>
													<span>{option.name}</span>
												</div>
											</SelectItem>
										))}
									</SelectGroup>
								))}
							</ScrollArea>
						</SelectContent>
					</Select>

					<div className="flex justify-end pt-4">
						<button
							type="submit"
							className="inline-flex items-center justify-center
                 rounded-xl bg-indigo-600
                 px-6 py-2.5 text-sm font-semibold text-white
                 shadow-md
                 hover:bg-indigo-700
                 active:scale-[0.98]
                 transition duration-200">
							Create Group
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default GroupFormModel;
