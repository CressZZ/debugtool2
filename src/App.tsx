import {  useEffect, useRef } from "react";
import { parseDomToTree } from "./utils/parseDomToTree";
import type { KitDebgOptions } from "./main";
import { DebugComponent } from "./component/DebugComponent";
import { useElementTree, useElementTreeDispatch } from "./hooks/useElementTree";
import { useKeyEvent } from "./hooks/useKeyEvent";
import { useDisplayNoneOriginEl } from "./hooks/useDisplayNoneOriginEl";
import { DebugBackground } from "./component/DebugBackground";

function App({targetSelector, background, extraTargetSelectors, excludeTargetSelector}: KitDebgOptions) {

  console.log({targetSelector, background, extraTargetSelectors, excludeTargetSelector});
  const { elementMap } = useElementTree();
  const ElementTreeDispatch = useElementTreeDispatch();

  const isMounted = useRef(false);
  
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    // 트리 파싱
    const ParsedElementTree = parseDomToTree(document.querySelector(targetSelector)!);

    // 트리 설정
    ElementTreeDispatch({ type: "SET_ELEMENT_MAP", payload: { elementMap: ParsedElementTree.elementMap, rootElementId: ParsedElementTree.rootElementId } });

  });


  // 복제 다한후 숨기기 위해 사용
  useDisplayNoneOriginEl(targetSelector);

  // 키바인딩
  useKeyEvent();

  useEffect(() => {
    console.log('elementMap', elementMap);
  }, [elementMap]);  


  return (
    <>
      <DebugBackground backgroundImage={background} />
      <DebugComponent />
    </>
  )
}

export default App
