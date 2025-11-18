'use client';

import { useModel } from '@/hooks';
import { useSession } from 'next-auth/react';

const CreatePredictionModelButton = () => {
	const { onOpen } = useModel();
    const { status } = useSession();

    const openModel = () => {
        if (status !== 'authenticated') return;
		onOpen('Prediction');
	};

	return (
		<div className="w-full mt-3" onClick={openModel}>
			<button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
				Create Prediction Model
			</button>
		</div>
	);
};

export default CreatePredictionModelButton;
