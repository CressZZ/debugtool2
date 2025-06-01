import { useCallback, useEffect, useRef } from "react";

import { getCurrentPositions, useStartPositions } from "./useStartPositions";
import type { DebugElement } from "../types/elementTreeTypes";
import { selectedElementsSelector, useElementTreeStore } from "../store/useElementTreeStore";

export type movePosition = {
  marginLeft: number;
  marginTop: number;
  transformX: number;
  transformY: number;
  positionType: 'margin' | 'transform';
};

export function useMouseEventDebugComponentItem({ elementId }: { elementId: string }) {
  const elementMap = useElementTreeStore(state => state.elementMap);
  const rootElementId = useElementTreeStore(state => state.rootElementId);
  const selectElement = useElementTreeStore(state => state.selectElement);
  const selectOnlyElement = useElementTreeStore(state => state.selectOnlyElement);
  const unselectAllElement = useElementTreeStore(state => state.unselectAllElement);
  const updateMultipleElementsStyle = useElementTreeStore(state => state.updateMultipleElementsStyle);
  const selectedElement = useElementTreeStore(selectedElementsSelector);

  const selectedElementRef = useRef(selectedElement);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const { startPositions, setStartPositions } = useStartPositions();


  const dragElementRef = useRef<HTMLElement | null>(null); // DOM 직접 참조용 ref
  const currentDx = useRef(0); // 누적 dx
  const currentDy = useRef(0); // 누적 dy
  
  const onMouseDown = useCallback((e: React.MouseEvent, element: DebugElement) => {
    e.stopPropagation();
  
    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;
  
    if (isMetaPressed || isCtrlPressed) {
      selectElement(element.id);
    } else {
      if (!element.selected) {
        selectOnlyElement(element.id);
      }
    }
  
    if (rootElementId.includes(element.id)) {
      unselectAllElement();
    }
  
    if (!elementMap[elementId].selected) return;
  
    // DOM 참조 설정
    dragElementRef.current = document.querySelector(`[data-id="${element.id}"]`) as HTMLElement;
  
    isDragging.current = true;
  
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentDx.current = 0;
    currentDy.current = 0;
  
    setStartPositions(selectedElementRef.current);
  
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [elementId, elementMap, rootElementId, selectElement, selectOnlyElement, unselectAllElement, setStartPositions]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    currentDx.current = dx;
    currentDy.current = dy;

    // ✅ DOM 직접 transform 적용
    if (dragElementRef.current) {
      dragElementRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;

    // 🔥 드래그 끝났을 때만 Context 업데이트
    const positionStyles = getCurrentPositions(
      selectedElement,
      startPositions.current,
      currentDx.current,
      currentDy.current
    );

    updateMultipleElementsStyle(positionStyles);

    // DOM transform 초기화
    if (dragElementRef.current) {
      dragElementRef.current.style.transform = "";
    }

    dragElementRef.current = null;

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { onMouseDown };
}
