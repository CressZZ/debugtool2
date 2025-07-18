import { memo } from "react";
import { useShallow } from "zustand/shallow";
import { useMouseEventDebugComponentItem } from "../../hooks/useMouseEventDebugComponentItem";
import { makeElementsByElementIdSelector } from "../../store/selectors/elementTreeSelectors";
import { useElementTreeStore } from "../../store/useElementTreeStore";
import { type DebugElement } from "../../types/elementTreeTypes";

export const DebugComponentItem = memo(function DebugComponentItem({  elementId }: { elementId: string }) {

 const element = useElementTreeStore(useShallow(makeElementsByElementIdSelector(elementId)));

  return (
    <DebugComponentBox element={element}  >
      <DebugComponentChildren element={element}  />
    </DebugComponentBox>
  );
});

// 감싸고 있는놈

export const DebugComponentBox = memo(function DebugComponentBox({ element, children }: { element: DebugElement, children?: React.ReactNode }) {
  const rootElementId = useElementTreeStore(state => state.rootElementId);

  // console.log("DebugComponentBox", element.id)
  const defaultStyle = {
    outline: "2px solid rgba(255, 0, 0, 0.7)",
    backgroundColor: 'transparent',
    // pointerEvents: 'none',
    cursor: "move",
    opacity: '1',
    zIndex: '1',
  }

  const selectedStyle = {
    outline: "2px solid green",
    opacity: '0.6',
    zIndex: '1000',
    backgroundColor: 'rgba(57, 173, 106, 0.6)', 
    pointerEvents: 'auto',
  }

  const hiddenStyle = {
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '0',
  }

  // 부모가 선태되어 있는 경우 자식은 포인터 이벤트 먹으면 안됨
  const anyAncestorSelectedStyle = {
    pointerEvents: 'none',
    opacity: '0.4',
    outline: "2px solid rgba(218, 222, 2)",
    backgroundColor: 'rgba(218, 222, 2, 0.6)', 
  }

  // 자식이 선택된 경우, 그 부모는 형제들 사이에서도 위로 올라와야 함
  const anyDescendantSelectedStyle = {
    zIndex: '1000',
    position: 'absolute',
    outline: "2px solid rgba(91, 138, 138)",
    opacity: '0.8',
    backgroundColor: 'rgba(240, 223, 217, 0.6)', 
  }

  const rootStyle = {
    // pointerEvents: 'none',
    cursor:'default',
    backgroundColor: 'transparent',
    opacity: '1'
  }

  let currentStyle = { ...element.style, ...defaultStyle };


  if (element.selected) {
    currentStyle = { ...currentStyle, ...selectedStyle };
  }


  if(element.isAnyAncestorSelected) {
    currentStyle = { ...currentStyle, ...anyAncestorSelectedStyle };
  }

  if(element.isAnyDescendantSelected) {
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
    right, bottom,cursor
  } = currentStyle;

  // const element = useElementTreeStore(makeElementsByElementIdSelector(element.id));
  // console.log("selectedElementsByElementId", selectedElementsByElementId)
  const { handleMouseDown: onMouseDown } = useMouseEventDebugComponentItem();


  // positionType 에 따라 다르게 처리
  // const trasnformStyle = !transformTranslateX && !transformTranslateY ? '' : `translate(${transformTranslateX}, ${transformTranslateY})`;
  // const marginTopStyle = !marginTop ? '' : `margin-top: ${marginTop}px`;
  // const marginLeftStyle = !marginLeft ? '' : `margin-left: ${marginLeft}px`;
  // console.log("transformTranslateX", transformTranslateX, transformTranslateY);
  // const elementRef = useRef<HTMLDivElement>(null);

  // if(elementRef.current) {
  //   elementRef.current.style.transform = `translate(${transformTranslateX}, ${transformTranslateY})`;
  // }

  
  return (
    <div
    // ref={elementRef}
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
        cursor: cursor,
        transform: `translate(${transformTranslateX}, ${transformTranslateY})`,

      }}
      data-id={element.id}
      data-class-name={element.className.join(" ")}
      data-transform = {`translate(${transformTranslateX}, ${transformTranslateY})`}
    >
      {children}
    </div>
  );
});


// 순환 돌리는 녀석
export function DebugComponentChildren({
  element,
}: {
  element: DebugElement;
}) {
  // const elementMap = useElementTreeStore(state => state.elementMap);

  // console.log("DebugComponentChildren", element.id)
  if (!element.children?.length) return null;

  return (
    <>
      {element.children.map((childId) => (
        <DebugComponentItem key={childId}  elementId={childId} />
      ))}
    </>
  );
}