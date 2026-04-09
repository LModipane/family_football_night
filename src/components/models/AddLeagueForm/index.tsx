'use client';

import { useModel } from '@/hooks';

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
    
	return (
		<Dialog open={isModelOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Leagues To Group</DialogTitle>
					<DialogDescription>Select the leagues you want to add to the group</DialogDescription>
				</DialogHeader>
				<div className="">List of legues</div>
			</DialogContent>
		</Dialog>
	);
};

export default AddLeagueModel;
