import { useEffect } from "react";
import { useElementTreeDispatch } from "./useElementTree";

export function useMouseEventWindow() {
  const dispatch = useElementTreeDispatch();

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
    console.log("handleMouseWheel", e);
  };
  
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();

    console.log("handleClick", e);
    dispatch({
      type: "UNSELECT_ALL_ELEMENT",
    });
    
  };

  useEffect(() => {
    document.addEventListener("wheel", handleMouseWheel, { capture: true, passive: false });
    // document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("wheel", handleMouseWheel, { capture: true });
      // document.removeEventListener("click", handleClick);
    };

  }, []);


 
}