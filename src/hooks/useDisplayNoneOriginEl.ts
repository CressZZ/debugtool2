import { useEffect } from "react";
import type { KitDebgOptions } from "../main";
import { useElementTreeStore } from "../store/useElementTreeStore";

export function useDisplayNoneOriginEl(targetSelector: KitDebgOptions['targetSelector']) {
  const rootElementId = useElementTreeStore(state => state.rootElementId);

  useEffect(() => {
    if (rootElementId) {
      const el = document.querySelector(targetSelector) as HTMLElement;
      if (el) el.style.display = 'none';
    }
  }, [rootElementId, targetSelector]);
}