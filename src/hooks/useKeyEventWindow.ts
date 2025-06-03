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

  const updateElementStyle = useElementTreeStore(state => state.updateElementStyle);

  // let startPositions: Record<string, movePosition> = {};
  const startPositionsRef = useRef<Record<string, movePosition>>({});
  const isMoving = useRef(false);
  const selectedElementIdsRef = useRef<string[]>([]);

  // 누적 이동값 저장용 ref
  const currentDx = useRef(0);
  const currentDy = useRef(0);

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
      moveElement(e);
    }
  };

  // 👉 방향키 keyup → store 업데이트
  const handleKeyupArrow = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();

      if(isMoving.current) {
        endMoveElement();
        isMoving.current = false;
      }
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


  const startMoveElement = () => {
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

  const moveElement = (e: KeyboardEvent) => {
    // 요소 움직이기 시작
    if(!isMoving.current) {
      isMoving.current = true;
      startMoveElement();
    }

    // 요소 움직이기 중
    onMoveElement(e);
  }

  const onMoveElement = (e: KeyboardEvent) => {
    getDistance(e);
    applyTransformTemp();
  }

  const endMoveElement = () => {
    updateElementPositions();
    clearTransformTemp();
  }

  const getDistance = (e: KeyboardEvent) => {
    if(e.key === "ArrowUp") {
      currentDy.current += -1;
    } else if(e.key === "ArrowDown") {
      currentDy.current += 1;
    } else if(e.key === "ArrowLeft") {
      currentDx.current += -1;
    } else if(e.key === "ArrowRight") {
      currentDx.current += 1;
    }
  }

  const updateElementPositions = () => {

    const positionStyles = getCurrentPositions(
      selectedElementIdsRef.current,
      startPositionsRef.current,
      currentDx.current,
      currentDy.current
    );

    updateMultipleElementsStyle(positionStyles);
  };

}
