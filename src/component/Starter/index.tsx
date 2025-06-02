import { createPortal } from "react-dom";

export function Starter({ onClick }: { onClick: () => void }) {
  return createPortal(
    <button
    style={{
      position: "fixed",
      top: "70px",
      left: "70px",
      zIndex: "100001",
      padding: "12px 16px",
      backgroundColor: "#e74c3c",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
    }}
      className=""
      onClick={onClick}
      
    >
      🧪 디버그 시작
    </button>,
    document.body
  );
}
