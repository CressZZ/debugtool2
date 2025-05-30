import { createContext, useReducer, type Dispatch } from "react";
import { produce } from "immer";
import type { ReactNode } from "react";

// --- 타입 정의 ---
export type ElementId = string;

export type DebugElement = {
  id: ElementId;
  tagName: string;
  className: string[];
  parentId?: string;
  selected: boolean;
  hidden: boolean;
  children: ElementId[];
  positionType: 'margin' | 'transform';
  style: {
    marginTop: string;
    marginLeft: string;
    top: string;
    left: string;
    position: string;
    background: string;
    backgroundImage: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    display: string;
    transformTranslateX:string;
    transformTranslateY:string;
  };
};

export type ElementMap = Record<ElementId, DebugElement>;

export type ElementTreeState = {
  elementMap: ElementMap;
  rootElementId: ElementId[];
};

export type ElementTreeAction =
  | { type: "SET_ELEMENT_MAP"; payload: { elementMap: ElementMap; rootElementId: ElementId[] } }
  | { type: "TOGGLE_SELECTED_ELEMENT"; payload: { elementId: ElementId } }
  | { type: "SELECTED_ELEMENT"; payload: { elementId: ElementId } }
  | { type: "UNSELECT_ELEMENT"; payload: { elementId: ElementId } }
  | { type: "UNSELECT_ALL_ELEMENT"}
  | { type: "SELECT_ONLY_ELEMENT"; payload: { elementId: ElementId } }
  | { type: "UPDATE_ELEMENT_STYLE"; payload: { elementId: ElementId; style: Partial<DebugElement["style"]> } }
  | { type: "UPDATE_MULTIPLE_ELEMENTS_STYLE"; payload: Record<ElementId, Partial<DebugElement["style"]>> }
  | { type: "UPDATE_ELEMENT_POSITION"; payload: { elementId: ElementId; x: number, y: number } }
  | { type: "TOGGLE_HIDDEN_ELEMENT"; payload: { elementId: ElementId } }
  | { type: "TOGGLE_HIDDEN_ALL_ELEMENT"; };

// --- Reducer ---
const elementTreeReducer = (state: ElementTreeState, action: ElementTreeAction): ElementTreeState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SET_ELEMENT_MAP":
        draft.elementMap = { ...draft.elementMap, ...action.payload.elementMap };
        draft.rootElementId = [...draft.rootElementId, ...action.payload.rootElementId];
        break;

      // 안쓸수도 있지
      case "TOGGLE_SELECTED_ELEMENT": {
        if(draft.rootElementId.includes(action.payload.elementId)) return;

        const el = draft.elementMap[action.payload.elementId];
        el.selected = !el.selected;
        break;
      }

      case "SELECTED_ELEMENT": {
        if(draft.rootElementId.includes(action.payload.elementId)) return;

        draft.elementMap[action.payload.elementId].selected = true;
        
        break;
      }

      case "UPDATE_ELEMENT_STYLE": {
        Object.assign(draft.elementMap[action.payload.elementId].style, action.payload.style);
        break;
      }

      case "UPDATE_MULTIPLE_ELEMENTS_STYLE": {
        for (const [elementId, style] of Object.entries(action.payload)) {
          Object.assign(draft.elementMap[elementId].style, style);
        }
        break;
      }

      case "UNSELECT_ALL_ELEMENT": {
        Object.values(draft.elementMap).forEach(element => {
          element.selected = false;
        });
        
        break;
      }
      case "UNSELECT_ELEMENT": {
        draft.elementMap[action.payload.elementId].selected = false;
        break;
      }

      case "SELECT_ONLY_ELEMENT": {
        if(draft.rootElementId.includes(action.payload.elementId)) return;

        Object.values(draft.elementMap).forEach(el => {
          el.selected = false;
        });
        draft.elementMap[action.payload.elementId].selected = true;
        break;
    }

      case "TOGGLE_HIDDEN_ELEMENT": {
        if (draft.rootElementId.includes(action.payload.elementId)) return;

        const parentElement = draft.elementMap[action.payload.elementId];
        const newHiddenState = !parentElement.hidden;
      
        const toggleRecursive = (elementId: string, hidden: boolean) => {
          const el = draft.elementMap[elementId];
          el.hidden = hidden;
      
          el.children.forEach(childId => {
            toggleRecursive(childId, hidden);
          });
        };
      
        toggleRecursive(action.payload.elementId, newHiddenState);
        break;
      
      }

      case "TOGGLE_HIDDEN_ALL_ELEMENT": {
        const isHidden = Object.values(draft.elementMap).some(element => element.hidden);
        Object.values(draft.elementMap).forEach(element => {
          if(draft.rootElementId.includes(element.id)) return;
          element.hidden = !isHidden;
        });
        break;
      }
    }
  });
};

// --- Context 분리 ---
const ElementTreeStateContext = createContext<ElementTreeState>({
  elementMap: {},
  rootElementId: [],
});

const ElementTreeDispatchContext = createContext<Dispatch<ElementTreeAction>>(() => {});

// --- Provider ---
export const ElementTreeProvider = ({ children }: { children: ReactNode }) => {
  const [ElementTree, ElementTreeDispatch] = useReducer(elementTreeReducer, {
    elementMap: {},
    rootElementId: [],
  });

  return (
    <ElementTreeStateContext.Provider value={ElementTree}>
      <ElementTreeDispatchContext.Provider value={ElementTreeDispatch}>
        {children}
      </ElementTreeDispatchContext.Provider>
    </ElementTreeStateContext.Provider>
  );
};

// --- Export ---
export { ElementTreeStateContext, ElementTreeDispatchContext };
