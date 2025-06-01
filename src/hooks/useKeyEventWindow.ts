import { useEffect, useRef } from "react";
import { shallow, useShallow } from 'zustand/shallow';

import {
  getCurrentPositions,
  getPositionScss,
  setStartPositions,
} from "./useStartPositions";
import type { movePosition } from "./useMouseEventDebugComponentItem";
import { useElementTreeStore } from "../store/useElementTreeStore";
import { selectedElementIdsSelector, selectedElementsSelector } from "../store/elementTreeSelectors";
import type { DebugElement, ElementId } from "../types/elementTreeTypes";

export function useKeyEventWindow(targetSelector: string) {
  const selectedElement = useElementTreeStore(useShallow(selectedElementsSelector));
  // const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));

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


  // let startPositions: Record<string, movePosition> = {};
  const startPositionsRef = useRef<Record<string, movePosition>>({});
  const isKeydownArrowing = useRef(false);
  const selectedElementIdsRef = useRef<string[]>([]);

  // 누적 이동값 저장용 ref
  const moveDeltaRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });



  useEffect(() => {
    elementMapRef.current = elementMap;
    rootElementIdRef.current = rootElementId;
  }, [elementMap, rootElementId]);

  // 최신 selectedElement 유지
  const selectedElementRef = useRef(selectedElement);
  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  // 👉 일반 키 핸들링 (단축키들)
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      e.stopPropagation();

      const positionScss = getPositionScss(
        elementMapRef.current,
        rootElementIdRef.current,
        targetSelector
      );

      navigator.clipboard.writeText(positionScss);
      console.log(positionScss);
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

  // 👉 방향키 keydown → transform 적용
  const handleKeydownArrow = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {

      if(!isKeydownArrowing.current){
        isKeydownArrowing.current = true;
        startPositionsRef.current = setStartPositions();

        selectedElementIdsRef.current = selectedElementIdsSelector(useElementTreeStore.getState());
      }

      e.preventDefault();


      const isMeta = e.metaKey || e.ctrlKey;

      const deltaX = (e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0) * (isMeta ? 100 : 1);
      const deltaY = (e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0) * (isMeta ? 100 : 1);

      // 누적 이동값 업데이트
      moveDeltaRef.current.dx += deltaX;
      moveDeltaRef.current.dy += deltaY;


      // DOM transform 임시 적용
      handleArrowKeyPreview({
        dx: moveDeltaRef.current.dx,
        dy: moveDeltaRef.current.dy,
        selectedElementIds: selectedElementIdsRef.current,
      });
    }
  };

  // 👉 방향키 keyup → store 업데이트
  const handleKeyupArrow = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();


      const positionStyles = getCurrentPositions(
        selectedElementIdsRef.current,
        startPositionsRef.current,
        moveDeltaRef.current.dx,
        moveDeltaRef.current.dy
      );
    
      updateMultipleElementsStyle(positionStyles);

      // 누적값 초기화
      moveDeltaRef.current = { dx: 0, dy: 0 };

      // transform 초기화
      handleArrowKeyPreview({
        dx: 0,
        dy: 0,
        selectedElementIds: selectedElementIdsRef.current,
      });

      isKeydownArrowing.current = false;
    }
  };

  // 이벤트 등록
  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keydown", handleKeydownArrow);
    window.addEventListener("keyup", handleKeyupArrow);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keydown", handleKeydownArrow);
      window.removeEventListener("keyup", handleKeyupArrow);
    };
  }, []);
}



// DOM에 임시 transform 적용용
function handleArrowKeyPreview({
  dx,
  dy,
  selectedElementIds,
}: {
  dx: number;
  dy: number;
  selectedElementIds: string[];
}) {

  selectedElementIds.forEach((id) => {
    const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;

    if (el) {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  });
}
