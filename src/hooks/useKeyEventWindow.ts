import { useEffect, useRef } from "react";
import { useShallow } from 'zustand/shallow';

import { selectedElementIdsSelector, selectedElementsSelector } from "../store/elementTreeSelectors";
import { useElementTreeStore } from "../store/useElementTreeStore";
import type { movePosition } from "./useMouseEventDebugComponentItem";
import {
  getCurrentPositions,
  getPositionScss,
  setStartPositions,
} from "./useStartPositions";

export function useKeyEventWindow({targetSelector, positionStyleFilePath}: {targetSelector: string, positionStyleFilePath?: string}) {
  const selectedElement = useElementTreeStore(useShallow(selectedElementsSelector));
  const selectedElementIds = useElementTreeStore(useShallow(selectedElementIdsSelector));

  const elementMap = useElementTreeStore(state => state.elementMap);
  const rootElementId = useElementTreeStore(state => state.rootElementId);
  const elementMapRef = useRef(elementMap);
  const rootElementIdRef = useRef(rootElementId);
  const unselectElement = useElementTreeStore(state => state.unselectElement);
  const toggleHiddenAllElement = useElementTreeStore(state => state.toggleHiddenAllElement);
  const toggleHiddenElement = useElementTreeStore(state => state.toggleHiddenElement);
  const undo = useElementTreeStore(state => state.undo);
  const redo = useElementTreeStore(state => state.redo);

  const updateMultipleElementsStyle = useElementTreeStore(state => state.updateMultipleElementsStyle);
  const moveTargetElementsRef = useRef<HTMLElement[]>([]);


  // let startPositions: Record<string, movePosition> = {};
  const startPositionsRef = useRef<Record<string, movePosition>>({});
  const isKeydownArrowing = useRef(false);
  const selectedElementIdsRef = useRef<string[]>([]);

  // 누적 이동값 저장용 ref
  const moveDeltaRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });


  // Keep selectedElementIds in ref
  useEffect(() => {
    selectedElementIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);

  useEffect(() => {
    elementMapRef.current = elementMap;
    rootElementIdRef.current = rootElementId;
  }, [elementMap, rootElementId]);

  // 최신 selectedElement 유지
  const selectedElementRef = useRef(selectedElement);
  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  // 👉 일반 키 핸들링 (단축키들)
  const handleKeydown = async (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      e.stopPropagation();

      const positionScss = getPositionScss(
        elementMapRef.current,
        rootElementIdRef.current,
        targetSelector
      );

      navigator.clipboard.writeText(positionScss);
      console.log(positionScss);

      if(positionStyleFilePath){

        const payload = [positionStyleFilePath, positionScss];

        try {
          const res = await fetch('/api/write', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
  
          if (!res.ok) {
            const errText = await res.text();
            console.error('❌ 저장 실패:', errText);
          } else {
            const data = await res.json();
            console.log('✅ 저장 성공:', data);
          }
        } catch (err) {
          console.error('❌ 네트워크 오류:', err);
        }
      }
    }

    if (e.key === "Escape") {
      selectedElementRef.current.forEach((element) => {
        unselectElement(element.id);
      });
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "h" || e.key === "H" || e.key === "ㅗ")
    ) {
      toggleHiddenAllElement();
      return;
    }

    if (e.key === "h" || e.key === "H" || e.key === "ㅗ") {
      selectedElementRef.current.forEach((element) => {
        toggleHiddenElement(element.id);
      });
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      e.shiftKey &&
      (e.key === "z" || e.key === "Z" || e.key === "ㅈ")
    ) {
      redo();
      return;
    }

    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "z" || e.key === "Z" || e.key === "ㅈ")
    ) {
      undo();
      return;
    }
  };

  // 👉 방향키 keydown → transform 적용
  const handleKeydownArrow = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {



      if(!isKeydownArrowing.current){
        isKeydownArrowing.current = true;
        startPositionsRef.current = setStartPositions();

        moveTargetElementsRef.current = selectedElementIdsRef.current.map(id => {
          return document.querySelector(`[data-id="${id}"]`) as HTMLElement;
        }).filter(Boolean);

        // selectedElementIdsRef.current = selectedElementIdsSelector(useElementTreeStore.getState());
      }

      e.preventDefault();


      const isMeta = e.metaKey || e.ctrlKey;

      const deltaX = (e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0) * (isMeta ? 100 : 1);
      const deltaY = (e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0) * (isMeta ? 100 : 1);

      // if(isMeta) {
      //   window.addEventListener("keydown", (e) => {
      //     if (!(e.metaKey || e.ctrlKey) || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      //       // metaKey 가 풀린 상태 → 강제 finalize
      //       handleCancelArrowKey();
      //     }
      //   });
      // }

      // 누적 이동값 업데이트
      moveDeltaRef.current.dx += deltaX;
      moveDeltaRef.current.dy += deltaY;


      // DOM transform 임시 적용
      console.log("deltaX", deltaX, deltaY);
      applyTransformToTargets();
    }
  };

  const handleCancelArrowKey = () => {
    const positionStyles = getCurrentPositions(
      selectedElementIdsRef.current,
      startPositionsRef.current,
      moveDeltaRef.current.dx,
      moveDeltaRef.current.dy
    );
  
    updateMultipleElementsStyle(positionStyles);

    // 누적값 초기화
    moveDeltaRef.current = { dx: 0, dy: 0 };

    clearTransform();

    isKeydownArrowing.current = false;
  };

  // 👉 방향키 keyup → store 업데이트
  const handleKeyupArrow = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();


      handleCancelArrowKey();
    }
  };

  // 이벤트 등록
  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keydown", handleKeydownArrow);
    window.addEventListener("keyup", handleKeyupArrow);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keydown", handleKeydownArrow);
      window.removeEventListener("keyup", handleKeyupArrow);
    };
  }, []);

  const applyTransformToTargets = () => {
    moveTargetElementsRef.current.forEach(el => {
      const elementId = el.getAttribute("data-id")!;
      const startPos = startPositionsRef.current[elementId];
      
      el.style.transform = `translate(${startPos.transformX + moveDeltaRef.current.dx}px, ${startPos.transformY + moveDeltaRef.current.dy}px)`;
    });
  };
  
  const clearTransform = () => {
    moveTargetElementsRef.current.forEach(el => {
      const startPos = startPositionsRef.current[el.getAttribute("data-id")!];
      el.style.transform = `translate(${startPos.transformX}px, ${startPos.transformY}px)`;
    });

    moveTargetElementsRef.current = [];
  };

}
