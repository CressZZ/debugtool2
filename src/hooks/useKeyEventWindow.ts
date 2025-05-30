import { useEffect, useRef, type Dispatch } from "react";
import {
  useElementTree,
  useElementTreeDispatch,
  useSelectedElement,
} from "./useElementTree";

import type {
  DebugElement,
  ElementTreeAction,
} from "../context/ElementTreeContext";
import {
  getCurrentPositions,
  getPositionScss,
  useStartPositions,
} from "./useStartPositions";
import type { movePosition } from "./useMouseEventDebugComponentItem";

export function useKeyEventWindow({targetSelector}: {targetSelector: string}) {
  const dispatch = useElementTreeDispatch();
  const selectedElement = useSelectedElement();
  const { startPositions, setStartPositions } = useStartPositions();

  const { elementMap, rootElementId } = useElementTree();
  const elementMapRef = useRef(elementMap);
  const rootElementIdRef = useRef(rootElementId);

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
      console.log(positionScss);
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") {
      // console.log("meta/ctrl + ArrowUp");
      setStartPositions(selectedElementRef.current);

      onHandleArrowUpDown(
        -100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return; // 핸들링했으면 return 해주는 것도 좋음
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") {
      // console.log("meta/ctrl + ArrowDown");
      setStartPositions(selectedElementRef.current);

      onHandleArrowUpDown(
        100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
      // console.log("meta/ctrl + ArrowLeft");
      setStartPositions(selectedElementRef.current);

      onHandleArrowLeftRight(
        -100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
      // console.log("meta/ctrl + ArrowRight");
      setStartPositions(selectedElementRef.current);

      onHandleArrowLeftRight(
        100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowUp") {
      // console.log("ArrowUp");
      setStartPositions(selectedElementRef.current);

      onHandleArrowUpDown(
        -1,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowDown") {
      // console.log("ArrowDown");
      setStartPositions(selectedElementRef.current);

      onHandleArrowUpDown(
        1,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowLeft") {
      // console.log("ArrowLeft");
      setStartPositions(selectedElementRef.current);

      onHandleArrowLeftRight(
        -1,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowRight") {
      // console.log("ArrowRight");
      setStartPositions(selectedElementRef.current);

      onHandleArrowLeftRight(
        1,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "Escape") {
      selectedElementRef.current.forEach((element) => {
        dispatch({
          type: "UNSELECT_ELEMENT",
          payload: { elementId: element.id },
        });
      });
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "h" || e.key === "H" || e.key === "ㅗ")
    ) {
      dispatch({
        type: "TOGGLE_HIDDEN_ALL_ELEMENT",
      });
      return;
    }

    if (e.key === "h" || e.key === "H" || e.key === "ㅗ") {
      selectedElementRef.current.forEach((element) => {
        dispatch({
          type: "TOGGLE_HIDDEN_ELEMENT",
          payload: { elementId: element.id },
        });
      });
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      e.shiftKey &&
      (e.key === "z" || e.key === "Z" || e.key === "ㅈ")
    ) {
      dispatch({
        type: "REDO",
      });
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "z" || e.key === "Z" || e.key === "ㅈ")
    ) {
      dispatch({
        type: "UNDO",
      });
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
  selectedElement: DebugElement[],
  dispatch: Dispatch<ElementTreeAction>,
  startPositions: Record<string, movePosition>
) {
  const positionStyles = getCurrentPositions(
    selectedElement,
    startPositions,
    0,
    dy
  );

  dispatch({
    type: "UPDATE_MULTIPLE_ELEMENTS_STYLE",
    payload: positionStyles,
  });
}

function onHandleArrowLeftRight(
  dx: number,
  selectedElement: DebugElement[],
  dispatch: Dispatch<ElementTreeAction>,
  startPositions: Record<string, movePosition>
) {
  const positionStyles = getCurrentPositions(
    selectedElement,
    startPositions,
    dx,
    0
  );

  dispatch({
    type: "UPDATE_MULTIPLE_ELEMENTS_STYLE",
    payload: positionStyles,
  });
}
