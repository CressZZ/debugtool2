import { useContext, useEffect, useState } from "react";
import { ElementTreeDispatchContext, ElementTreeStateContext, type DebugElement } from "../context/ElementTreeContext";

// 훅
export function useElementTree() {
  return useContext(ElementTreeStateContext);
}

export function useElementTreeDispatch() {
  return useContext(ElementTreeDispatchContext);
}

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

// 유틸
export function getSelectedElements(elementMap: Record<string, DebugElement>) {
  return Object.values(elementMap).filter(e => e.selected);
}

export const isAnyAncestorSelected = (element: DebugElement, elementMap: Record<string, DebugElement>): boolean => {
  if (!element.parentId) {
    // 루트까지 올라갔으면 false
    return false;
  }

  const parent = elementMap[element.parentId];
  if (!parent) {
    return false;
  }

  if (parent.selected) {
    return true;
  }

  // 부모의 부모 재귀 검사
  return isAnyAncestorSelected(parent, elementMap);
};


export const isAnyDescendantSelected = (element: DebugElement, elementMap: Record<string, DebugElement>): boolean => {
  // 현재 element 의 children 에서 selected 인 애가 있는지 체크
  return element.children.some(childId => {
    const child = elementMap[childId];
    if (!child) return false;

    // 자식이 selected 면 true
    if (child.selected) return true;

    // 아니면 자식의 자식 재귀 검사
    return isAnyDescendantSelected(child, elementMap);
  });
};
