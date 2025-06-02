import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ElementId, ElementMap } from '../types/elementTreeTypes';
import { createElementTreeActionsEtc, type ElementTreeActionsEtc } from './elementTreeActionsEtc';
import { createElementTreeActionsHistory, type ElementTreeActionsHistory } from './elementTreeActionsHistory';
import { createElementTreeActionsSelect, type ElementTreeActionsSelect } from './elementTreeActionsSelect';
import { createElementTreeActionsStyle, type ElementTreeActionsStyle } from './elementTreeActionsStyle';

// --- Store ---
export type History = {
  past: ElementMap[];
  future: ElementMap[];
};

export type ElementTreeState = {
  elementMap: ElementMap;
  rootElementId: ElementId[];
  history: History;
};

export type ElementTreeActions = ElementTreeActionsSelect & ElementTreeActionsStyle & ElementTreeActionsHistory & ElementTreeActionsEtc;

export type StoreType = ElementTreeState & ElementTreeActions;

export const useElementTreeStore = create<StoreType>()(
  devtools(immer((set, get) => ({
    elementMap: {},
    rootElementId: [],
    history: {
      past: [],
      future: [],
    },

    ...createElementTreeActionsEtc(set, get),
    ...createElementTreeActionsSelect(set, get),
    ...createElementTreeActionsStyle(set),
    ...createElementTreeActionsHistory(set),

  })))
);


