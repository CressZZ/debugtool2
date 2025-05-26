import { useContext } from "react";
import { ElementTreeDispatchContext, ElementTreeStateContext } from "../context/ElementTreeContext";

export function useElementTree() {
  return useContext(ElementTreeStateContext);
}

export function useElementTreeDispatch() {
  return useContext(ElementTreeDispatchContext);
}

export function useSelectedElement() {
  const { elementMap } = useElementTree();
  const selectedElement = Object.values(elementMap).filter(e => e.selected);

  return selectedElement
}

