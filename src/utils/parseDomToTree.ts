import { v4 as uidv4 } from 'uuid';
import type { Element, ElementId, ElementTreeState } from "../context/ElementTreeContext";

function createElement(el: HTMLElement, parentId?: string): Element {
  const id = uidv4().slice(0, 5);
  const computed = getComputedStyle(el);

  return {
    id,
    tagName: el.tagName.toLowerCase(),
    className: Array.from(el.classList),
    parentId,
    selected: false,
    positionType: 'margin',
    style: {
      marginTop: computed.marginTop,
      marginLeft: computed.marginLeft,
      top: el.style.top,
      left: el.style.left,
      position: computed.position,
      background: computed.background,
      backgroundImage: computed.backgroundImage,
      zIndex: computed.zIndex,
      width: computed.width,
      height: computed.height,
      opacity: computed.opacity,
      display: computed.display,
    },
    children: [],
  };
}

export function parseDomToTree(rootEl: HTMLElement): ElementTreeState {
  const elementMap: Record<string, Element> = {};
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
  return { elementMap,rootElementId };
}
