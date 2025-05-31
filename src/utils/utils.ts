import type { RefObject } from "react";

export function getMovePosition(startMarginLeft: RefObject<number>, startMarginTop: RefObject<number>, startTransformX: RefObject<number>, startTransformY: RefObject<number>, dx: number, dy: number, positionType: 'margin' | 'transform') {
  if(positionType === 'margin') {
    return {
      marginLeft: `${startMarginLeft.current + dx}px`,
      marginTop: `${startMarginTop.current + dy}px`,
    };
  }else{
    return {
      transformTranslateX: `${startTransformX.current + dx}px`,
      transformTranslateY: `${startTransformY.current + dy}px`,
    }
  }
}
