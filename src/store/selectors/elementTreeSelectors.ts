import type { ElementTreeState } from "../useElementTreeStore";

export const selectedElementsSelector = (state: ElementTreeState) =>
  Object.values(state.elementMap).filter(el => el.selected);

export const selectedElementIdsSelector = (state: ElementTreeState) =>{
  return Object.values(state.elementMap).filter(el => el.selected).map(el => el.id);
}

export const makeElementsByElementIdSelector = (elementId: string) =>
  (state: ElementTreeState) => state.elementMap[elementId];