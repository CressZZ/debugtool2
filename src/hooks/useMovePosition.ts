import { useRef } from "react";
import type { DebugElement } from "../context/ElementTreeContext";
import type { movePosition } from "./useDraggableElement";

export function useStartPositions() {
  const startPositions = useRef<Record<string, movePosition>>({});

  const setStartPositions = (selectedElements: DebugElement[]) => {
    startPositions.current = {};
    selectedElements.forEach(el => {
      startPositions.current[el.id] = {
        marginLeft: parseFloat(el.style.marginLeft || "0"),
        marginTop: parseFloat(el.style.marginTop || "0"),
        transformX: parseFloat(el.style.transformTranslateX || "0"),
        transformY: parseFloat(el.style.transformTranslateY || "0"),
        positionType: el.positionType,
      };
    });
  };

  return {
    startPositions,
    setStartPositions,
  };
}


export function getCurrentPositions(selectedElement: DebugElement[], startPositions: Record<string, movePosition>, dx: number, dy: number) {
  const styles: Record<string, Partial<DebugElement["style"]>> = {};

  selectedElement.forEach(el => {
    styles[el.id] = getMovePosition(startPositions[el.id], dx, dy, el.positionType);
  });

  return styles;
}



export function getMovePosition(startPosition: movePosition, dx: number, dy: number, positionType: 'margin' | 'transform') {
  const { marginLeft, marginTop, transformX, transformY } = startPosition;
  if(positionType === 'margin') {
    return {
      marginLeft: `${marginLeft + dx}px`,
      marginTop: `${marginTop + dy}px`,
    };
  }else{
    return {
      transformTranslateX: `${transformX + dx}px`,
      transformTranslateY: `${transformY + dy}px`,
    }
  }
}