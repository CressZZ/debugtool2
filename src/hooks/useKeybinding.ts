import { useEffect } from "react";
import { useElementTreeDispatch, useSelectedElement } from "./useElementTree";

export function useKeybinding() {

  const dispatch = useElementTreeDispatch();

  const selectedElement = useSelectedElement();
;


  const handleKeydown = (e: KeyboardEvent) => {
    console.log('handleKeydown', e);

    switch (e.key) {
      case 'Escape':
        selectedElement.forEach(element => {
          dispatch({ type: "UNSELECT_ELEMENT", payload: { elementId: element.id } });
        });

        break;
      case 'ArrowUp':
        console.log('ArrowUp');
        break;
      case 'ArrowDown':
        console.log('ArrowDown');
        break;
      case 'ArrowLeft':
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    }
  }, [selectedElement]);
}