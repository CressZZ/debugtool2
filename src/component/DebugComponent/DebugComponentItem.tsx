import {  type ReactNode } from "react";
import {  type DebugElement } from "../../context/ElementTreeContext";
import { useElementTree } from "../../hooks/useElementTree";
import { useMouseEventDebugComponentItem } from "../../hooks/useMouseEventDebugComponentItem";

export function DebugComponentItem({ element }: { element: DebugElement }) {
  const { elementMap } = useElementTree();

  return (
    <DebugComponentBox element={element} elementMap={elementMap} >
      <DebugComponentChildren element={element} elementMap={elementMap} />
    </DebugComponentBox>
  );
}


// 감싸고 있는놈

export function DebugComponentBox({ element, children, elementMap }: { element: DebugElement; children: ReactNode, elementMap: Record<string, DebugElement> }) {
  const defaultStyle = {
    outline: "2px solid red",
    backgroundColor: 'transparent',
    // pointerEvents: 'none',
    opacity: '1',
    zIndex: '1'
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

  const parentSelectedStyle = {
    opacity: '0.4',
    pointerEvents: 'none',
    // zIndex: '1000',
    outline: "2px solid rgba(218, 222, 2)",

    backgroundColor: 'rgba(218, 222, 2, 0.6)', 

  }

  const childSelectedStyle = {
    outline: "2px solid rgba(91, 138, 138)",
    opacity: '0.8',
    zIndex: '1000',
    backgroundColor: 'rgba(0, 245, 245, 0.6)', 

  }

  let currentStyle = { ...element.style, ...defaultStyle };


  if (element.selected) {
    currentStyle = { ...currentStyle, ...selectedStyle };
  }

  if(element.parentId) {
    const parentElement = elementMap[element.parentId];
    if(parentElement.selected) {
      currentStyle = { ...currentStyle, ...parentSelectedStyle };
    }
  }

if(element.children?.some(childId => elementMap[childId].selected)) {
    if(element.parentId) {
      currentStyle = { ...currentStyle, ...childSelectedStyle };

    }
  }
  if (element.hidden) {
    currentStyle = { ...currentStyle, ...hiddenStyle };
  } 
  // if (element.children?.some(childId => elementMap[childId].selected)) {
  //   if(!element.parentId) return;
  //   currentStyle = { ...currentStyle, ...childSelectedStyle };
  // }
  
  const {
    position, top, left, width, height,
    background, backgroundImage, zIndex,
    display, marginTop, marginLeft,
    opacity, outline, backgroundColor, pointerEvents,
    transformTranslateX, transformTranslateY
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