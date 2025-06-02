
import { create } from 'zustand';

type DebugBackgroundState = {
  opacity: number;
  isInverted: boolean;
  setOpacity: (v: number) => void;
  setIsInverted: (v: boolean) => void;
  reset: () => void;
};

export const useDebugBackgroundStore = create<DebugBackgroundState>((set) => ({
  opacity: 0.5,
  isInverted: false,
  setOpacity: (v) => set({ opacity: v }),
  setIsInverted: (v) => set({ isInverted: v }),
  reset: () => set({ opacity: 0.5, isInverted: false }),
}));
