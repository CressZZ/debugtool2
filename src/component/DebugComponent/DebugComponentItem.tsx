import {  type ReactNode } from "react";
import {  type DebugElement } from "../../context/ElementTreeContext";
import { useElementTree } from "../../hooks/useElementTree";
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
  const defaultStyle = {
    outline: "2px solid red",
    backgroundColor: 'transparent',
  }

  const selectedStyle = {
    outline: "2px solid green",
    opacity: .5,
    zIndex: 1000,
    backgroundColor: 'teal',
  }

  const currentStyle = element.selected ? { ...element.style, ...selectedStyle } : { ...element.style, ...defaultStyle };

  const {
    position, top, left, width, height,
    background, backgroundImage, zIndex,
    display, marginTop, marginLeft,
    opacity, outline, backgroundColor,
  } = currentStyle;

  const { onMouseDown } = useDraggableElement({ elementId: element.id, });

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, element)}
      style={{
        position: position as 'absolute' | 'relative' | 'fixed' | 'sticky' | 'static' | 'initial' | 'inherit',
        top, left, width, height,
        background, backgroundImage, zIndex,
        opacity, display,
        marginTop, marginLeft,
        outline,
        backgroundColor,
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