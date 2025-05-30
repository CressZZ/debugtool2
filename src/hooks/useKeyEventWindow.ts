import { useEffect, useRef, type Dispatch } from "react";
import { useElementTreeDispatch, useSelectedElement } from "./useElementTree";

import type { DebugElement, ElementTreeAction, } from "../context/ElementTreeContext";
import { getCurrentPositions, useStartPositions } from "./useStartPositions";
import type { movePosition } from "./useMouseEventDebugComponentItem";

export function useKeyEventWindow() {
  const dispatch = useElementTreeDispatch();
  const selectedElement = useSelectedElement();
  const { startPositions, setStartPositions } = useStartPositions();

  // 최신 selectedElement 유지
  const selectedElementRef = useRef(selectedElement);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  // 현재 포지션 초기화
  useEffect(() => {
    setStartPositions(selectedElement);
  }, [selectedElement]);

  const handleKeydown = (e: KeyboardEvent) => {
    console.log("handleKeydown", e);

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") {
      console.log("meta/ctrl + ArrowUp");
      onHandleArrowUpDown(
        -100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return; // 핸들링했으면 return 해주는 것도 좋음
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") {
      console.log("meta/ctrl + ArrowDown");
      onHandleArrowUpDown(
        100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
      console.log("meta/ctrl + ArrowLeft");
      onHandleArrowLeftRight(
        -100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
      console.log("meta/ctrl + ArrowRight");
      onHandleArrowLeftRight(
        100,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowUp") {
      console.log("ArrowUp");
      onHandleArrowUpDown(
        -1,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowDown") {
      console.log("ArrowDown");
      onHandleArrowUpDown(
        1,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowLeft") {
      console.log("ArrowLeft");
      onHandleArrowLeftRight(
        -1,
        selectedElementRef.current,
        dispatch,
        startPositions.current
      );
      return;
    }

    if (e.key === "ArrowRight") {
      console.log("ArrowRight");
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

    if ((e.metaKey || e.ctrlKey) && (e.key === "h" || e.key === "H" || e.key === "ㅗ")) {
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
