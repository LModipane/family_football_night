'use client';

import Image from 'next/image';
import { useModel } from '@/hooks';
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
	const { type, isOpen, onClose } = useModel();

	const isModelOpen = type === 'AddLeagueForm' && isOpen;
	const handleAddLeague = (leagueIds: string[]) => {
		// make api call to add league to group
	};

	return (
		<Dialog open={isModelOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Leagues To Group</DialogTitle>
					<DialogDescription>Select the leagues you want to add to the group</DialogDescription>
				</DialogHeader>
				{/* Add List UI to select Leagues to add to the group */}
				<form>
					<ScrollArea className="h-100 w-full rounded-md border">
						{TOURNOMINATE_SELECTIONS.map(league => (
							<div className="bg-white rounded-2xl shadow-md p-5 space-y-4 " id={league.category}>
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
												name={item.name}
												value={item.tagId}
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
						<Button type="submit" onClick={() => handleAddLeague([])}>
							Add Leagues
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddLeagueModel;
