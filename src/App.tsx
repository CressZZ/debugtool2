import { useEffect, useRef } from "react";
import { parseDomToTree } from "./utils/parseDomToTree";
import { DebugComponent } from "./component/DebugComponent";
import { useElementTree, useElementTreeDispatch, useSelectedElement, useSelectedElementId } from "./hooks/useElementTree";
import { useKeyEventWindow } from "./hooks/useKeyEventWindow";
import { DebugBackground } from "./component/DebugBackground";
import { DebugControlPanel } from "./component/DebugControlPanel";
import { useDebugerWrapperStyle } from "./hooks/useDebugerWrapperStyle";
import throttle from "lodash.throttle";

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
  const { elementMap } = useElementTree();
  const ElementTreeDispatch = useElementTreeDispatch();
  const selectedElementId = useSelectedElementId();

  useEffect(() => {
    // console.log(selectedElementId);
  }, [selectedElementId]);

  const isMounted = useRef(false);

  const setElementMap = () => {
    const ParsedElementTree = parseDomToTree(
      document.querySelector(targetSelector)!,
      excludeTargetSelector
    );

    ElementTreeDispatch({
      type: "SET_ELEMENT_MAP",
      payload: {
        elementMap: ParsedElementTree.elementMap,
        rootElementId: ParsedElementTree.rootElementId,
      },
    });
  }

  useEffect(() => {
  }, [elementMap]);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    setElementMap();
  });

  useEffect(() => {
    const handleResize = throttle(() => {
      ElementTreeDispatch({ type: "RESET_ELEMENT_MAP" });
  
      setElementMap();
    }, 200); // 200ms throttle (원하면 숫자 조절 가능)
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel?.(); // lodash.throttle 은 cancel 지원
    };
  }, []);

  // 키바인딩
  useKeyEventWindow(targetSelector);

  useDebugerWrapperStyle();

  // 휠이벤트 막기(필요한가? kit 페이지 휠만 막아도 되지 않나)
  useEffect(() => {
    const target = document.querySelector("#kitDebgRoot") as HTMLElement;
    if (target) {
      const handleWheel = (e: WheelEvent) => {
        e.stopPropagation();
        // console.log("kitDebgRoot wheel", e);
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
