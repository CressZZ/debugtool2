import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { useElementTreeStore } from "./store/useElementTreeStore";
import { useKitDebugOptionsStore, type KitDebugOptions } from "./store/useKitDebugOptionStore";

declare global {
  interface Window {
    KitPositionDebugTool: typeof kitDebug  ;
  }
}


export function kitDebug({
  targetSelector = [""],
  background = "",
  extraTargetSelectors = [],
  excludeTargetSelector = [],
  positionStyleFilePath = "",
  isMobile = false,
}: Partial<KitDebugOptions> = {}) {

  // kitDebgRoot 없으면 자동 생성
  let appTarget = document.querySelector("#kitDebgRoot") as HTMLElement | null;
  if (!appTarget) {
    appTarget = document.createElement("div");
    appTarget.id = "kitDebgRoot";
    document.body.appendChild(appTarget);
    console.log("kitDebgRoot 자동 생성됨");
  }

  const appRoot = createRoot(appTarget);
  const resetElementTree = useElementTreeStore.getState().reset;


  // ✅ 옵션을 store 에 주입
  const setOptions = useKitDebugOptionsStore.getState().setOptions;
  setOptions({
    targetSelector,
    background,
    extraTargetSelectors,
    excludeTargetSelector,
    positionStyleFilePath,  
    isMobile,
  });
  

  console.log("mount kitDebug");
  
  const unMount = () => {
    console.log("unMount kitDebug");
    resetElementTree();
    appRoot.unmount();
  }

  // ✅ 반환 객체에서 updateOptions 제공
  const updateOptions = (newOptions: Partial<KitDebugOptions>) => {
    console.log("updateOptions", newOptions);
    useKitDebugOptionsStore.getState().setOptions(newOptions);
  };

  // Starter 렌더 (버튼만 body 포탈)
  appRoot.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  return {
    unMount,updateOptions
  }
}

// window.KitPositionDebugTool = kitDebug;

export default kitDebug;

