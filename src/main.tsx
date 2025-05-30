import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ElementTreeProvider } from './context/ElementTreeContext.tsx'

export type KitDebgOptions = {
  targetSelector: string;
  background: string;
  extraTargetSelectors?: string[];
  excludeTargetSelector?: string[];
}

export function kitDebg({targetSelector, background, extraTargetSelectors, excludeTargetSelector}: KitDebgOptions) {
  const target = document.querySelector('#kitDebgRoot');

  const onExit = () => {
    root.unmount();
    console.log('KitDebug 종료됨 🚀');
  }
  
  // @ts-expect-error 전역에 저장해두면 나중에 수동으로도 unmount 가능
  kitDebg.onExit = onExit;


  const root = createRoot(target!);
  root.render(
    <StrictMode>
      <ElementTreeProvider>
        <App 
          targetSelector={targetSelector} 
          background={background} 
          extraTargetSelectors={extraTargetSelectors} 
          excludeTargetSelector={excludeTargetSelector}
          onExit={onExit}
        />
      </ElementTreeProvider>
    </StrictMode>,
  );

  // @ts-expect-error 전역에 저장해두면 나중에 수동으로도 unmount 가능
  window.kitDebgRootInstance = root;
}

// @ts-expect-error window.kitDebg 추가
window.kitDebg = kitDebg;
