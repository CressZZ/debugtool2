import { useContext, useEffect, useState } from "react";
import { ElementTreeDispatchContext, ElementTreeStateContext, type DebugElement } from "../context/ElementTreeContext";

export function useElementTree() {
  return useContext(ElementTreeStateContext);
}

export function useElementTreeDispatch() {
  return useContext(ElementTreeDispatchContext);
}

export function useSelectedElement() {
  const { elementMap } = useElementTree();
  const [selectedElement, setSelectedElement] = useState<DebugElement[]>(Object.values(elementMap).filter(e => e.selected));

  useEffect(() => {
    setSelectedElement(Object.values(elementMap).filter(e => e.selected));
  }, [elementMap]);

  return selectedElement
}
