import { useContext } from 'react';
import { PredictionContext } from '@/components/PredictionContextProvider';

const usePredictionContext = () => {
	const context = useContext(PredictionContext);
	if (!context) {
		throw new Error('usePredictionContext must be used within a PredictionContextProvider');
	}
	return context;
};

export default usePredictionContext;
