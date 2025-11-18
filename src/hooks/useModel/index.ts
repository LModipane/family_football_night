import { create } from 'zustand';

type Model = 'Prediction' | null;

type ModelStore = {
	type: Model;
	onOpen: (type: Model) => void;
	onClose: () => void;
};

const useModel = create<ModelStore>(set => ({
	type: null,
	onOpen: (type: Model) => set({ type }),
	onClose: () => set({ type: null }),
}));

export default useModel;
