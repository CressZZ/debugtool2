import { DebugComponentItem } from "./DebugComponentItem";
import { useElementTree } from "../../hooks/useElementTree";


export function DebugComponent() {
  const ElementTree = useElementTree();
  
  const { rootElementId, elementMap } = ElementTree;

  return (
    <>
    {rootElementId.length > 0 && rootElementId.map(id => {
      const rootElement = elementMap[id];

      return <DebugComponentItem key={id} rootElementId={rootElementId} element={rootElement} />
    })}
    </>
  );
}