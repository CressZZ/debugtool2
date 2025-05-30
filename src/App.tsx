import { useEffect, useRef } from "react";
import { parseDomToTree } from "./utils/parseDomToTree";
import type { KitDebgOptions } from "./main";
import { DebugComponent } from "./component/DebugComponent";
import { useElementTree, useElementTreeDispatch } from "./hooks/useElementTree";
import { useKeyEventWindow } from "./hooks/useKeyEventWindow";
import { useDisplayNoneOriginEl } from "./hooks/useDisplayNoneOriginEl";
import { DebugBackground } from "./component/DebugBackground";
import { DebugControlPanel } from "./component/DebugControlPanel";
import { useKitRootStyle } from "./hooks/useKitRootStyle";

type AppProps = {
  targetSelector: string;
  background: string;
  extraTargetSelectors?: string[];
  excludeTargetSelector?: string[];
  onExit: () => void;
};

function App({
  targetSelector,
  background,
  extraTargetSelectors,
  excludeTargetSelector = [],
  onExit,
}: AppProps) {
  // console.log({targetSelector, background, extraTargetSelectors, excludeTargetSelector});
  const { elementMap } = useElementTree();
  const ElementTreeDispatch = useElementTreeDispatch();

  const isMounted = useRef(false);

  useEffect(() => {
  }, [elementMap]);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    // 트리 파싱
    const ParsedElementTree = parseDomToTree(
      document.querySelector(targetSelector)!,
      excludeTargetSelector
    );

    // 트리 설정
    ElementTreeDispatch({
      type: "SET_ELEMENT_MAP",
      payload: {
        elementMap: ParsedElementTree.elementMap,
        rootElementId: ParsedElementTree.rootElementId,
      },
    });
  });

  // 복제 다한후 숨기기 위해 사용
  // useDisplayNoneOriginEl(targetSelector);

  // 키바인딩
  useKeyEventWindow();

  useKitRootStyle();

  // 휠이벤트 막기(필요한가? kit 페이지 휠만 막아도 되지 않나)
  useEffect(() => {
    const target = document.querySelector("#kitDebgRoot") as HTMLElement;
    if (target) {
      const handleWheel = (e: WheelEvent) => {
        e.stopPropagation();
        console.log("kitDebgRoot wheel", e);
      };

      target.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        target.removeEventListener("wheel", handleWheel);
      };
    }
  }, []);

  return (
    <>
      <DebugBackground backgroundImage={background} />
      <DebugComponent />
      <DebugControlPanel onExit={onExit} />
    </>
  );
}

export default App;
