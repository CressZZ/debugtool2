import { useContext, useEffect, useRef, useState } from "react";
import {
  ElementTreeStateContext,
  ElementTreeDispatchContext,
} from "../../context/ElementTreeContext";
import type { DebugElement } from "../../context/ElementTreeContext";

export function DebugControlPanel() {
  const state = useContext(ElementTreeStateContext);
  const dispatch = useContext(ElementTreeDispatchContext);

  const panelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleSelectElement = (element: DebugElement) => {
    dispatch({
      type: "UNSELECT_ALL_ELEMENT",
      payload: { elementId: element.id },
    });
    dispatch({ type: "SELECTED_ELEMENT", payload: { elementId: element.id } });

    element.children.forEach((childId) => {
      dispatch({ type: "SELECTED_ELEMENT", payload: { elementId: childId } });
    });
  };

  const renderElementTree = (element: DebugElement) => {
    return (
      <div
        key={element.id}
        className="pl-3 mb-1 border-l border-dashed border-gray-300"
      >
        <div
          className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center gap-2 transition
            ${
              element.selected
                ? "bg-teal-600 text-white"
                : "hover:bg-gray-100 text-gray-800"
            }`}
          onClick={() => handleSelectElement(element)}
        >
          <span className="font-semibold">{element.tagName}</span>
          {/* <span className="text-xs text-gray-400">#{element.id}</span> */}
          <span className="text-xs text-gray-400">
            #{element.className.join(" ")}
          </span>
        </div>
        {element.children.map((childId) => {
          const child = state.elementMap[childId];
          if (child) {
            return renderElementTree(child);
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-[9999] w-[280px] max-h-[80vh] overflow-y-auto rounded-lg border border-gray-400 bg-gray-50 shadow-lg select-none"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div
        className="bg-gray-800 text-white px-3 py-2 flex justify-between items-center rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <span className="text-[14px] font-bold tracking-wide">Layer Panel</span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white text-lg transform transition-transform"
          style={{
            transform: isCollapsed ? "rotate(-90deg)" : "none",
          }}
        >
          ▶
        </button>
      </div>

      {!isCollapsed && (
        <div
          className="p-3 text-sm"
          onWheel={(e) => {
            e.stopPropagation(); // 🚀 wheel 이벤트 버블링 차단
            // e.preventDefault(); // 🚀 필요하면 스크롤 자체도 막기
            // console.log("panel wheel", e.deltaY);
          }}
        >
          {state.rootElementId.map((rootId) => {
            const rootEl = state.elementMap[rootId];
            if (rootEl) {
              return renderElementTree(rootEl);
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
