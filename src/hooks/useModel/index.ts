import { Match } from '@/types';
import { create } from 'zustand';
import type { Dispatch, SetStateAction } from 'react';

type Model = 'Prediction' | 'SIGN-IN' | null;
type ModelData = {
	fixtures?: Match[];
	carouselIndex?: number | null;
	setCarouselIndex?: Dispatch<SetStateAction<number>>;
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
