import { useRef } from "react";
import { useElementTree, useElementTreeDispatch, useSelectedElement } from "./useElementTree";
import type { DebugElement } from "../context/ElementTreeContext";

type movePosition = {
  marginLeft: number;
  marginTop: number;
  transformX: number;
  transformY: number;
}

export function getMovePosition(startMarginLeft: number, startMarginTop: number, startTransformX: number, startTransformY: number, dx: number, dy: number, positionType: 'margin' | 'transform') {
  if(positionType === 'margin') {
    return {
      marginLeft: `${startMarginLeft + dx}px`,
      marginTop: `${startMarginTop + dy}px`,
    };
  }else{
    return {
      transformTranslateX: `${startTransformX + dx}px`,
      transformTranslateY: `${startTransformY + dy}px`,
    }
  }
}

export function useDraggableElement({ elementId }: { elementId: string }) {
  const dispatch = useElementTreeDispatch();
  const elementMap= useElementTree();
  const selectedElement = useSelectedElement();
  
  const isDragging = useRef(false);

  // 마우스 시작 위치
  const startX = useRef(0);
  const startY = useRef(0);

  // 요소 시작 위치
  const startPositions = useRef<Record<string, movePosition>>({});
  
  // 이벤트 - 마우스 이동
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const stylesByElementId: Record<string, Partial<DebugElement["style"]>> = {};
    
    selectedElement.forEach(el => {
      // 요소 시작 위치
      const startPosition = startPositions.current[el.id];

      if (!startPosition) return;
    
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
    
      // 계산
      stylesByElementId[el.id] = getMovePosition(startPosition.marginLeft, startPosition.marginTop, startPosition.transformX, startPosition.transformY, dx, dy, el.positionType)
    });

    // 업데이트
    dispatch({
      type: "UPDATE_MULTIPLE_ELEMENTS_STYLE",
      payload: stylesByElementId,
    });
  };

  // 이벤트 - 마우스에서 손때기!
  const handleMouseUp = () => {
    // 드래그 종료
    isDragging.current = false;

    // 이벤트 제거
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // 이벤트 - 마우스 클릭! (셀렉트 여기에 넣어야 하나?)
  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    if(!elementMap.elementMap[elementId].selected) {
      return;
    }

    // 드래그 시작
    isDragging.current = true;

    // 마우스 시작 위치
    startX.current = e.clientX;
    startY.current = e.clientY;

    // 요소 시작 위치
    startPositions.current = {};
    selectedElement.forEach(el => {
      startPositions.current[el.id] = {
        marginLeft: parseFloat(el.style.marginLeft || "0"),
        marginTop: parseFloat(el.style.marginTop || "0"),
        transformX: parseFloat(el.style.transformTranslateX || "0"),
        transformY: parseFloat(el.style.transformTranslateY || "0"),
        positionType: el.positionType,
      };
    });

    // 이벤트 바인딩
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return { onMouseDown };
}
