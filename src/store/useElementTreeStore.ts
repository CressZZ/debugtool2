import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ElementId, DebugElement, ElementMap } from '../types/elementTreeTypes';
import { devtools } from 'zustand/middleware';
import { createSelector } from 'reselect';
import { shallow } from 'zustand/shallow';
import { saveCurrentToFuture, saveToHistory, updateAncestorDescendantFlags } from './elementTreeUtils';
import { createElementTreeActionsEtc, type ElementTreeActionsEtc } from './elementTreeActionsEtc';
import { createElementTreeActionsStyle, type ElementTreeActionsStyle } from './elementTreeActionsStyle';
import { createElementTreeActionsSelect, type ElementTreeActionsSelect } from './elementTreeActionsSelect';
import { createElementTreeActionsHistory, type ElementTreeActionsHistory } from './elementTreeActionsHistory';

// --- Store ---
export type History = {
  past: ElementMap[];
  future: ElementMap[];
};

export type ElementTreeState = {
  elementMap: ElementMap;
  rootElementId: ElementId[];
  history: History;
} & ElementTreeActionsSelect & ElementTreeActionsStyle & ElementTreeActionsHistory & ElementTreeActionsEtc;

export const useElementTreeStore = create<ElementTreeState>()(
  devtools(immer((set, get) => ({
    elementMap: {},
    rootElementId: [],
    history: {
      past: [],
      future: [],
    },

    ...createElementTreeActionsEtc(set, get),
    ...createElementTreeActionsSelect(set, get),
    ...createElementTreeActionsStyle(set, get),
    ...createElementTreeActionsHistory(set),

  })))
);


