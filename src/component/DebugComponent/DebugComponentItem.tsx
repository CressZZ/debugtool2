import {  type ReactNode } from "react";
import {  type DebugElement } from "../../context/ElementTreeContext";
import { useElementTree } from "../../hooks/useElementTree";
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
    // backgroundColor: 'rgba(0, 245, 245, 0.6)', 

  }

  const rootStyle = {
    pointerEvents: 'none',
  }

  let currentStyle = { ...element.style, ...defaultStyle };


  if (element.selected) {
    currentStyle = { ...currentStyle, ...selectedStyle };
  }

  const isAnyAncestorSelected = (element: DebugElement): boolean => {
    if (!element.parentId) {
      // 루트까지 올라갔으면 false
      return false;
    }
  
    const parent = elementMap[element.parentId];
    if (!parent) {
      return false;
    }
  
    if (parent.selected) {
      return true;
    }
  
    // 부모의 부모 재귀 검사
    return isAnyAncestorSelected(parent);
  };
  
  if(isAnyAncestorSelected(element)) {
    currentStyle = { ...currentStyle, ...parentSelectedStyle };
  }

  const isAnyDescendantSelected = (element: DebugElement): boolean => {
    // 현재 element 의 children 에서 selected 인 애가 있는지 체크
    return element.children.some(childId => {
      const child = elementMap[childId];
      if (!child) return false;
  
      // 자식이 selected 면 true
      if (child.selected) return true;
  
      // 아니면 자식의 자식 재귀 검사
      return isAnyDescendantSelected(child);
    });
  };

  if(isAnyDescendantSelected(element)) {
    currentStyle = { ...currentStyle, ...childSelectedStyle };
  }
  if (element.hidden) {
    currentStyle = { ...currentStyle, ...hiddenStyle };
  } 
  if(rootElementId.includes(element.id)) {
    currentStyle = { ...currentStyle, ...rootStyle };
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