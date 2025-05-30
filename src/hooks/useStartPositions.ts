import { useRef } from "react";
import type { DebugElement, ElementId, ElementMap } from "../context/ElementTreeContext";
import type { movePosition } from "./useMouseEventDebugComponentItem";

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
      // transformTranslateX: "",
      // transformTranslateY: "",
    };
  }else{
    return {
      transformTranslateX: `${transformX + dx}px`,
      transformTranslateY: `${transformY + dy}px`,
      // marginLeft: "",
      // marginTop: "",
    }
  }
}
export function getPositionScss(elementMap: ElementMap, rootElementIds: ElementId[], rootSelector: string) {
  const lines: string[] = [];

  const makeClassSelector = (element: DebugElement) => {
    return element.className.length > 0
      ? `.${element.className.join(".")}`
      : ""; // 클래스 없는 경우 빈 문자열
  };

  // 모든 후손을 "flat" 하게 루트 하위로 출력
  const collectAllDescendants = (element: DebugElement, result: DebugElement[]) => {
    element.children.forEach(childId => {
      const child = elementMap[childId];
      if (child) {
        result.push(child);
        collectAllDescendants(child, result); // 재귀
      }
    });
  };

  rootElementIds.forEach(rootId => {
    const rootElement = elementMap[rootId];
    if (rootElement) {
      // 루트 열기
      lines.push(`${rootSelector} {`);

      // flat list 만들기
      const flatDescendants: DebugElement[] = [];
      collectAllDescendants(rootElement, flatDescendants);

      // flat 으로 출력
      flatDescendants.forEach(child => {
        const childSelector = makeClassSelector(child);
        if (childSelector) {
          lines.push(`  ${childSelector} {`);
          lines.push(`    margin-top: ${child.style.marginTop};`);
          lines.push(`    margin-left: ${child.style.marginLeft};`);
          lines.push(`  }`);
        }
      });

      // 루트 닫기
      lines.push(`}`);
    }
  });

  return lines.join("\n");
}
