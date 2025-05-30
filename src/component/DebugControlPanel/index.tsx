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
        style={{
          paddingLeft: "12px",
          marginBottom: "4px",
          borderLeft: "1px dashed #ccc",
        }}
      >
        <div
          style={{
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: element.selected ? "#008080" : "transparent",
            color: element.selected ? "#fff" : "#333",
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => handleSelectElement(element)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = element.selected
              ? "#008080"
              : "#eee";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = element.selected
              ? "#008080"
              : "transparent";
          }}
        >
          <span style={{ fontWeight: "600" }}>{element.tagName}</span>
          <span style={{ fontSize: "11px", color: "#888" }}>
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
      style={{
        position: "fixed",
        zIndex: 9999,
        width: "280px",
        maxHeight: "80vh",
        overflowY: "auto",
        borderRadius: "8px",
        border: "1px solid #bbb",
        background: "#fafafa",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        userSelect: "none",
        top: position.y,
        left: position.x,
      }}
    >
      <div
        style={{
          background: "#444",
          color: "#fff",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          cursor: "move",
        }}
        onMouseDown={handleMouseDown}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          Layer Panel
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
            transform: isCollapsed ? "rotate(-90deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ▶
        </button>
      </div>

      {!isCollapsed && (
        <div
          style={{
            padding: "12px",
            fontSize: "13px",
          }}
          onWheel={(e) => {
            e.stopPropagation();
            // e.preventDefault();
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
