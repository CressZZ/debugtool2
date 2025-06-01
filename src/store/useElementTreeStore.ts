import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ElementId, DebugElement, ElementMap } from '../types/elementTreeTypes';
import { devtools } from 'zustand/middleware';
import { createSelector } from 'reselect';

// --- Helper ---
export function saveToHistory(state: { history: History; elementMap: ElementMap }, max = 200) {
  state.history.past.push(JSON.parse(JSON.stringify(state.elementMap)));
  if (state.history.past.length > max) state.history.past.shift();
  state.history.future = [];
}

export function saveCurrentToFuture(state: { history: History; elementMap: ElementMap }) {
  state.history.future.push(JSON.parse(JSON.stringify(state.elementMap)));
}

function updateAncestorDescendantFlags(elementMap: Record<string, DebugElement>) {
  Object.values(elementMap).forEach(el => {
    el.isAnyAncestorSelected = false;
    el.isAnyDescendantSelected = false;
  });

  const selectedElements = Object.values(elementMap).filter(el => el.selected);

  selectedElements.forEach(selectedEl => {
    const visitedParents = new Set<string>();
    let current = selectedEl;
    while (current.parentId) {
      const parent = elementMap[current.parentId];
      if (!parent) break;

      if (!visitedParents.has(parent.id)) {
        parent.isAnyDescendantSelected = true;
        visitedParents.add(parent.id);
      }

      current = parent;
    }

    const visitedChildren = new Set<string>();
    const propagateToChildren = (element: DebugElement) => {
      element.children.forEach(childId => {
        const child = elementMap[childId];
        if (!child) return;

        if (!visitedChildren.has(child.id)) {
          child.isAnyAncestorSelected = true;
          visitedChildren.add(child.id);
          propagateToChildren(child);
        }
      });
    };

    propagateToChildren(selectedEl);
  });
}

// --- Store ---
type History = {
  past: ElementMap[];
  future: ElementMap[];
};

type ElementTreeState = {
  elementMap: ElementMap;
  rootElementId: ElementId[];
  history: History;

  setElementMap: (elementMap: ElementMap, rootElementId: ElementId[]) => void;
  toggleSelectedElement: (elementId: ElementId) => void;

  selectElement: (elementId: ElementId) => void;
  unselectElement: (elementId: ElementId) => void;
  unselectAllElement: () => void;
  selectOnlyElement: (elementId: ElementId) => void;

  updateElementStyle: (elementId: ElementId, style: Partial<DebugElement['style']>) => void;
  updateMultipleElementsStyle: (updates: Record<ElementId, Partial<DebugElement['style']>>) => void;
  updateElementPosition: (elementId: ElementId, x: number, y: number) => void;

  toggleHiddenElement: (elementId: ElementId) => void;
  toggleHiddenAllElement: () => void;

  updateElementPositionType: (elementId: ElementId, positionType: 'margin' | 'transform') => void;

  undo: () => void;
  redo: () => void;

  resetElementMap: () => void;

  selectedElement: () => DebugElement[];
 
};

export const useElementTreeStore = create<ElementTreeState>()(
  devtools(immer((set, get) => ({
    elementMap: {},
    rootElementId: [],
    history: {
      past: [],
      future: [],
    },

    setElementMap: (elementMap, rootElementId) => {
      set(state => {
        saveToHistory(state)

        state.elementMap = { ...state.elementMap, ...elementMap };
        state.rootElementId = [...state.rootElementId, ...rootElementId];
      });
    },

    toggleSelectedElement: (elementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
      set(state => {
        saveToHistory(state)

        const element = state.elementMap[elementId];
        element.selected = !element.selected;
        updateAncestorDescendantFlags(state.elementMap);
      });
    },

    selectOnlyElement: (elementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
      set(state => {
        saveToHistory(state)

        Object.values(state.elementMap).forEach(el => {
          el.selected = false;
        });

        const element = state.elementMap[elementId];
        element.selected = true;
        updateAncestorDescendantFlags(state.elementMap);
      });
    },

    unselectAllElement: () => {
      set(state => {
        saveToHistory(state)

        Object.values(state.elementMap).forEach(el => {
          el.selected = false;
        });
        updateAncestorDescendantFlags(state.elementMap);
      });
    },

    updateElementStyle: (elementId, style) => {
      set(state => {
        saveToHistory(state)

        Object.assign(state.elementMap[elementId].style, style);
      });
    },

    undo: () => {
      set(state => {
        if (state.history.past.length > 1) {
          const prev = state.history.past.pop()!;
          saveCurrentToFuture(state);
          state.elementMap = prev;
        }
      });
    },

    redo: () => {
      set(state => {
        if (state.history.future.length > 0) {
          const next = state.history.future.pop()!;
          saveToHistory(state);
          state.elementMap = next;
        }
      });
    },

    resetElementMap: () => {
      set(state => {
        saveToHistory(state)

        state.elementMap = {};
        state.rootElementId = [];
      });
    },

    updateMultipleElementsStyle: (updates) => {
      set(state => {
        saveToHistory(state);
    
        for (const [elementId, style] of Object.entries(updates)) {
          Object.assign(state.elementMap[elementId].style, style);
        }
      });
    },
    
    updateElementPosition: (elementId, x, y) => {
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
      });
    },
    
    toggleHiddenElement: (elementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
    
      set(state => {
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
      });
    },
    
    updateElementPositionType: (elementId, positionType) => {
      set(state => {
        saveToHistory(state);
    
        const element = state.elementMap[elementId];
        if (element) {
          element.positionType = positionType;
        }
      });
    },

    selectElement: (elementId: ElementId) => {
      const state = get();
      if (state.rootElementId.includes(elementId)) return;
      
      set(state => {
        saveToHistory(state);
    
        const element = state.elementMap[elementId];
        element.selected = true;
        updateAncestorDescendantFlags(state.elementMap);
      });
    },

    unselectElement: (elementId: ElementId) => {
      set(state => {
        saveToHistory(state);
    
        const element = state.elementMap[elementId];
        element.selected = false;
        updateAncestorDescendantFlags(state.elementMap);
      });
    },
    
    selectedElement: () => {
      const state = get();
      return Object.values(state.elementMap).filter(el => el.selected);
    },


  })))
);


export const selectedElementsSelector = createSelector(
  // input selector
  (state: ElementTreeState) => state.elementMap,
  
  // output 계산 함수
  (elementMap) => {
    return Object.values(elementMap).filter(el => el.selected);
  }
);


export const selectedElementIdsSelector = createSelector(
  // input selector
  (state: ElementTreeState) => state.elementMap,
  
  // output 계산 함수
  (elementMap) => {
    return Object.values(elementMap).filter(el => el.selected).map(el => el.id);
  }
);