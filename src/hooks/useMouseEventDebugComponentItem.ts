import { useEffect, useRef } from "react";
import { useShallow } from 'zustand/shallow';
import { getCurrentPositions, useStartPositions } from "./useStartPositions";
import type { DebugElement } from "../types/elementTreeTypes";
import { useElementTreeStore } from "../store/useElementTreeStore";
import { selectedElementIdsSelector } from "../store/elementTreeSelectors";

export type movePosition = {
  marginLeft: number;
  marginTop: number;
  transformX: number;
  transformY: number;
  positionType: 'margin' | 'transform';
};

export function useMouseEventDebugComponentItem() {
  // const elementMap = useElementTreeStore(state => state.elementMap);
  const rootElementId = useElementTreeStore(state => state.rootElementId);
  const selectElement = useElementTreeStore(state => state.selectElement);
  const selectOnlyElement = useElementTreeStore(state => state.selectOnlyElement);
  const unselectAllElement = useElementTreeStore(state => state.unselectAllElement);
  const updateMultipleElementsStyle = useElementTreeStore(state => state.updateMultipleElementsStyle);
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));

  const dragElementsRef = useRef<HTMLElement[]>([]);

  dragElementsRef.current = selectedElementIds.map(id => {
    return document.querySelector(`[data-id="${id}"]`) as HTMLElement;
  }).filter(Boolean); // null 제거

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const { startPositions, setStartPositions } = useStartPositions();


  const dragElementRef = useRef<HTMLElement | null>(null); // DOM 직접 참조용 ref
  const currentDx = useRef(0); // 누적 dx
  const currentDy = useRef(0); // 누적 dy

  const onMouseDown = (e: React.MouseEvent, element: DebugElement) => {
    console.log("onMouseDown", element.id)
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
  
    if (!element.selected) return;
  
    // DOM 참조 설정
    dragElementRef.current = document.querySelector(`[data-id="${element.id}"]`) as HTMLElement;
  
    isDragging.current = true;
  
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentDx.current = 0;
    currentDy.current = 0;
  
    setStartPositions(selectedElementIds);
  
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
  
    currentDx.current = dx;
    currentDy.current = dy;
  
    // console.log("handleMouseMove", dragElementsRef.current)
    // ✅ 모든 선택된 요소 transform 적용
    dragElementsRef.current.forEach(el => {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;

    // 🔥 드래그 끝났을 때만 Context 업데이트
    const positionStyles = getCurrentPositions(
      selectedElementIds,
      startPositions.current,
      currentDx.current,
      currentDy.current
    );

    updateMultipleElementsStyle(positionStyles);

    // DOM transform 초기화
    dragElementsRef.current.forEach(el => {
      el.style.transform = "";
    });
    
    dragElementsRef.current = [];
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
