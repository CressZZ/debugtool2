import { v4 as uidv4 } from 'uuid';
import type { DebugElement, ElementId, ElementTreeState } from "../context/ElementTreeContext";

let count = 0;

const noStaticPosition = ['absolute', 'fixed', 'relative'];

function parseTranslate(transform: string): { x: string; y: string } {

  const match = transform.match(/matrix\([^,]+, [^,]+, [^,]+, [^,]+, ([^,]+), ([^)]+)\)/);

  if (match) {
    const translateX = match[1].trim();
    const translateY = match[2].trim();
    
    return { x: translateX + 'px', y: translateY + 'px' };
  } 

  return { x: '0px', y: '0px' };
}


function createElement({el, parentId, isRoot}: {el: HTMLElement, parentId?: string, isRoot?: boolean}): DebugElement {
  const id = count++ + '_' + uidv4().slice(0, 5);
  const computed = getComputedStyle(el);
  const { x, y } = parseTranslate(computed.transform);
  // const isMiddleLeft = window.innerWidth / 2 < Number(computed.left.replace('px', '')) + 1 && window.innerWidth / 2 > Number(computed.left.replace('px', '')) - 1;
  // const isMiddleTop = window.innerHeight / 2 < Number(computed.top.replace('px', '')) + 1 && window.innerHeight / 2 > Number(computed.top.replace('px', '')) - 1;
  // console.log(isMiddleLeft, isMiddleTop, window.innerWidth / 2, window.innerHeight / 2, computed.left, computed.top);
  return {
    id,
    tagName: el.tagName.toLowerCase(),
    hidden: false,
    className: Array.from(el.classList),
    parentId,
    selected: false,
    // positionType: 'transform', // 사용안함
    positionType: 'margin',
    style: {
      pointerEvents: 'auto',
      marginTop: computed.marginTop,
      marginLeft: computed.marginLeft,
      top: isRoot ? '0' : computed.top,
      left: isRoot ? '0' : computed.left,
      right: isRoot ? '0' : computed.right,
      bottom: isRoot ? '0' : computed.bottom,
      position: computed.position,
      background: !isRoot ? computed.background : 'transparent',
      backgroundImage: !isRoot ? computed.backgroundImage : 'none',
      zIndex: computed.zIndex,
      width: isRoot ? '100%' : computed.width,
      height: isRoot ? '100%' : computed.height,
      opacity: '1',
      display: 'block',
      transformTranslateX: noStaticPosition.includes(computed.position) ? x : '',
      transformTranslateY: noStaticPosition.includes(computed.position) ? y : '',
    },
    children: [],
  };
}

export function parseDomToTree(rootEl: HTMLElement, excludeTargetSelector: string[] = []): ElementTreeState {
  const elementMap: Record<string, DebugElement> = {};

  // 처음에만 isRoot
  const rootElementId = traverse({el: rootEl, isRoot: true});

  // 트리 순회 하여 elementMap 채우기
  function traverse({el, parentId, isRoot}: {el: HTMLElement, parentId?: string, isRoot?: boolean}): ElementId {

    // elementNode 생성
    const element = createElement({el, parentId, isRoot});
    elementMap[element.id] = element;

    // 자식 요소 순회
    Array.from(el.children).forEach((childEl) => {
      if (childEl instanceof HTMLElement) {
    
        // 🚀 exclude 처리
        if (excludeTargetSelector.some(selector => childEl.matches(selector))) {
          return; // skip this element
        }
    
        const childId = traverse({ el: childEl, parentId: element.id, isRoot: false });
        element.children.push(childId);
      }
    });
    
    
    // 아이디 반환
    return element.id;
  }

  return { elementMap, rootElementId: [rootElementId], history: { past: [], future: [] } };
}
