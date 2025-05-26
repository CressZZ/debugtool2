import { StrictMode } from 'react'
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

  createRoot(target!).render(
    <StrictMode>
      <ElementTreeProvider>
        <App targetSelector={targetSelector} background={background} extraTargetSelectors={extraTargetSelectors} excludeTargetSelector={excludeTargetSelector}/>
      </ElementTreeProvider>
    </StrictMode>,
  )
}

// @ts-expect-error window.kitDebg 추가
window.kitDebg = kitDebg;
