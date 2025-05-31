import {  type ReactNode } from "react";
import {  type DebugElement } from "../../context/ElementTreeContext";
import { isAnyAncestorSelected, isAnyDescendantSelected, useElementTree } from "../../hooks/useElementTree";
import { useMouseEventDebugComponentItem } from "../../hooks/useMouseEventDebugComponentItem";

export function DebugComponentItem({ element }: { element: DebugElement }) {
  const { elementMap, rootElementId } = useElementTree();

  return (
    <DebugComponentBox element={element} elementMap={elementMap} rootElementId={rootElementId} >
      <DebugComponentChildren element={element} elementMap={elementMap} />
    </DebugComponentBox>
  );
}


// 감싸고 있는놈

export function DebugComponentBox({ element, children, elementMap, rootElementId }: { element: DebugElement; children: ReactNode, elementMap: Record<string, DebugElement>, rootElementId: string[] }) {
  const defaultStyle = {
    outline: "2px solid red",
    backgroundColor: 'transparent',
    // pointerEvents: 'none',
    opacity: '1',
    zIndex: '1',
  }

  const selectedStyle = {
    outline: "2px solid green",
    opacity: '0.8',
    zIndex: '1000',
    backgroundColor: 'rgba(57, 173, 106, 0.6)', 
    pointerEvents: 'auto',
  }

  const hiddenStyle = {
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '0',
  }

  const anyAncestorSelectedStyle = {
    opacity: '0.4',
    pointerEvents: 'none',
    // zIndex: '1000',
    outline: "2px solid rgba(218, 222, 2)",
    backgroundColor: 'rgba(218, 222, 2, 0.6)', 
  }

  const anyDescendantSelectedStyle = {
    outline: "2px solid rgba(91, 138, 138)",
    opacity: '0.8',
    zIndex: '1000',
    position: 'absolute',
    backgroundColor: 'rgba(240, 223, 217, 0.6)', 
  }

  const rootStyle = {
    pointerEvents: 'none',
  }

  let currentStyle = { ...element.style, ...defaultStyle };


  if (element.selected) {
    currentStyle = { ...currentStyle, ...selectedStyle };
  }


  if(isAnyAncestorSelected(element, elementMap)) {
    currentStyle = { ...currentStyle, ...anyAncestorSelectedStyle };
  }

  if(isAnyDescendantSelected(element, elementMap)) {
    currentStyle = { ...currentStyle, ...anyDescendantSelectedStyle };
  }

  if (element.hidden) {
    currentStyle = { ...currentStyle, ...hiddenStyle };
  } 

  if(rootElementId.includes(element.id)) {
    currentStyle = { ...currentStyle, ...rootStyle };
  }
  
  const {
    position, top, left, width, height,
    background, backgroundImage, zIndex,
    display, marginTop, marginLeft,
    opacity, outline, backgroundColor, pointerEvents,
    transformTranslateX, transformTranslateY,
    right, bottom
  } = currentStyle;

  const { onMouseDown } = useMouseEventDebugComponentItem({ elementId: element.id, });


  // positionType 에 따라 다르게 처리
  // const trasnformStyle = !transformTranslateX && !transformTranslateY ? '' : `translate(${transformTranslateX}, ${transformTranslateY})`;
  // const marginTopStyle = !marginTop ? '' : `margin-top: ${marginTop}px`;
  // const marginLeftStyle = !marginLeft ? '' : `margin-left: ${marginLeft}px`;

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
        right, bottom,
        pointerEvents: pointerEvents === 'none' ? 'none' : 'auto',
        cursor: "move",
        transform: `translate(${transformTranslateX}, ${transformTranslateY})`,
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