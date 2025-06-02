import { createPortal } from "react-dom";

export function Starter({ onClick }: { onClick: () => void }) {
  return createPortal(
    <button
    style={{
      position: 'fixed',
      top: '80px',
      left: '80px',
      zIndex: 99999,
      padding: '20px',
      backgroundColor: '#991b1b', // red-800
      color: 'white',
      borderRadius: '0.375rem', // rounded
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 1px rgb(0 0 0 / 0.1)', // shadow
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    }}
      className=""
      onClick={onClick}
      
    >
      디버그 시작
    </button>,
    document.body
  );
}
