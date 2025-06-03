import { useEffect, useRef } from "react";
import { parseDomToTree } from "../../utils/parseDomToTree";
import { DebugComponent } from "../DebugComponent";


import throttle from "lodash.throttle";
import { useDebugerWrapperStyle } from "../../hooks/useDebugerWrapperStyle";
import { useKeyEventWindow } from "../../hooks/useKeyEventWindow";
import { useElementTreeStore } from "../../store/useElementTreeStore";
import { DebugBackground } from "../DebugBackground";
import { DebugControlPanel } from "../DebugControlPanel";

type AppProps = {
  targetSelector: string;
  background: string;
  extraTargetSelectors?: string[];
  excludeTargetSelector?: string[];
  onExit: () => void;
  positionStyleFilePath?: string;
};

function Debug({
  targetSelector,
  background,
  excludeTargetSelector = [],
  onExit,
  positionStyleFilePath,
}: AppProps) {
  const elementMap  = useElementTreeStore(state => state.elementMap);
  const setElementMap = useElementTreeStore(state => state.setElementMap);
  const resetElementMap = useElementTreeStore(state => state.resetElementMap);
  const history = useElementTreeStore(state => state.history);

  const isMounted = useRef(false);

  const setElementMapInit = () => {
    const ParsedElementTree = parseDomToTree(
      document.querySelector(targetSelector)!,
      excludeTargetSelector
    );

    setElementMap(
      ParsedElementTree.elementMap,
      ParsedElementTree.rootElementId,
    );
  }

  useEffect(() => {

  }, [elementMap]);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    setElementMapInit();
  }, []);

  useEffect(() => {
    const handleResize = throttle(() => {
      resetElementMap();

      setElementMapInit();
    }, 200); // 200ms throttle (원하면 숫자 조절 가능)
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel?.(); // lodash.throttle 은 cancel 지원
    };
  }, []);

  // 키바인딩
  useKeyEventWindow({targetSelector, positionStyleFilePath});

  useDebugerWrapperStyle();

  // 휠이벤트 막기(필요한가? kit 페이지 휠만 막아도 되지 않나)
  useEffect(() => {
    const target = document.querySelector("#kitDebgRoot") as HTMLElement;
    if (target) {
      const handleWheel = (e: WheelEvent) => {
        e.stopPropagation();

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

export default Debug;
