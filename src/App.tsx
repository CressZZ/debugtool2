import { useState } from "react";
import Debug from "./component/Debug";
import { Starter } from "./component/Starter";
import { useElementTreeStore } from "./store/useElementTreeStore";

export function App() {
  const [isRunning, setIsRunning] = useState(false);
  const resetElementTree = useElementTreeStore((state) => state.reset);
  
  const onExit = () => {
    resetElementTree();
    setIsRunning(false);
  }

return (
  <>
  {isRunning ? (
    <Debug
      onExit={onExit}
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
