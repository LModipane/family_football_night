import { Match } from '@/types';
import { create } from 'zustand';

type Model = 'Prediction' | "SIGN-IN" | null;
type ModelData = {
	profileId?: string;
	fixtures?: Match[];
	carouselIndex?: number | null;
	setCarouselIndex?: React.Dispatch<React.SetStateAction<number | null>>;
};

type ModelStore = {
	type: Model;
	data: ModelData;
	isOpen: boolean;
	onClose: () => void;
	onOpen: (type: Model, data: ModelData) => void;
};

const useModel = create<ModelStore>(set => ({
	data: {},
	type: null,
	isOpen: false,
	onOpen: (type: Model, data: ModelData) => set({ type, data, isOpen: true }),
	onClose: () => set({ type: null, data: {}, isOpen: false }),
}));

export default useModel;
