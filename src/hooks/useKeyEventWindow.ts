import { useEffect, useRef } from "react";
import { shallow, useShallow } from 'zustand/shallow';



import {
  getCurrentPositions,
  getPositionScss,
  useStartPositions,
} from "./useStartPositions";
import type { movePosition } from "./useMouseEventDebugComponentItem";
import { selectedElementIdsSelector, selectedElementsSelector, useElementTreeStore } from "../store/useElementTreeStore";
import type { DebugElement, ElementId } from "../types/elementTreeTypes";

export function useKeyEventWindow(targetSelector: string) {
  const selectedElement = useElementTreeStore(selectedElementsSelector);
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));
  const { startPositions, setStartPositions } = useStartPositions();

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

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") {
      // console.log("meta/ctrl + ArrowUp");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowUpDown(
        -100,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
      return; // 핸들링했으면 return 해주는 것도 좋음
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") {
      // console.log("meta/ctrl + ArrowDown");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowUpDown(
        100,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
      // console.log("meta/ctrl + ArrowLeft");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowLeftRight(
        -100,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
      // console.log("meta/ctrl + ArrowRight");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowLeftRight(
        100,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowUp") {
      // console.log("ArrowUp");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowUpDown(
        -1,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowDown") {
      // console.log("ArrowDown");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowUpDown(
        1,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowLeft") {
      // console.log("ArrowLeft");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowLeftRight(
        -1,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowRight") {
      // console.log("ArrowRight");
      setStartPositions(selectedElementIdsRef.current);

      onHandleArrowLeftRight(
        1,
        selectedElementIdsRef.current,
        updateMultipleElementsStyle,
        startPositions.current
      );
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
