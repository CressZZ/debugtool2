// useMoveElement.ts

import { useEffect, useRef } from "react";
import { getCurrentPositions, setStartPositions } from "./useStartPositions";
import { useElementTreeStore } from "../store/useElementTreeStore";
import { useShallow } from "zustand/shallow";
import { selectedElementIdsSelector } from "../store/selectors/elementTreeSelectors";
import type { movePosition } from "./useMouseEventDebugComponentItem";

export function useMoveElement() {
  // --- Store 액션 ---
  const updateMultipleElementsStyle = useElementTreeStore(state => state.updateMultipleElementsStyle);
  const updateElementStyle = useElementTreeStore(state => state.updateElementStyle);

  // --- 선택된 요소 ---
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));
  const selectedElementIdsRef = useRef<string[]>([]);

  // 🚩 selectedElementIds 를 최신 상태 유지 (window 이벤트 핸들러에서도 안전하게 사용)
  useEffect(() => {
    selectedElementIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);

  // --- 상태 저장 ---
  const startPositionsRef = useRef<Record<string, movePosition>>({});
  
  // 이동 상태 관리용 ref (공통 사용)
  const moveState = useRef({
    isMoving: false,  // 현재 이동 중인지 여부
    dx: 0,            // 누적 이동 거리 (X)
    dy: 0,            // 누적 이동 거리 (Y)
    startX: 0,        // 마우스 시작 위치 (X)
    startY: 0,        // 마우스 시작 위치 (Y)
  });

  // --- 이동 준비 ---
  const movePrepare = (type: "mouse" | "keyboard", payload?: { x: number; y: number }) => {
    // 시작 위치 저장
    startPositionsRef.current = setStartPositions();
    moveState.current.dx = 0;
    moveState.current.dy = 0;

    // 마우스 이동 시 시작 좌표 기록
    if (type === "mouse" && payload) {
      moveState.current.startX = payload.x;
      moveState.current.startY = payload.y;
    }

    // Transform 초기화
    selectedElementIdsRef.current.forEach(id => {
      updateElementStyle(id, {
        transformTranslateX: ``,
        transformTranslateY: ``,
      });
    });

    // 이동 시작
    moveState.current.isMoving = true;
  };

  // --- 마우스 이동 ---
  const moveStartMouse = (e: MouseEvent) => {
    // 최초 이동 준비
    if (!moveState.current.isMoving) {
      movePrepare("mouse", { x: e.clientX, y: e.clientY });
    }

    // 현재 이동 거리 계산
    moveState.current.dx = e.clientX - moveState.current.startX;
    moveState.current.dy = e.clientY - moveState.current.startY;

    // Transform 적용
    applyTransformTemp();
  };

  // --- 키보드 이동 ---
  const moveStartKeyboard = (e: KeyboardEvent) => {
    // 최초 이동 준비
    if (!moveState.current.isMoving) {
      movePrepare("keyboard");
    }

    // 방향키 누를 때마다 누적 이동 거리 업데이트
    switch (e.key) {
      case "ArrowUp":
        moveState.current.dy += -1;
        break;
      case "ArrowDown":
        moveState.current.dy += 1;
        break;
      case "ArrowLeft":
        moveState.current.dx += -1;
        break;
      case "ArrowRight":
        moveState.current.dx += 1;
        break;
    }

    // Transform 적용
    applyTransformTemp();
  };

  // --- 이동 종료 ---
  const moveEnd = () => {
    // 이동 중이 아닐 경우 무시
    if (!moveState.current.isMoving) return;

    // 최종 위치 업데이트 → store 반영
    updateElementPositions();

    // Transform 초기화
    clearTransformTemp();

    // 상태 초기화
    moveState.current.isMoving = false;
  };

  // --- 임시 Transform 적용 (화면에 보여주기용) ---
  const applyTransformTemp = () => {
    selectedElementIdsRef.current.forEach(id => {
      const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
      const startPos = startPositionsRef.current[id];

      // 현재 이동 거리 적용
      el.style.transform = `translate(${startPos.transformX + moveState.current.dx}px, ${startPos.transformY + moveState.current.dy}px)`;
    });
  };

  // --- Transform 초기화 ---
  const clearTransformTemp = () => {
    selectedElementIdsRef.current.forEach(id => {
      const startPos = startPositionsRef.current[id];
      const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement;

      // 원래 위치로 되돌림
      el.style.transform = `translate(${startPos.transformX}px, ${startPos.transformY}px)`;

      // store 에 원복
      updateElementStyle(id, {
        transformTranslateX: `${startPos.transformX}px`,
        transformTranslateY: `${startPos.transformY}px`,
      });
    });
  };

  // --- 최종 위치를 store 에 반영 ---
  const updateElementPositions = () => {
    const positionStyles = getCurrentPositions(
      selectedElementIdsRef.current,
      startPositionsRef.current,
      moveState.current.dx,
      moveState.current.dy
    );

    updateMultipleElementsStyle(positionStyles);
  };

  // --- API 반환 ---
  return {
    movePrepare,        // 수동으로 준비 가능 (필요 시)
    moveStartMouse,     // 마우스 이동 시 호출
    moveStartKeyboard,  // 키보드 이동 시 호출
    moveEnd,            // 이동 종료 시 호출
    moveState,          // 현재 이동 상태 (참조 가능)
  };
}
