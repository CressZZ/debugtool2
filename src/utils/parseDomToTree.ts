import { v4 as uidv4 } from 'uuid';
import type { DebugElement, ElementId, ElementTreeState } from "../context/ElementTreeContext";

let count = 0;

function parseTranslate(transform: string): { x: string; y: string } {
  const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
  if (match) {
    return {
      x: match[1].trim(),
      y: match[2].trim(),
    };
  }
  return { x: '0px', y: '0px' };
}


function createElement(el: HTMLElement, parentId?: string): DebugElement {
  const id = count++ + '_' + uidv4().slice(0, 5);
  const computed = getComputedStyle(el);
  const { x, y } = parseTranslate(computed.transform);
  return {
    id,
    tagName: el.tagName.toLowerCase(),
    className: Array.from(el.classList),
    parentId,
    selected: false,
    // positionType: 'transform',
    positionType: 'margin',
    style: {
      marginTop: computed.marginTop,
      marginLeft: computed.marginLeft,
      top: computed.top,
      left: computed.left,
      position: computed.position,
      background: computed.background,
      backgroundImage: computed.backgroundImage,
      zIndex: computed.zIndex,
      width: computed.width,
      height: computed.height,
      opacity: computed.opacity,
      display: computed.display,
      transformTranslateX: x,
      transformTranslateY: y,

    },
    children: [],
  };
}

export function parseDomToTree(rootEl: HTMLElement): ElementTreeState {
  const elementMap: Record<string, DebugElement> = {};
  const rootElementId = traverse(rootEl);

  // 트리 순회 하여 elementMap 채우기
  function traverse(el: HTMLElement, parentId?: string): ElementId {

    // elementNode 생성
    const element = createElement(el, parentId);
    elementMap[element.id] = element;

    // 자식 요소 순회
    Array.from(el.children).forEach((childEl) => {
      if (childEl instanceof HTMLElement) {
        const childId = traverse(childEl, element.id);
        element.children.push(childId);
      }
    });

    return element.id;
  }
  return { elementMap, rootElementId: [rootElementId] };
}
