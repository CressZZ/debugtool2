import { useContext, useEffect, useState } from "react";
import { ElementTreeDispatchContext, ElementTreeStateContext, type DebugElement } from "../context/ElementTreeContext";

export function useElementTree() {
  return useContext(ElementTreeStateContext);
}

export function useElementTreeDispatch() {
  return useContext(ElementTreeDispatchContext);
}

// 유틸
export function getSelectedElements(elementMap: Record<string, DebugElement>) {
  return Object.values(elementMap).filter(e => e.selected);
}

// 훅
export function useSelectedElement() {
  const { elementMap } = useElementTree();
  const [selectedElements, setSelectedElements] = useState<DebugElement[]>(() =>
    getSelectedElements(elementMap)
  );

  useEffect(() => {
    setSelectedElements(getSelectedElements(elementMap));
  }, [elementMap]);

  return selectedElements;
}