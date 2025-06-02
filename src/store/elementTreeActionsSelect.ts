import type { StoreApi } from 'zustand';
import type { DebugElement, ElementId } from '../types/elementTreeTypes';
import { updateAncestorDescendantFlags } from './elementTreeUtils';
import type { StoreType } from './useElementTreeStore';


export type ElementTreeActionsSelect = {
  toggleSelectedElement: (elementId: ElementId) => void;
  selectOnlyElement: (elementId: ElementId) => void;
  unselectAllElement: () => void;
  selectElement: (elementId: ElementId) => void;
  unselectElement: (elementId: ElementId) => void;
  selectedElement: () => DebugElement[];
}

export function createElementTreeActionsSelect(  set: StoreApi<StoreType>["setState"], get: StoreApi<StoreType>["getState"]) {
  return {
  

    toggleSelectedElement: (elementId: ElementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
      set(state => {
        // saveToHistory(state)

        const element = state.elementMap[elementId];
        element.selected = !element.selected;
        updateAncestorDescendantFlags(state.elementMap);
        return state;
      });
    },

    selectOnlyElement: (elementId: ElementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
      set(state => {
        // saveToHistory(state)

        Object.values(state.elementMap).forEach(el => {
          el.selected = false;
        });

        const element = state.elementMap[elementId];
        element.selected = true;
        updateAncestorDescendantFlags(state.elementMap);
        return state;
      });
    },

    unselectAllElement: () => {
      set(state => {
        // saveToHistory(state)

        Object.values(state.elementMap).forEach(el => {
          el.selected = false;
        });
        updateAncestorDescendantFlags(state.elementMap);
        return state;
      });
    },

    
    selectElement: (elementId: ElementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
      
      set(state => {
        // saveToHistory(state);
    
        const element = state.elementMap[elementId];
        element.selected = true;
        updateAncestorDescendantFlags(state.elementMap);
        return state;
      });
    },

    unselectElement: (elementId: ElementId) => {
      set(state => {
        // saveToHistory(state);
    
        const element = state.elementMap[elementId];
        element.selected = false;
        updateAncestorDescendantFlags(state.elementMap);
        return state;
      });
    },
    
    selectedElement: () => {
      const state = get();
      return Object.values(state.elementMap).filter(el => el.selected);
    },




  };
}
