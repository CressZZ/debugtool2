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
  isAnyAncestorSelected: boolean;
  isAnyDescendantSelected: boolean;
  hidden: boolean;
  children: ElementId[];
  positionType: 'margin' | 'transform';

  style: {
    marginTop: string;
    marginLeft: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
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
    pointerEvents: string;
  };
};

export type ElementMap = Record<ElementId, DebugElement>;

export type ElementTreeState = {
  elementMap: ElementMap;
  rootElementId: ElementId[];
  history: {
    past: ElementMap[];
    future: ElementMap[];
  };
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
  | { type: "TOGGLE_HIDDEN_ALL_ELEMENT"; }
  | { type: "UPDATE_ELEMENT_POSITION_TYPE"; payload: { elementId: ElementId; positionType: 'margin' | 'transform' } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET_ELEMENT_MAP" };

  function updateAncestorDescendantFlags(elementMap: Record<string, DebugElement>) {
    // 1️⃣ 모든 노드의 플래그 초기화
    Object.values(elementMap).forEach(el => {
      el.isAnyAncestorSelected = false;
      el.isAnyDescendantSelected = false;
    });
  
    // 2️⃣ 현재 selected 된 노드들만 찾기
    const selectedElements = Object.values(elementMap).filter(el => el.selected);
  
    // 3️⃣ selected 노드들 각각 처리
    selectedElements.forEach(selectedEl => {
      // --- 부모 방향 업데이트 (while 사용) ---
  
      /**
       * 부모는 "parentId" 를 따라 "단방향으로" 타고 올라가는 구조다.
       * 
       * → 구조가 선형 (1 → 1 → 1 ... 루트까지)
       * → 트리 depth 가 깊어져도 while 사용하면 stack overflow 걱정 없음.
       * → 성능적으로도 while 이 반복문 최적화가 잘 되어 있음 (V8 기준).
       */
      const visitedParents = new Set<string>(); // 중복 처리 방지 (여러 selected 노드 처리 시)
  
      let current = selectedEl;
      while (current.parentId) {
        const parent = elementMap[current.parentId];
        if (!parent) break;
  
        // 중복 업데이트 방지
        if (!visitedParents.has(parent.id)) {
          parent.isAnyDescendantSelected = true;
          visitedParents.add(parent.id);
        }
  
        // 다음 부모로 이동
        current = parent;
      }
  
      // --- 자식 방향 업데이트 (재귀 사용) ---
  
      /**
       * 자식 방향은 "children" 배열을 타고 내려가는 구조다.
       * 
       * → 구조가 트리 구조 (1 → N → N...)
       * → 자연스럽게 재귀로 표현 가능
       * → 코드 가독성도 높음
       */
      const visitedChildren = new Set<string>(); // 중복 처리 방지 (여러 selected 노드 처리 시)
  
      const propagateToChildren = (element: DebugElement) => {
        element.children.forEach(childId => {
          const child = elementMap[childId];
          if (!child) return;
  
          // 중복 업데이트 방지
          if (!visitedChildren.has(child.id)) {
            child.isAnyAncestorSelected = true;
            visitedChildren.add(child.id);
  
            // 재귀적으로 자식 처리
            propagateToChildren(child);
          }
        });
      };
  
      // 재귀 시작
      propagateToChildren(selectedEl);
    });
  }

  
// --- Reducer ---
const elementTreeReducer = (state: ElementTreeState, action: ElementTreeAction): ElementTreeState => {
  return produce(state, (draft) => {

    const saveToHistory = () => {
      draft.history.past.push(JSON.parse(JSON.stringify(draft.elementMap)));
    
      // MAX_HISTORY 초과하면 오래된 걸 앞에서 제거
      if (draft.history.past.length > 200) {
        draft.history.past.shift();
      }
    
      draft.history.future = []; // redo는 새 변경시 초기화
    };
    switch (action.type) {
      case "RESET_ELEMENT_MAP": {
        saveToHistory();
        draft.elementMap = {};
        draft.rootElementId = [];
        break;
      }
      case "SET_ELEMENT_MAP": {
        saveToHistory();
        draft.elementMap = { ...draft.elementMap, ...action.payload.elementMap };
        draft.rootElementId = [...draft.rootElementId, ...action.payload.rootElementId];
        break;
      }

      case "TOGGLE_SELECTED_ELEMENT": {
        if (draft.rootElementId.includes(action.payload.elementId)) return;
        saveToHistory();
        const element = draft.elementMap[action.payload.elementId];
        element.selected = !element.selected;
        updateAncestorDescendantFlags(draft.elementMap);
        break;
      }

      case "SELECTED_ELEMENT": {
        if (draft.rootElementId.includes(action.payload.elementId)) return;
        saveToHistory();

        const element = draft.elementMap[action.payload.elementId];
        element.selected = true;
        updateAncestorDescendantFlags(draft.elementMap);
        break;
      }

      case "UNSELECT_ALL_ELEMENT": {
        saveToHistory();

        Object.values(draft.elementMap).forEach(element => {
          element.selected = false;
        });
        updateAncestorDescendantFlags(draft.elementMap);
        break;
      }

      case "UNSELECT_ELEMENT": {
        saveToHistory();

        const element = draft.elementMap[action.payload.elementId];
        element.selected = false;
        updateAncestorDescendantFlags(draft.elementMap);
        break;
      }

      case "SELECT_ONLY_ELEMENT": {
        if (draft.rootElementId.includes(action.payload.elementId)) return;
        saveToHistory();
        
        Object.values(draft.elementMap).forEach(el => {
          el.selected = false;
        });

        const element = draft.elementMap[action.payload.elementId];
        element.selected = true;
        updateAncestorDescendantFlags(draft.elementMap);
        break;
      }

      case "UPDATE_ELEMENT_STYLE": {
        saveToHistory();
        Object.assign(draft.elementMap[action.payload.elementId].style, action.payload.style);
        break;
      }

      case "UPDATE_MULTIPLE_ELEMENTS_STYLE": {
        saveToHistory();
        for (const [elementId, style] of Object.entries(action.payload)) {
          Object.assign(draft.elementMap[elementId].style, style);
        }
        break;
      }
      
      case "TOGGLE_HIDDEN_ELEMENT": {
        if (draft.rootElementId.includes(action.payload.elementId)) return;
        saveToHistory();
      
        const elementId = action.payload.elementId;
        const element = draft.elementMap[elementId];
        const newHiddenState = !element.hidden;
      
        // 자식 방향 hidden 토글
        const toggleDescendants = (elementId: string, hidden: boolean) => {
          const el = draft.elementMap[elementId];
          el.hidden = hidden;
      
          el.children.forEach(childId => {
            toggleDescendants(childId, hidden);
          });
        };
      
        // 부모 방향 숨김 해제 (visible 로만 propagate)
        const showAncestors = (elementId: string) => {
          const el = draft.elementMap[elementId];
      
          if (draft.rootElementId.includes(elementId)) return;
      
          if (el.parentId) {
            const parent = draft.elementMap[el.parentId];
            if (parent.hidden) {
              parent.hidden = false;
              showAncestors(parent.id);
            }
          }
        };
      
        // 1️⃣ 자식들 toggle
        toggleDescendants(elementId, newHiddenState);
      
        // 2️⃣ 부모는 숨김 해제할 때만 따라가기
        if (newHiddenState === false) {
          showAncestors(elementId);
        }
      
        break;
      }
      

      case "TOGGLE_HIDDEN_ALL_ELEMENT": {
        saveToHistory();

        const isHidden = Object.values(draft.elementMap).some(element => element.hidden);
        Object.values(draft.elementMap).forEach(element => {
          if (draft.rootElementId.includes(element.id)) return;
          element.hidden = !isHidden;
        });
        break;
      }

      case 'UPDATE_ELEMENT_POSITION_TYPE': {
        const { elementId, positionType } = action.payload;
        const element = draft.elementMap[elementId];
        if (element) {
          element.positionType = positionType;
        }
        break;
      }

      // --- UNDO ---
      case "UNDO": {
        if (draft.history.past.length > 1) {
          const prev = draft.history.past.pop()!;
          draft.history.future.push(JSON.parse(JSON.stringify(draft.elementMap))); // 현재 상태 future로 push
          draft.elementMap = prev;
        }
        break;
      }

      // --- REDO ---
      case "REDO": {
        if (draft.history.future.length > 0) {
          const next = draft.history.future.pop()!;
          draft.history.past.push(JSON.parse(JSON.stringify(draft.elementMap))); // 현재 상태 past로 push
          draft.elementMap = next;
        }
        break;
      }
    }
  });
};

// --- Context 분리 ---
const ElementTreeStateContext = createContext<ElementTreeState>({
  elementMap: {},
  rootElementId: [],
  history: {
    past: [],
    future: [],
  },
});

const ElementTreeDispatchContext = createContext<Dispatch<ElementTreeAction>>(() => {});

// --- Provider ---
export const ElementTreeProvider = ({ children }: { children: ReactNode }) => {
  const [ElementTree, ElementTreeDispatch] = useReducer(elementTreeReducer, {
    elementMap: {},
    rootElementId: [],
    history: {
      past: [],
      future: [],
    },
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
