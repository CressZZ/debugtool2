import { useEffect, useRef } from "react";
import { shallow, useShallow } from 'zustand/shallow';



import {
  getCurrentPositions,
  getPositionScss,
  setStartPositions,
  useStartPositions,

} from "./useStartPositions";
import type { movePosition } from "./useMouseEventDebugComponentItem";
import { useElementTreeStore } from "../store/useElementTreeStore";
import { selectedElementIdsSelector, selectedElementsSelector } from "../store/elementTreeSelectors";
import type { DebugElement, ElementId } from "../types/elementTreeTypes";

export function useKeyEventWindow(targetSelector: string) {
  const selectedElement = useElementTreeStore(useShallow(selectedElementsSelector));
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));

  const elementMap = useElementTreeStore(state => state.elementMap);
  const rootElementId = useElementTreeStore(state => state.rootElementId);
  const elementMapRef = useRef(elementMap);
  const rootElementIdRef = useRef(rootElementId);
  const unselectElement = useElementTreeStore(state => state.unselectElement);
  const toggleHiddenAllElement = useElementTreeStore(state => state.toggleHiddenAllElement);
  const toggleHiddenElement = useElementTreeStore(state => state.toggleHiddenElement);
  const undo = useElementTreeStore(state => state.undo);
  const redo = useElementTreeStore(state => state.redo);

  const updateMultipleElementsStyle = useElementTreeStore(state => state.updateMultipleElementsStyle);

  const selectedElementIdsRef = useRef(selectedElementIds);

  useEffect(() => {
    selectedElementIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);

  useEffect(() => {
    elementMapRef.current = elementMap;
    rootElementIdRef.current = rootElementId;
  }, [elementMap, rootElementId]);

  // 최신 selectedElement 유지
  const selectedElementRef = useRef(selectedElement);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  const handleKeydown = (e: KeyboardEvent) => {

    // console.log("handleKeydown", e);
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      e.stopPropagation();

      const positionScss = getPositionScss(
        elementMapRef.current,
        rootElementIdRef.current,
        targetSelector
      );

      // copy to clipboard
      navigator.clipboard.writeText(positionScss);

      console.log(positionScss);
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault(); // 기본 스크롤 방지

      const elementMap = useElementTreeStore.getState().elementMap;
      const selectedElementIds = Object.values(elementMap).filter(el => el.selected).map(el => el.id);
    

      const isMeta = e.metaKey || e.ctrlKey;
    
      const startPositions = setStartPositions();

      handleArrowKey({
        dx: e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0,
        dy: e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0,
        isMeta,
        selectedElementIds: selectedElementIds,
        updateMultipleElementsStyle,
        startPositions: startPositions,
      });
    
      return;
    }
    

    if (e.key === "Escape") {
      selectedElementRef.current.forEach((element) => {
        unselectElement(element.id);
      });
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "h" || e.key === "H" || e.key === "ㅗ")
    ) {
      toggleHiddenAllElement();
      return;
    }

    if (e.key === "h" || e.key === "H" || e.key === "ㅗ") {
      selectedElementRef.current.forEach((element) => {
        toggleHiddenElement(element.id);
      });
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      e.shiftKey &&
      (e.key === "z" || e.key === "Z" || e.key === "ㅈ")
    ) {
      redo();
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "z" || e.key === "Z" || e.key === "ㅈ")
    ) {
      undo();
      return;
    }
  };

  // 키 바인딩은 빈 deps (ref로 안전하게 최신 selectedElement 사용)
  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);
}

function onHandleArrowUpDown(
  dy: number,
  selectedElementIds: string[],
  updateMultipleElementsStyle: (updates: Record<ElementId, Partial<DebugElement['style']>>) => void,
  startPositions: Record<string, movePosition>
) {
  const positionStyles = getCurrentPositions(
    selectedElementIds,
    startPositions,
    0,
    dy
  );

  updateMultipleElementsStyle(positionStyles);
}

function onHandleArrowLeftRight(
  dx: number,
  selectedElementIds: string[],
  updateMultipleElementsStyle: (updates: Record<ElementId, Partial<DebugElement['style']>>) => void,
  startPositions: Record<string, movePosition>
) {
  const positionStyles = getCurrentPositions(
    selectedElementIds,
    startPositions,
    dx,
    0
  );

  updateMultipleElementsStyle(positionStyles)
}


function handleArrowKey({
  dx = 0,
  dy = 0,
  isMeta = false,
  selectedElementIds,
  updateMultipleElementsStyle,
  startPositions,
}: {
  dx?: number;
  dy?: number;
  isMeta?: boolean;
  selectedElementIds: string[];
  updateMultipleElementsStyle: (updates: Record<ElementId, Partial<DebugElement['style']>>) => void;
  startPositions: Record<string, movePosition>;
}) {
  // Meta키 누른 경우는 크게 이동, 아니면 기본 이동
  const deltaX = dx * (isMeta ? 100 : 1);
  const deltaY = dy * (isMeta ? 100 : 1);

  // 시작 위치 세팅
  console.log("startPositions", startPositions)
  console.log("selectedElementIds", selectedElementIds)
  // 현재 위치 계산
  const positionStyles = getCurrentPositions(
    selectedElementIds,
    startPositions,
    deltaX,
    deltaY
  );

  // 업데이트
  updateMultipleElementsStyle(positionStyles);
}
