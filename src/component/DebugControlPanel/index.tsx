import { useContext, useEffect, useRef, useState } from "react";
import {
  ElementTreeStateContext,
  ElementTreeDispatchContext,
} from "../../context/ElementTreeContext";
import type { DebugElement } from "../../context/ElementTreeContext";
import { flushSync } from "react-dom";

export function DebugControlPanel({ onExit }: { onExit: () => void }) {
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
    flushSync(() => {
      // dispatch({
      //     type: "UNSELECT_ALL_ELEMENT",
      //   });

      dispatch({
        type: "SELECT_ONLY_ELEMENT",
        payload: { elementId: element.id },
      });
    });

    // selectElementRecursive(element);
  };
  
  const selectElementRecursive = (element: DebugElement) => {
    flushSync(() => {
      dispatch({ type: "SELECTED_ELEMENT", payload: { elementId: element.id } });
    });
  
    // element.children.forEach((childId) => {
    //   const child = state.elementMap[childId];
    //   if (child) {
    //     selectElementRecursive(child); // 재귀!
    //   }
    // });
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
            {/* Hidden 상태 표시 → 오른쪽 끝으로 정렬 */}
  <span
    style={{
      fontSize: "10px",
      marginLeft: "auto",
      color: element.hidden ? "#ff5050" : "#50c878", // 빨강 / 초록
      fontWeight: "bold",
    }}
  >
    {element.hidden ? "Hidden" : "Visible"}
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
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              transform: isCollapsed ? "rotate(-90deg)" : "none",
            }}
          >
            ▶
          </button>
          <button
            onClick={() => {
              if (onExit) onExit();
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#ff7070",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div
          style={{
            padding: "12px",
            fontSize: "13px",
          }}
          onWheel={(e) => {
            e.stopPropagation();
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
