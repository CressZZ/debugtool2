import { useEffect, useRef } from "react";
import { useShallow } from 'zustand/shallow';

import { selectedElementIdsSelector, selectedElementsSelector } from "../store/elementTreeSelectors";
import { useElementTreeStore } from "../store/useElementTreeStore";

import {

  getPositionScss,

} from "./useStartPositions";
import { useMoveElement } from "./useMoveElement";

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

  const selectedElementIdsRef = useRef<string[]>([]);


  const { moveStartKeyboard: moveUpdateKeyboard, moveEnd } = useMoveElement();
  
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
      moveUpdateKeyboard(e);
    }
  };

  // 👉 방향키 keyup → store 업데이트
  const handleKeyupArrow = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      moveEnd();
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



}
