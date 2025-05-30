import { useEffect, useRef } from "react";
import { useElementTree, useElementTreeDispatch, useSelectedElement } from "./useElementTree";

import { getCurrentPositions, useStartPositions } from "./useMovePosition";

export type movePosition = {
  marginLeft: number;
  marginTop: number;
  transformX: number;
  transformY: number;
  positionType: 'margin' | 'transform';
}
export function useDraggableElement({ elementId }: { elementId: string }) {
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

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

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
