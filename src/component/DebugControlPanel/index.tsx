import { useRef, useState } from "react";

import { useDebugBackgroundStore } from "../../store/useDebugBackgourndStore";
import { useElementTreeStore } from "../../store/useElementTreeStore";
import type { DebugElement } from "../../types/elementTreeTypes";


export function DebugControlPanel({ onExit }: { onExit: () => void }) {
  const elementMap = useElementTreeStore(state => state.elementMap);
  const rootElementId = useElementTreeStore(state => state.rootElementId);
  const selectElement = useElementTreeStore(state => state.selectElement);
  const selectOnlyElement = useElementTreeStore(state => state.selectOnlyElement);

  const panelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const bgoOpacity = useDebugBackgroundStore(state => state.opacity);
  const setBgOpacity = useDebugBackgroundStore(state => state.setOpacity);
  const setBgIsInverted = useDebugBackgroundStore(state => state.setIsInverted);
  const bgIsInverted = useDebugBackgroundStore(state => state.isInverted);

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

  const handleSelectElement = (e: React.MouseEvent, element: DebugElement) => {
    const isMetaPressed = e.metaKey;
    const isCtrlPressed = e.ctrlKey;
    // if(isMetaPressed || isCtrlPressed){
    //   dispatch({
    //     type: "UNSELECT_ALL_ELEMENT",
    //   });
    // }
    if(isMetaPressed || isCtrlPressed){
      selectElement(element.id);
    }else{
      if(!element.selected){
        selectOnlyElement(element.id);
      }else{
        //
      }
    }
    // flushSync(() => {
      // dispatch({
      //   type: "SELECT_ONLY_ELEMENT",
      //   payload: { elementId: element.id },
      // });

      
    // });
  };
  
  // const handleChangePositionType = (element: DebugElement, newType: 'margin' | 'transform') => {
  //   updateElementPositionType(element.id, newType);
  // };
  
  const renderElementTree = (element: DebugElement) => {
    return (
      <div
        key={element.id}
        style={{
          paddingLeft: '12px',
          marginBottom: '4px',
          borderLeft: '1px dashed #ccc',
        }}
      >
        <div
          style={{
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: element.selected ? '#008080' : 'transparent',
            color: element.selected ? '#fff' : '#333',
          }}
          onMouseDown={(e) => handleSelectElement(e, element)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = element.selected
              ? '#008080'
              : '#eee';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = element.selected
              ? '#008080'
              : 'transparent';
          }}
        >
          <span style={{ fontWeight: '600' }}>{element.className.join(' ')}</span>
          <span style={{ fontSize: '11px', color: '#888' }}>
          {element.tagName}
          </span>
  
          {/* Hidden 상태 표시 */}
          <span
            style={{
              fontSize: '10px',
              marginLeft: 'auto',
              color: element.hidden ? '#ff5050' : '#50c878',
              fontWeight: 'bold',
            }}
          >
            {element.hidden ? 'Hidden' : 'Visible'}
          </span>
  
          {/* PositionType 표시 + 선택 */}
          {/* <select
            value={element.positionType}
            onChange={(e) => handleChangePositionType(element, e.target.value as 'margin' | 'transform')}
            style={{
              marginLeft: '8px',
              fontSize: '11px',
              padding: '2px 4px',
              borderRadius: '4px',
            }}
            onClick={(e) => e.stopPropagation()} // 드래그 방지용
          >
            <option value="margin">margin</option>
            <option value="transform">transform</option>
          </select> */}
        </div>
  
        {/* children 재귀 렌더 */}
        {element.children.map((childId) => {
          const child = elementMap[childId];
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

      <div style={{ marginBottom: "8px", display: "flex", gap: "8px", flexDirection: "column", padding: "5px 20px" }}>
        <div> 
            <label style={{ display: "block", marginBottom: "4px" }}>
              Background Opacity: {bgoOpacity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={bgoOpacity}
              onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Background Inverted: {bgIsInverted ? "Yes" : "No"}
          </label>
          <input
            type="checkbox"
            checked={bgIsInverted}
            onChange={(e) => setBgIsInverted(e.target.checked)}
          />
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
          {rootElementId.map((rootId) => {
            const rootEl = elementMap[rootId];
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
