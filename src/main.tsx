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
};


export function kitDebug({
  targetSelector,
  background,
  extraTargetSelectors,
  excludeTargetSelector,
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

  const unMount = () => {
    resetElementTree();
    appRoot.unmount();
  }

  // @ts-expect-error window.kitDebug 추가
  window.kitDebug.unMount = unMount;

  // Starter 렌더 (버튼만 body 포탈)
  appRoot.render(
    <StrictMode>
      <App
        targetSelector={targetSelector}
        background={background}
        extraTargetSelectors={extraTargetSelectors}
        excludeTargetSelector={excludeTargetSelector}
      />
    </StrictMode>
  );

  return {
    unMount,
  }
}

// @ts-expect-error window.kitDebug 추가
window.kitDebug = kitDebug;
