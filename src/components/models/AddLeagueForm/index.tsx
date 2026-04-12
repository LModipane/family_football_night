'use client';

import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { useState } from 'react';
import { useModel } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TOURNOMINATE_SELECTIONS } from '@/contants';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from '@/components/ui/dialog';

const AddLeagueModel = () => {
	const router = useRouter();
	const { type, isOpen, onClose, data: { groupId } } = useModel();
	const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>([]);

	const isModelOpen = type === 'AddLeagueForm' && isOpen;

	const handleCheckboxChange = (leagueId: string) => {
		setSelectedLeagueIds(
			prev =>
				prev.includes(leagueId)
					? prev.filter(id => id !== leagueId) // remove if already selected
					: [...prev, leagueId], // add if not selected
		);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			await axios.post('/api/add-leagues', { selectedLeagueIds, groupId });
			toast.success('Leagues added to group successfully.');
			setSelectedLeagueIds([]);
			router.refresh();
			onClose();
		} catch (error) {
			console.error('Error adding leagues to group:', error);
			toast.error('Failed to add leagues to group. Please try again.');
		}
	};

	return (
		<Dialog open={isModelOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Leagues To Group</DialogTitle>
					<DialogDescription>Select the leagues you want to add to the group</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
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
												type="checkbox"
												id={item.tagId}
												value={item.tagId}
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
						<Button type="submit">Add Leagues</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddLeagueModel;
