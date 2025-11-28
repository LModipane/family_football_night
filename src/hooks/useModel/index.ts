import { Match } from '@/types';
import { create } from 'zustand';

type Model = 'Prediction' | null;
type ModelData = {
	fixtures?: Match[];
	carouselIndex?: number | null;
	setCarouselIndex?: React.Dispatch<React.SetStateAction<number | null>>;
};

type ModelStore = {
	type: Model;
	data: ModelData,
	onClose: () => void;
	onOpen: (type: Model, data: ModelData) => void;
};

const useModel = create<ModelStore>(set => ({
	data: {},
	type: null,
	onOpen: (type: Model, data: ModelData) => set({ type, data }),
	onClose: () => set({ type: null, data: {} }),
}));

export default useModel;
