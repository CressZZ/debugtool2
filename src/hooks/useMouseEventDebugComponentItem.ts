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
}
export function useMouseEventDebugComponentItem({ elementId }: { elementId: string }) {
  const dispatch = useElementTreeDispatch();
  const { elementMap } = useElementTree();
  const selectedElement = useSelectedElement();

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const { startPositions, setStartPositions } = useStartPositions();

  const selectedElementRef = useRef(selectedElement);
  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  const onMouseDown = (e: React.MouseEvent, element: DebugElement) => {
    e.stopPropagation();

    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;
    // const isShiftPressed = e.shiftKey;

    if(isMetaPressed || isCtrlPressed){
      dispatch({ type: "SELECTED_ELEMENT", payload: { elementId: element.id } });
    }else{
      if(!element.selected){
        dispatch({ type: "UNSELECT_ALL_ELEMENT", payload: { elementId: element.id } });
        dispatch({ type: "SELECTED_ELEMENT", payload: { elementId: element.id } });
      }else{
        //
      }
    }


    if (!elementMap[elementId].selected) return;

    isDragging.current = true;

    startX.current = e.clientX;
    startY.current = e.clientY;

    setStartPositions(selectedElementRef.current);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    const positionStyles = getCurrentPositions(selectedElementRef.current, startPositions.current, dx, dy);

    dispatch({
      type: "UPDATE_MULTIPLE_ELEMENTS_STYLE",
      payload: positionStyles,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
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
