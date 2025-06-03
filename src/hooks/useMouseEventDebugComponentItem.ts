import { useEffect, useRef } from "react";
import { useShallow } from 'zustand/shallow';
import { getCurrentPositions, setStartPositions } from "./useStartPositions";
import type { DebugElement } from "../types/elementTreeTypes";
import { useElementTreeStore } from "../store/useElementTreeStore";
import { selectedElementIdsSelector } from "../store/elementTreeSelectors";

export type movePosition = {
  marginLeft: number;
  marginTop: number;
  transformX: number;
  transformY: number;
  positionType: 'margin' | 'transform';
};

export function useMouseEventDebugComponentItem() {
  // 루트 요소 아이디
  const rootElementId = useElementTreeStore(state => state.rootElementId);

  // 액션
  const selectElement = useElementTreeStore(state => state.selectElement);
  const selectOnlyElement = useElementTreeStore(state => state.selectOnlyElement);
  const unselectAllElement = useElementTreeStore(state => state.unselectAllElement);
  const updateMultipleElementsStyle = useElementTreeStore(state => state.updateMultipleElementsStyle);
  const updateElementStyle = useElementTreeStore(state => state.updateElementStyle);

  // 선택된 요소
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));
  const selectedElementIdsRef = useRef<string[]>([]); 

  // 타겟 REF
  const currentTargetElementRef = useRef<DebugElement | null>(null);

  // 마우스 상태
  const isMouseDownning = useRef(false);
  const isMouseMoving = useRef(false);

  // 마우스 위치
  const startX = useRef(0);
  const startY = useRef(0);
  const currentDx = useRef(0);
  const currentDy = useRef(0);

  // 요소 시작 위치
  const startPositionsRef = useRef<Record<string, movePosition>>({});

  // 선택된 요소 업데이트
  // 실시간 업데이트를 위해 Ref 사용, 사용안하면 useMouseEventDebugComponentItem 호출시 마다 
  // 생성된 값을 클로저로 참조하기 때문에 값이 변경되지 않음
  useEffect(() => {
    selectedElementIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);

  // --- 기능 함수 쪼개기 ---

  // 마우스 다운 했을때 선택 처리
  const selectTargetAtDown = (e: React.MouseEvent) => {
    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;

    if (isMetaPressed || isCtrlPressed) {
      selectElement(currentTargetElementRef.current!.id);
    } else {
      if (!currentTargetElementRef.current!.selected) {
        selectOnlyElement(currentTargetElementRef.current!.id);
      }
    }

    // [TODO] 루트 요소 선택시 모두 선택 해제
    if (rootElementId.includes(currentTargetElementRef.current!.id)) {
      unselectAllElement();
    }
  };


  // 마우스 업 했을때 선택처리
  const selectTargetAtUp = (e: MouseEvent, element: DebugElement) => {
    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;

    // 움직였던게 아니라면, 멀티 선택 요소 해제하하고 하나만 선택
    if (!(isMetaPressed || isCtrlPressed) && !isMouseMoving.current) {
      selectOnlyElement(element.id);
    }
  };


  const updateElementPositions = () => {

    const positionStyles = getCurrentPositions(
      selectedElementIdsRef.current,
      startPositionsRef.current,
      currentDx.current,
      currentDy.current
    );

    updateMultipleElementsStyle(positionStyles);
  };

  const getMosuePosition = (e: MouseEvent) => {
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    currentDx.current = dx;
    currentDy.current = dy;
  }


  const applyTransformTemp = () => {
    selectedElementIdsRef.current.forEach(id => {
      const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
      const startPos = startPositionsRef.current[id];
      el.style.transform = `translate(${startPos.transformX + currentDx.current}px, ${startPos.transformY + currentDy.current}px)`;
    });
  };

  const clearTransformTemp = () => {
    selectedElementIdsRef.current.forEach(id => {
      const startPos = startPositionsRef.current[id];

      const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
      el.style.transform = `translate(${startPos.transformX}px, ${startPos.transformY}px)`

      updateElementStyle(id, {
        transformTranslateX: `${startPositionsRef.current[id].transformX}px`,
        transformTranslateY: `${startPositionsRef.current[id].transformY}px`,
      });
    });
  };


  // --- 핸들러 ---
  const handleMouseDown = (e: React.MouseEvent, element: DebugElement) => {
    if(!element) return;

    isMouseDownning.current = true;
    
    currentTargetElementRef.current = element;
    e.stopPropagation();

    selectTargetAtDown(e);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUpSelect = (e: MouseEvent) => {
    if (!currentTargetElementRef.current) return;
    selectTargetAtUp(e, currentTargetElementRef.current);
  }

  const startMove = (e: MouseEvent) => {
    isMouseMoving.current = true;

    // 마우스 클릭 시작 지점
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentDx.current = 0;
    currentDy.current = 0;

    // 요소 시작 지점 
    startPositionsRef.current = setStartPositions();
      
    selectedElementIdsRef.current.forEach(id => {
      updateElementStyle(id, {
        transformTranslateX: ``,
        transformTranslateY: ``,
      });
    });
  }
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDownning.current || !selectedElementIdsRef.current.length || !currentTargetElementRef.current) return;

    if(!isMouseMoving.current) {
      startMove(e);
    }

    onMove(e);
  };

  const onMove = (e: MouseEvent) => {
    getMosuePosition(e);
    applyTransformTemp();
  }

  const endMove = () => {
    updateElementPositions();
    clearTransformTemp();
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!currentTargetElementRef.current) return;

    selectTargetAtUp(e, currentTargetElementRef.current);

    if(isMouseMoving.current) {
      endMove();
    }
    
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    isMouseDownning.current = false;
    isMouseMoving.current = false;
    currentTargetElementRef.current = null;
  };

  // --- cleanup ---

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // --- expose ---

  return { handleMouseDown };
}
