'use client';

import * as z from 'zod';
import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { useState } from 'react';
import { useModel } from '@/hooks';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { addLeagueSchema } from '@/types/formSchema';
import { TOURNOMINATE_SELECTIONS } from '@/contants';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from '@/components/ui/dialog';
import { Loader } from 'lucide-react';

const AddLeagueModel = () => {
	const router = useRouter();

	const {
		type,
		isOpen,
		onClose,
		data: { groupId },
	} = useModel();

	const [isLoading, setIsLoading] = useState(false);

	const isModelOpen = type === 'AddLeagueForm' && isOpen;

	// ✅ useForm as state manager
	const form = useForm<z.infer<typeof addLeagueSchema>>({
		defaultValues: {
			leagueIds: [],
			groupId,
		},
		resolver: zodResolver(addLeagueSchema),
	});

	const selectedLeagueIds = form.watch('leagueIds');

	const handleCheckboxChange = (leagueId: string) => {
		const current = form.getValues('leagueIds');

		if (current.includes(leagueId)) {
			form.setValue(
				'leagueIds',
				current.filter(id => id !== leagueId),
			);
		} else {
			form.setValue('leagueIds', [...current, leagueId]);
		}
		form.setValue('groupId', groupId!); // ✅ ensure groupId is always set
	};

	const handleSubmit = async (values: z.infer<typeof addLeagueSchema>) => {
		try {
			setIsLoading(true);
			await axios.post('/api/add-leagues', values);

			onClose();
			form.reset(); // ✅ reset form state
			router.refresh();
			toast.success('Leagues added to group successfully.', { id: 'add-leagues' });
		} catch (error) {
			console.error('Error adding leagues to group:', error);
			toast.error('Failed to add leagues to group. Please try again.', { id: 'add-leagues' });
		} finally {
			setIsLoading(false);
		}
	};

	const handleError = (errors: any) => {
		console.error('Form validation errors:', errors);
		toast.error('Please select at least one league to add.', { id: 'add-leagues' });
	};

	return (
		<Dialog open={isModelOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Leagues To Group</DialogTitle>
					<DialogDescription>Select the leagues you want to add to the group</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="space-y-6">
					<ScrollArea className="h-100 w-full rounded-md border">
						{TOURNOMINATE_SELECTIONS.map(league => (
							<div key={league.category} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
								<h3 className="text-lg font-semibold text-gray-800">{league.category}</h3>

								<hr className="border-gray-200" />

								<div className="space-y-3">
									{league.options.map(item => (
										<label
											key={item.tagId}
											htmlFor={item.tagId}
											className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition">
											<input
												id={item.tagId}
												type="checkbox"
												checked={selectedLeagueIds.includes(item.tagId)}
												onChange={() => handleCheckboxChange(item.tagId)}
												className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
											/>

											<div className="flex items-center gap-3">
												<Image
													src={item.iconUrl}
													alt={`${item.name} logo`}
													width={30}
													height={30}
													className="rounded-full"
												/>
												<span className="text-gray-700 text-sm font-medium">{item.name}</span>
											</div>
										</label>
									))}
								</div>
							</div>
						))}
					</ScrollArea>

					<div className="flex justify-end mt-4">
						<Button
							type="submit"
							// disabled={selectedLeagueIds.length === 0} // ✅ UX improvement
						>
							Add Leagues
							{isLoading && <Loader className="ml-2 animate-spin" size={16} />}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddLeagueModel;
