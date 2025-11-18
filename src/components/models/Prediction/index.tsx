'use client';

import { useModel } from '@/hooks';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const PredictionModel = () => {
	const { type, onClose } = useModel();
	const isModelOpen = type === 'Prediction'; // Replace with actual logic to determine if the model should be open

	return (
		<Dialog open={isModelOpen} onOpenChange={() => onClose()}>
			<DialogContent>Prediction Model Content</DialogContent>
		</Dialog>
	);
};

export default PredictionModel;
