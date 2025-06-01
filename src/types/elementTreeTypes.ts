
// --- 타입 정의 ---
export type ElementId = string;

export type DebugElement = {
  id: ElementId;
  tagName: string;
  className: string[];
  parentId?: string;
  selected: boolean;
  isAnyAncestorSelected: boolean;
  isAnyDescendantSelected: boolean;
  hidden: boolean;
  children: ElementId[];
  positionType: 'margin' | 'transform';

  style: {
    marginTop: string;
    marginLeft: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
    position: string;
    background: string;
    backgroundImage: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    display: string;
    transformTranslateX:string;
    transformTranslateY:string;
    pointerEvents: string;
  };
};

export type ElementMap = Record<ElementId, DebugElement>;

