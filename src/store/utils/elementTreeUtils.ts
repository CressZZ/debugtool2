import type { DebugElement, ElementMap } from "../../types/elementTreeTypes";
import type { History } from "../useElementTreeStore";

// --- Helper ---
export function saveToHistory(state: { history: History; elementMap: ElementMap }, max = 200) {
  state.history.past.push(JSON.parse(JSON.stringify(state.elementMap)));
  if (state.history.past.length > max) state.history.past.shift();
  state.history.future = [];
}

export function saveCurrentToFuture(state: { history: History; elementMap: ElementMap }) {
  state.history.future.push(JSON.parse(JSON.stringify(state.elementMap)));
}

export function updateAncestorDescendantFlags(elementMap: Record<string, DebugElement>) {
  Object.values(elementMap).forEach(el => {
    el.isAnyAncestorSelected = false;
    el.isAnyDescendantSelected = false;
  });

  const selectedElements = Object.values(elementMap).filter(el => el.selected);

  selectedElements.forEach(selectedEl => {
    const visitedParents = new Set<string>();
    let current = selectedEl;
    while (current.parentId) {
      const parent = elementMap[current.parentId];
      if (!parent) break;

      if (!visitedParents.has(parent.id)) {
        parent.isAnyDescendantSelected = true;
        visitedParents.add(parent.id);
      }

      current = parent;
    }

    const visitedChildren = new Set<string>();
    const propagateToChildren = (element: DebugElement) => {
      element.children.forEach(childId => {
        const child = elementMap[childId];
        if (!child) return;

        if (!visitedChildren.has(child.id)) {
          child.isAnyAncestorSelected = true;
          visitedChildren.add(child.id);
          propagateToChildren(child);
        }
      });
    };

    propagateToChildren(selectedEl);
  });
}