import { DebugComponentItem } from "./DebugComponentItem";
import { useElementTree } from "../../hooks/useElementTree";


export function DebugComponent() {
  const ElementTree = useElementTree();
  
  const { rootElementId, elementMap } = ElementTree;
  console.log('rootElementId', rootElementId);
  return (
    <>
    {rootElementId.length > 0 && rootElementId.map(id => {
      const rootElement = elementMap[id];
      console.log('rootElement', rootElement);
      return <DebugComponentItem key={id} element={rootElement} />
    })}
    </>
  );
}