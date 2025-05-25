import { createContext, useReducer, type Dispatch } from "react";
import { produce } from "immer";

export type Element = {
  id: ElementId;
  tagName: string;
  className: string[];
  parentId?: string;
  selected: boolean;
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
  };
}

export type ElementId = string;
export type ElementMap = Record<ElementId, Element>;

export type ElementTreeState = {
  elementMap: ElementMap;
  rootElementId: ElementId;
}

type ElementTreeAction =
  | { type: "SET_ELEMENT_MAP"; payload: { elementMap: ElementMap, rootElementId: ElementId } };

const elementTreeReducer = (state: ElementTreeState, action: ElementTreeAction): ElementTreeState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SET_ELEMENT_MAP":
        draft.elementMap = action.payload.elementMap;
        draft.rootElementId = action.payload.rootElementId;
        break;
    }
  });
};

const ElementTreeContext = createContext<{
  state: ElementTreeState;
  dispatch: Dispatch<ElementTreeAction>;
}>({
  state: {
    elementMap: {},
    rootElementId: '',
  },
  dispatch: () => {},
});

export const ElementTreeProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(elementTreeReducer, {
    elementMap: {},
    rootElementId: '',
  });

  return (
    <ElementTreeContext.Provider value={{ state, dispatch }}>
      {children}
    </ElementTreeContext.Provider>
  );
};

export { ElementTreeContext };
