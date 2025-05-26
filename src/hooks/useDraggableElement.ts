import { useRef } from "react";
import { useElementTree, useElementTreeDispatch } from "./useElementTree";

type UseDraggableOptions = {
  elementId: string;
  marginLeft: string;
  marginTop: string;
  transformX: string;
  transformY: string;
  positionType: 'margin' | 'transform';
};

export function useDraggableElement({ elementId, marginLeft, marginTop, transformX, transformY, positionType }: UseDraggableOptions) {
  const dispatch = useElementTreeDispatch();
  const elementMap= useElementTree();

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startMarginLeft = useRef(0);
  const startMarginTop = useRef(0);
  const startTransformX = useRef(0);
  const startTransformY = useRef(0);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    dispatch({
      type: "UPDATE_ELEMENT_STYLE",
      payload: {
        elementId,
        style: {
          marginLeft: positionType === 'margin' ? `${startMarginLeft.current + dx}px` : `${startMarginLeft.current}px`,
          marginTop: positionType === 'margin' ? `${startMarginTop.current + dy}px` : `${startMarginTop.current}px`,
          transformTranslateX: positionType === 'transform' ? `${startTransformX.current + dx}px` : `${startTransformX.current}px`,
          transformTranslateY: positionType === 'transform' ? `${startTransformY.current + dy}px` : `${startTransformY.current}px`,
        },
      },
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    if(!elementMap.elementMap[elementId].selected) {
      return;
    }

    isDragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startMarginLeft.current = parseFloat(marginLeft || "0");
    startMarginTop.current = parseFloat(marginTop || "0");
    startTransformX.current = parseFloat(transformX || "0");
    startTransformY.current = parseFloat(transformY || "0");

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return { onMouseDown };
}
