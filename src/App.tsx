import { useContext, useEffect } from "react";
import { ElementTreeContext } from "./context/ElementTreeContext";
import { parseDomToTree } from "./utils/parseDomToTree";
import type { KitDebgOptions } from "./main";


function App({targetSelector, background, extraTargetSelectors, excludeTargetSelector}: KitDebgOptions) {

  console.log(targetSelector, background, extraTargetSelectors, excludeTargetSelector);
  const { state, dispatch } = useContext(ElementTreeContext);

  useEffect(() => {
    const ElementTree = parseDomToTree(document.querySelector(targetSelector)!);
    dispatch({ type: "SET_ELEMENT_MAP", payload: { elementMap: ElementTree.elementMap, rootElementId: ElementTree.rootElementId } });
  }, []);

  useEffect(() => {
    console.log(state);
  }, [state]);


  return (
    <>
      <div>
        {/* {Object.values(state.elementMap).map((element) => (
          <div key={element.id}>{element.tagName}</div>
        ))} */}
      </div>
    </>
  )
}

export default App
