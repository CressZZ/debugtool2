import { useEffect, useRef } from "react";
import { useShallow } from 'zustand/shallow';
import { getCurrentPositions, setStartPositions } from "./useStartPositions";
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
  const rootElementId = useElementTreeStore(state => state.rootElementId);
  const selectElement = useElementTreeStore(state => state.selectElement);
  const selectOnlyElement = useElementTreeStore(state => state.selectOnlyElement);
  const unselectAllElement = useElementTreeStore(state => state.unselectAllElement);
  const updateMultipleElementsStyle = useElementTreeStore(state => state.updateMultipleElementsStyle);

  // 선택된 용소
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));
  const selectedElementIdsRef = useRef<string[]>([]);

  const targetElementRef = useRef<DebugElement | null>(null);
  const moveTargetElementsRef = useRef<HTMLElement[]>([]);

  const isMouseDownning = useRef(false);
  const isMouseMoving = useRef(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const currentDx = useRef(0);
  const currentDy = useRef(0);

  const startPositionsRef = useRef<Record<string, movePosition>>({});

  // Keep selectedElementIds in ref
  useEffect(() => {
    selectedElementIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);

  // --- 기능 함수 쪼개기 ---

  const selectTargetElement = (e: React.MouseEvent, element: DebugElement) => {
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
  };

  const prepareMoveTargets = (e: React.MouseEvent, element: DebugElement) => {
    if (rootElementId.includes(element.id)) {
      return;
    }

    let moveTargetElementIds = selectedElementIdsRef.current;

    console.log("moveTargetElementIds", moveTargetElementIds);
    if(moveTargetElementIds.length < 1) {
      return;
    }

    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;

    if (isMetaPressed || isCtrlPressed) {
      moveTargetElementIds = [...moveTargetElementIds, element.id];
    } else {
      if (!element.selected) {
        moveTargetElementIds = [element.id];
      }
    }

    moveTargetElementsRef.current = moveTargetElementIds.map(id => {
      return document.querySelector(`[data-id="${id}"]`) as HTMLElement;
    }).filter(Boolean);

    isMouseDownning.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentDx.current = 0;
    currentDy.current = 0;

    startPositionsRef.current = setStartPositions();

    console.log("startPositionsRef.current", startPositionsRef.current);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const applyTransformToTargets = (dx: number, dy: number) => {
    moveTargetElementsRef.current.forEach(el => {
      const elementId = el.getAttribute("data-id")!;
      const startPos = startPositionsRef.current[elementId];
      
      el.style.transform = `translate(${startPos.transformX + dx}px, ${startPos.transformY + dy}px)`;
      
    });
  };

  const finalizeSelection = (e: MouseEvent, element: DebugElement) => {
    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;

    if (!(isMetaPressed || isCtrlPressed) && !isMouseMoving.current) {
      selectOnlyElement(element.id);
    }
  };

  const updateElementPositions = () => {
    const elementMap = useElementTreeStore.getState().elementMap;
    const selectedElementIds = Object.values(elementMap).filter(el => el.selected).map(el => el.id);

    const positionStyles = getCurrentPositions(
      selectedElementIds,
      startPositionsRef.current,
      currentDx.current,
      currentDy.current
    );

    console.log("positionStyles", currentDx.current, currentDy.current);
    updateMultipleElementsStyle(positionStyles);
  };

  const clearTransform = () => {
    moveTargetElementsRef.current.forEach(el => {
      const startPos = startPositionsRef.current[el.getAttribute("data-id")!];
      el.style.transform = `translate(${startPos.transformX}px, ${startPos.transformY}px)`;
    });

    moveTargetElementsRef.current = [];
  };

  // --- 핸들러 ---

  const handleMouseDown = (e: React.MouseEvent, element: DebugElement) => {
    targetElementRef.current = element;
    e.stopPropagation();

    selectTargetElement(e, element);
    prepareMoveTargets(e, element);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDownning.current) return;

    isMouseMoving.current = true;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    currentDx.current = dx;
    currentDy.current = dy;

    applyTransformToTargets(dx, dy);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!targetElementRef.current) return;

    finalizeSelection(e, targetElementRef.current);

    if (isMouseDownning.current) {
      isMouseDownning.current = false;
      isMouseMoving.current = false;

      updateElementPositions();
      clearTransform();
    }

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    targetElementRef.current = null;
  };

  // --- cleanup ---

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // --- expose ---

  return { handleMouseDown };
}
