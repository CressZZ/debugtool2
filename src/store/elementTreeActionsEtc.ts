import type { StoreApi } from 'zustand';
import type { ElementTreeState } from './useElementTreeStore';
import { saveToHistory, saveCurrentToFuture, updateAncestorDescendantFlags } from './elementTreeUtils';
import type { ElementId, ElementMap } from '../types/elementTreeTypes';

export type ElementTreeActionsEtc = {
  resetElementMap: () => void;
  setElementMap: (elementMap: ElementMap, rootElementId: ElementId[]) => void;
  toggleHiddenElement: (elementId: ElementId) => void;
  toggleHiddenAllElement: () => void;
  reset: () => void;
}

export function createElementTreeActionsEtc(  set: StoreApi<ElementTreeState>["setState"], get: StoreApi<ElementTreeState>["getState"]) {
  return {
    reset: () => {
      set({
        elementMap: {},
        rootElementId: [],
        history: {
          past: [],
          future: [],
        },
      });
    },

    resetElementMap: () => {
      set((state: ElementTreeState) => {
        saveToHistory(state)

        state.elementMap = {};
        state.rootElementId = [];
        return state;
      });
    },

    setElementMap: (elementMap: ElementMap, rootElementId: ElementId[]) => {
      set((state: ElementTreeState) => {
        saveToHistory(state)

        state.elementMap = { ...state.elementMap, ...elementMap };
        state.rootElementId = [...state.rootElementId, ...rootElementId];
        return state;
      });
    },

    toggleHiddenElement: (elementId: ElementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
    
      set((state: ElementTreeState) => {
        saveToHistory(state);
    
        const element = state.elementMap[elementId];
        const newHiddenState = !element.hidden;
    
        // 자식 방향 hidden 토글
        const toggleDescendants = (elementId: string, hidden: boolean) => {
          const el = state.elementMap[elementId];
          el.hidden = hidden;
    
          el.children.forEach(childId => {
            toggleDescendants(childId, hidden);
          });
        };
    
        // 부모 방향 숨김 해제 (visible 로만 propagate)
        const showAncestors = (elementId: string) => {
          const el = state.elementMap[elementId];
    
          if (state.rootElementId.includes(elementId)) return;
    
          if (el.parentId) {
            const parent = state.elementMap[el.parentId];
            if (parent.hidden) {
              parent.hidden = false;
              showAncestors(parent.id);
            }
          }
        };
    
        toggleDescendants(elementId, newHiddenState);
    
        if (newHiddenState === false) {
          showAncestors(elementId);
        }
        return state;
      });
    },
    
    toggleHiddenAllElement: () => {
      set(state => {
        saveToHistory(state);
    
        const isHidden = Object.values(state.elementMap).some(element => element.hidden);
        Object.values(state.elementMap).forEach(element => {
          if (state.rootElementId.includes(element.id)) return;
          element.hidden = !isHidden;
        });
        return state;
      });
    },
    

  };
}
