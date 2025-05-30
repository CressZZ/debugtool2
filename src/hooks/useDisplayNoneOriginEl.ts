import { useEffect } from "react";
import { useElementTree } from "./useElementTree";
import type { KitDebgOptions } from "../main";

export function useDisplayNoneOriginEl(targetSelector: KitDebgOptions['targetSelector']) {
  const {  rootElementId } = useElementTree();

  useEffect(() => {
    if (rootElementId) {
      const el = document.querySelector(targetSelector) as HTMLElement;
      if (el) el.style.display = 'none';
    }
  }, [rootElementId, targetSelector]);
}