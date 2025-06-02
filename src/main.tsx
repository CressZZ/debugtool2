import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { useElementTreeStore } from "./store/useElementTreeStore";

export type KitDebgOptions = {
  targetSelector: string;
  background: string;
  extraTargetSelectors?: string[];
  excludeTargetSelector?: string[];
  positionStyleFilePath?: string;
};


export function kitDebug({
  targetSelector,
  background,
  extraTargetSelectors,
  excludeTargetSelector,
  positionStyleFilePath,
}: KitDebgOptions) {

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

  console.log("mount kitDebug");
  const unMount = () => {
    console.log("unMount kitDebug");
    resetElementTree();
    appRoot.unmount();
  }

  // Starter 렌더 (버튼만 body 포탈)
  appRoot.render(
    <StrictMode>
      <App
        targetSelector={targetSelector}
        background={background}
        extraTargetSelectors={extraTargetSelectors}
        excludeTargetSelector={excludeTargetSelector}
        positionStyleFilePath={positionStyleFilePath}
      />
    </StrictMode>
  );

  return {
    unMount,
  }
}

export default kitDebug;


