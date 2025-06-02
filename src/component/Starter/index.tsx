import { useState } from 'react';
import { createPortal } from 'react-dom';
import App from '../../App';

export type StarterProps = {
  targetSelector: string;
  background: string;
  extraTargetSelectors?: string[];
  excludeTargetSelector?: string[];
  onExit: () => void;
  appRoot: ReturnType<typeof import('react-dom/client')['createRoot']>;
};

export default function Starter({
  targetSelector,
  background,
  extraTargetSelectors,
  excludeTargetSelector,
  onExit,
  appRoot,
}: StarterProps) {
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    console.log('디버그 시작!');
    setStarted(true);

    // App 마운트
    appRoot.render(
      <App
        targetSelector={targetSelector}
        background={background}
        extraTargetSelectors={extraTargetSelectors}
        excludeTargetSelector={excludeTargetSelector}
        onExit={onExit}
      />
    );
  };

  if (started) {
    // 버튼 제거됨
    return null;
  }

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
      onClick={handleStart}
      
    >
      디버그 시작
    </button>,
    document.body
  );
}
