import type { StoreApi } from 'zustand';
import type { ElementId } from '../types/elementTreeTypes';
import { saveToHistory } from './elementTreeUtils';
import type { StoreType } from './useElementTreeStore';

export type ElementTreeActionsStyle = {
  updateMultipleElementsStyle: (updates: Record<string, Partial<CSSStyleDeclaration>>) => void;
  updateElementPosition: (elementId: ElementId, x: number, y: number) => void;
  updateElementPositionType: (elementId: ElementId, positionType: 'margin' | 'transform') => void;
  updateElementStyle: (elementId: ElementId, style: Partial<CSSStyleDeclaration>) => void;
}

export function createElementTreeActionsStyle(
  set: StoreApi<StoreType>["setState"]
) {
  return {


    updateMultipleElementsStyle: (updates: Record<string, Partial<CSSStyleDeclaration>>) => {
      set(state => {
        saveToHistory(state);
    
        for (const [elementId, style] of Object.entries(updates)) {
          Object.assign(state.elementMap[elementId].style, style);
        }
        return state;
      });
    },
    
    updateElementPosition: (elementId: ElementId, x: number, y: number) => {
      set(state => {
        saveToHistory(state);
    
        const element = state.elementMap[elementId];
        if (element.positionType === 'margin') {
          element.style.marginLeft = `${x}px`;
          element.style.marginTop = `${y}px`;
        } else if (element.positionType === 'transform') {
          element.style.transformTranslateX = `${x}px`;
          element.style.transformTranslateY = `${y}px`;
        }
        return state;
      });
    },
    
    updateElementPositionType: (elementId: ElementId, positionType: 'margin' | 'transform') => {
      set(state => {
        saveToHistory(state);
    
        const element = state.elementMap[elementId];
        if (element) {
          element.positionType = positionType;
        }
        return state;
      });
    },

    updateElementStyle: (elementId: ElementId, style: Partial<CSSStyleDeclaration>) => {
      set(state => {
        saveToHistory(state)

        Object.assign(state.elementMap[elementId].style, style);
        return state;
      });
    },
    

  };
}
