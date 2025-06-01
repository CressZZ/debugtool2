import { DebugComponentItem } from "./DebugComponentItem";
import { useElementTreeStore } from "../../store/useElementTreeStore";


export function DebugComponent() {
  const rootElementId = useElementTreeStore(state => state.rootElementId);
  const elementMap = useElementTreeStore(state => state.elementMap);

  return (
    <>
    {rootElementId.length > 0 && rootElementId.map(id => {
      const rootElement = elementMap[id];

      return <DebugComponentItem key={id} element={rootElement} />
    })}
    </>
  );
}