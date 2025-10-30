import { create } from 'zustand';

interface UiState {
  isAuthProcessing: boolean;
  setAuthProcessing: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isAuthProcessing: false,
  setAuthProcessing: (value: boolean) => set({ isAuthProcessing: value }),
}));


