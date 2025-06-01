import { useEffect, useRef } from "react";
import { useElementTree, useElementTreeDispatch, useSelectedElement } from "./useElementTree";

import { getCurrentPositions, useStartPositions } from "./useStartPositions";
import type { DebugElement } from "../context/ElementTreeContext";

export type movePosition = {
  marginLeft: number;
  marginTop: number;
  transformX: number;
  transformY: number;
  positionType: 'margin' | 'transform';
};

export function useMouseEventDebugComponentItem({ elementId }: { elementId: string }) {
  const dispatch = useElementTreeDispatch();
  const { elementMap, rootElementId } = useElementTree();
  const selectedElement = useSelectedElement();

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const { startPositions, setStartPositions } = useStartPositions();

  const selectedElementRef = useRef(selectedElement);
  const dragElementRef = useRef<HTMLElement | null>(null); // DOM 직접 참조용 ref
  const currentDx = useRef(0); // 누적 dx
  const currentDy = useRef(0); // 누적 dy

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  const onMouseDown = (e: React.MouseEvent, element: DebugElement) => {
    e.stopPropagation();

    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;

    if (isMetaPressed || isCtrlPressed) {
      dispatch({ type: "SELECTED_ELEMENT", payload: { elementId: element.id } });
    } else {
      if (!element.selected) {
        dispatch({ type: "SELECT_ONLY_ELEMENT", payload: { elementId: element.id } });
      }
    }

    if (rootElementId.includes(element.id)) {
      dispatch({ type: "UNSELECT_ALL_ELEMENT" });
    }

    if (!elementMap[elementId].selected) return;

    // ** DOM 참조 설정 **
    dragElementRef.current = document.querySelector(`[data-id="${element.id}"]`) as HTMLElement;

    isDragging.current = true;

    startX.current = e.clientX;
    startY.current = e.clientY;
    currentDx.current = 0;
    currentDy.current = 0;

    setStartPositions(selectedElementRef.current);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

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
      selectedElementRef.current,
      startPositions.current,
      currentDx.current,
      currentDy.current
    );

    dispatch({
      type: "UPDATE_MULTIPLE_ELEMENTS_STYLE",
      payload: positionStyles,
    });

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
