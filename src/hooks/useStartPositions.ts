import { useRef } from "react";

import type { movePosition } from "./useMouseEventDebugComponentItem";
import type { DebugElement } from "../types/elementTreeTypes";
import { useElementTreeStore } from "../store/useElementTreeStore";

/**
 * 드래그 시작 시 현재 위치(margin / transform)를 저장하는 hook
 */
// startPositionsManager.ts


/**
 * 드래그 시작 시 현재 위치(margin / transform)를 저장하는 hook
 */
export function useStartPositions() {
  // startPositions.current: 각 요소별 초기 위치 저장
  const startPositions = useRef<Record<string, movePosition>>({});

  /**
   * 드래그 시작 시 호출 → 선택된 요소들의 현재 위치 저장
   */
  const setStartPositions = (selectedElementIds: string[]) => {
    const elementMap = useElementTreeStore.getState().elementMap;

    startPositions.current = {};
    selectedElementIds.forEach(id => {
      const el = elementMap[id];
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

export function setStartPositions() {
  const startPositions: Record<string, movePosition> = {};

  const elementMap = useElementTreeStore.getState().elementMap;
  const selectedElementIds = Object.values(elementMap).filter(el => el.selected).map(el => el.id);

  Object.keys(startPositions).forEach(key => delete startPositions[key]); // 초기화
  selectedElementIds.forEach(id => {
    const el = elementMap[id];
    startPositions[el.id] = {
      marginLeft: parseFloat(el.style.marginLeft || "0"),
      marginTop: parseFloat(el.style.marginTop || "0"),
      transformX: parseFloat(el.style.transformTranslateX || "0"),
      transformY: parseFloat(el.style.transformTranslateY || "0"),
      positionType: el.positionType,
    };
  });

  return startPositions;
}

/**
 * 드래그 중 현재 위치 계산 → 스타일 업데이트용 객체 반환
 */
export function getCurrentPositions(
  selectedElementIds: string[],
  startPositions: Record<string, movePosition>,
  dx: number,
  dy: number
) {
  const styles: Record<string, Partial<DebugElement["style"]>> = {};
  const elementMap = useElementTreeStore.getState().elementMap;

  selectedElementIds.forEach(id => {
    const el = elementMap[id];
    styles[el.id] = getMovePosition(startPositions[el.id], dx, dy, el.positionType);
  });

  return styles;
}

/**
 * startPosition + currentPosition 특정 요소의 현재 위치 계산
 */
export function getMovePosition(
  startPosition: movePosition,
  dx: number,
  dy: number,
  positionType: 'margin' | 'transform'
) {
  const { marginLeft, marginTop, transformX, transformY } = startPosition;
  if (positionType === 'margin') {

    return {
      marginLeft: `${marginLeft + dx}px`,
      marginTop: `${marginTop + dy}px`,
      transformTranslateX: `${transformX}px`,
      transformTranslateY: `${transformY}px`,
    };
  } else {
    return {
      marginLeft: `${marginLeft}px`,
      marginTop: `${marginTop}px`,
      transformTranslateX: `${transformX + dx}px`,
      transformTranslateY: `${transformY + dy}px`,
    };
  }
}

/**
 * 현재 elementMap 의 상태를 기반으로 SCSS 문자열 생성
 * - rootElementIds 아래의 모든 후손을 "flat" 하게 출력
 * - 클래스명 기반 selector 사용
 */
export function getPositionScss(
  elementMap: Record<string, DebugElement>,
  rootElementIds: string[],
  targetSelector: string
) {
  const lines: string[] = [];

  // 클래스명 selector 생성
  const makeClassSelector = (element: DebugElement) => {
    return element.className.length > 0
      ? `.${element.className.join(".")}`
      : ""; // 클래스 없는 경우 빈 문자열
  };

  // 재귀적으로 후손 요소 수집
  const collectAllDescendants = (element: DebugElement, result: DebugElement[]) => {
    element.children.forEach(childId => {
      const child = elementMap[childId];
      if (child) {
        result.push(child);
        collectAllDescendants(child, result); // 재귀 호출
      }
    });
  };

  rootElementIds.forEach(rootId => {
    const rootElement = elementMap[rootId];
    if (rootElement) {
      // 루트 셀렉터는 targetSelector 사용
      const rootSelector = targetSelector;
      
      if (!rootSelector) {
        // 루트 셀렉터 없으면 스킵
        return;
      }

      // 루트 열기
      lines.push(`${rootSelector} {`);

      // flat list 만들기
      const flatDescendants: DebugElement[] = [];
      collectAllDescendants(rootElement, flatDescendants);

      // flat 으로 SCSS 출력
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
