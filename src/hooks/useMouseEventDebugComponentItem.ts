import { useEffect, useRef } from "react";
import { useShallow } from 'zustand/shallow';
import { getCurrentPositions, setStartPositions } from "./useStartPositions";
import type { DebugElement } from "../types/elementTreeTypes";
import { useElementTreeStore } from "../store/useElementTreeStore";
import { selectedElementIdsSelector } from "../store/selectors/elementTreeSelectors";
import { useMoveElement } from "./useMoveElement";

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

  // 선택된 요소
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));
  const selectedElementIdsRef = useRef<string[]>([]); 

  // 타겟 REF
  const currentTargetElementRef = useRef<DebugElement | null>(null);

  // 마우스 상태
  const isMouseDownning = useRef(false);
  const isMoving = useRef(false);

  // 선택된 요소 업데이트
  // 실시간 업데이트를 위해 Ref 사용, 사용안하면 useMouseEventDebugComponentItem 호출시 마다 
  // 생성된 값을 클로저로 참조하기 때문에 값이 변경되지 않음
  useEffect(() => {
    selectedElementIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);


  const { moveStartMouse, moveEnd } = useMoveElement();
  
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
    if (!(isMetaPressed || isCtrlPressed) && !isMoving.current) {
      selectOnlyElement(element.id);
    }
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


  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDownning.current || !selectedElementIdsRef.current.length || !currentTargetElementRef.current) return;

    isMoving.current = true;

    // 요소 움직이기
    moveStartMouse(e)
  };


  const handleMouseUp = (e: MouseEvent) => {
    if (!currentTargetElementRef.current) return;

    selectTargetAtUp(e, currentTargetElementRef.current);
    moveEnd();

    isMouseDownning.current = false;
    isMoving.current = false;
    currentTargetElementRef.current = null;
        
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
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
