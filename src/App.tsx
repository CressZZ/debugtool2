import {  useEffect, useRef } from "react";
import { parseDomToTree } from "./utils/parseDomToTree";
import type { KitDebgOptions } from "./main";
import { DebugComponentList } from "./component/DebugComponent/DebugComponentList";
import { useElementTree, useElementTreeDispatch } from "./hooks/useElementTree";

function App({targetSelector, background, extraTargetSelectors, excludeTargetSelector}: KitDebgOptions) {

  console.log({targetSelector, background, extraTargetSelectors, excludeTargetSelector});
  const { elementMap, rootElementId } = useElementTree();
  const ElementTreeDispatch = useElementTreeDispatch();

  const isMounted = useRef(false);
  
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    const ParsedElementTree = parseDomToTree(document.querySelector(targetSelector)!);
    ElementTreeDispatch({ type: "SET_ELEMENT_MAP", payload: { elementMap: ParsedElementTree.elementMap, rootElementId: ParsedElementTree.rootElementId } });
    console.log('ParsedElementTree', ParsedElementTree);
  });


  // 복제 다한후 숨기기 위해 사용
  useEffect(() => {
    if (rootElementId) {
      const el = document.querySelector(targetSelector) as HTMLElement;
      if (el) el.style.display = 'none';
    }
  }, [rootElementId]);

  useEffect(() => {
    console.log('elementMap', elementMap);
  }, [elementMap]);  


  return (
    <>
      <DebugComponentList />
    </>
  )
}

export default App
