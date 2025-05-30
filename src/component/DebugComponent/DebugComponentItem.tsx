import {  type ReactNode } from "react";
import {  type DebugElement } from "../../context/ElementTreeContext";
import { useElementTree, useElementTreeDispatch } from "../../hooks/useElementTree";
import { useDraggableElement } from "../../hooks/useDraggableElement";

export function DebugComponentItem({ element }: { element: DebugElement }) {
  const { elementMap } = useElementTree();

  return (
    <DebugComponentBox element={element} >
      <DebugComponentChildren element={element} elementMap={elementMap} />
    </DebugComponentBox>
  );
}


// 감싸고 있는놈

export function DebugComponentBox({ element, children }: { element: DebugElement; children: ReactNode }) {
  const {
    position, top, left, width, height,
    background, backgroundImage, zIndex,
    opacity, display, marginTop, marginLeft
  } = element.style;

  const dispatch = useElementTreeDispatch();
  
  const { onMouseDown } = useDraggableElement({ elementId: element.id, });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SELECTED_ELEMENT", payload: { elementId: element.id } });
  };

  const outline = element.selected ? "1px solid teal" : "1px solid red";

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={handleClick}
      style={{
        position: position as 'absolute' | 'relative' | 'fixed' | 'sticky' | 'static' | 'initial' | 'inherit',
        top, left, width, height,
        background, backgroundImage, zIndex,
        opacity, display,
        marginTop, marginLeft,
        outline,
        cursor: "move",
        transform: `translate(${element.style.transformTranslateX}, ${element.style.transformTranslateY})`,
      }}
      data-id={element.id}
      data-class-name={element.className.join(" ")}
    >
      {children}
    </div>
  );
}

// 순환 돌리는 녀석
export function DebugComponentChildren({
  element,
  elementMap,
}: {
  element: DebugElement;
  elementMap: Record<string, DebugElement>;
}) {
  if (!element.children?.length) return null;

  return (
    <>
      {element.children.map((childId) => (
        <DebugComponentItem key={childId} element={elementMap[childId]} />
      ))}
    </>
  );
}