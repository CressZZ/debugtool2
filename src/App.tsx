import { useState } from "react";
import Debug from "./component/Debug";
import { Starter } from "./component/Starter";
import type { KitDebgOptions } from "./main";
import { useElementTreeStore } from "./store/useElementTreeStore";

export function App({
  targetSelector,
  background,
  extraTargetSelectors,
  excludeTargetSelector,
  positionStyleFilePath,
}:KitDebgOptions) {
  const [isRunning, setIsRunning] = useState(true);
  const resetElementTree = useElementTreeStore((state) => state.reset);
  
  const onExit = () => {
    resetElementTree();
    setIsRunning(false);
  }

return (
  <>
  {isRunning ? (
    <Debug
      targetSelector={targetSelector}
      background={background}
      extraTargetSelectors={extraTargetSelectors}
      excludeTargetSelector={excludeTargetSelector}
      onExit={onExit}
      positionStyleFilePath={positionStyleFilePath}
    />
  ) : (
    <Starter onClick={() => {
      console.log("Starter 클릭");
      setIsRunning(true);
    }}/>
  )}
  </> 
  )
}
