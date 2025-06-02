import type { StoreApi } from 'zustand';
import { saveCurrentToFuture, saveToHistory } from './elementTreeUtils';
import type { ElementTreeState, StoreType } from './useElementTreeStore';

export type ElementTreeActionsHistory = {
  undo: () => void;
  redo: () => void;
}

export function createElementTreeActionsHistory(set: StoreApi<StoreType>["setState"]) {
  return {
    undo: () => {
      set((state: ElementTreeState) => {
        if (state.history.past.length > 1) {
          const prev = state.history.past.pop()!;
          saveCurrentToFuture(state);
          state.elementMap = prev;
        }
        return state;
      });
    },

    redo: () => {
      set((state: ElementTreeState) => {
        if (state.history.future.length > 0) {
          const next = state.history.future.pop()!;
          saveToHistory(state);
          state.elementMap = next;
        }
        return state;
      });
    },
  };
}
