import { MatchEvent } from '@/types';
import { create } from 'zustand';
import type { Dispatch, SetStateAction } from 'react';

type Model = 'Prediction' | 'SIGN-IN' | 'GroupForm' | 'Invite-Member' | 'AddLeagueForm' | null;

type ModelData = {
	groupId?: string;
	fixtures?: MatchEvent[];
	carouselIndex?: number | null;
	setCarouselIndex?: Dispatch<SetStateAction<number>>;
	leagueTagId?: string;
	inviteCode?: string;
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
	onClose: () => set({ type: null, data: {}, isOpen: false }),
	onOpen: (type: Model, data: ModelData) => set({ type, data, isOpen: true }),
}));

export default useModel;
