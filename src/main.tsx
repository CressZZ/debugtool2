import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Starter from './component/Starter';
import { useElementTreeStore } from './store/useElementTreeStore';

export type KitDebgOptions = {
  targetSelector: string;
  background: string;
  extraTargetSelectors?: string[];
  excludeTargetSelector?: string[];
};

// 실행 여부 전역 플래그
let isRunning = false;

export function kitDebug({
  targetSelector,
  background,
  extraTargetSelectors,
  excludeTargetSelector,
}: KitDebgOptions) {
  if (isRunning) {
    console.log('KitDebug 이미 실행 중');
    return;
  }

  // kitDebgRoot 없으면 자동 생성
  let appTarget = document.querySelector('#kitDebgRoot') as HTMLElement | null;
  if (!appTarget) {
    appTarget = document.createElement('div');
    appTarget.id = 'kitDebgRoot';
    document.body.appendChild(appTarget);
    console.log('kitDebgRoot 자동 생성됨');
  }

  const appRoot = createRoot(appTarget);

  const onExit = () => {
    appRoot.unmount();
    useElementTreeStore.getState().reset();
    isRunning = false; // 플래그 리셋
    console.log('KitDebug 종료됨 🚀');
  };

  // @ts-expect-error 전역 저장
  kitDebug.onExit = onExit;

  isRunning = true; // 실행 시작 시 플래그 설정

  // Starter 렌더 (버튼만 body 포탈)
  appRoot.render(
    <StrictMode>
      <Starter
        targetSelector={targetSelector}
        background={background}
        extraTargetSelectors={extraTargetSelectors}
        excludeTargetSelector={excludeTargetSelector}
        onExit={onExit}
        appRoot={appRoot}
      />
    </StrictMode>
  );

  // @ts-expect-error 전역 저장
  window.kitDebgRootInstance = appRoot;
}

// @ts-expect-error window.kitDebug 추가
window.kitDebug = kitDebug;
