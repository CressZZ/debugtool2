// import { useEffect } from "react";

// export function useMouseEventWindow() {


//   const handleMouseWheel = (e: WheelEvent) => {
//     e.stopPropagation();
//     console.log("handleMouseWheel", e);
//   };
  

//   useEffect(() => {
//     document.addEventListener("wheel", handleMouseWheel, { capture: true, passive: false });
//     return () => {
//       document.removeEventListener("wheel", handleMouseWheel, { capture: true });
//     };
//   }, []);


 
// }