import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useElementTreeStore } from './store/useElementTreeStore.ts'

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
      // 🚀 store 리셋
    useElementTreeStore.getState().reset();
    console.log('KitDebug 종료됨 🚀');
  }
  
  // @ts-expect-error 전역에 저장해두면 나중에 수동으로도 unmount 가능
  kitDebg.onExit = onExit;


  const root = createRoot(target!);
  root.render(
    <StrictMode>
        <App 
          targetSelector={targetSelector} 
          background={background} 
          extraTargetSelectors={extraTargetSelectors} 
          excludeTargetSelector={excludeTargetSelector}
          onExit={onExit}
        />
    </StrictMode>,
  );

  // @ts-expect-error 전역에 저장해두면 나중에 수동으로도 unmount 가능
  window.kitDebgRootInstance = root;
}

// @ts-expect-error window.kitDebg 추가
window.kitDebg = kitDebg;
