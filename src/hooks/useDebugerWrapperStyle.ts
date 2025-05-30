import { useEffect } from "react";

export function useDebugerWrapperStyle() {

  useEffect(() => {
    const target = document.querySelector('#kitDebgRoot') as HTMLElement;

    target.style.width = '100%';
    target.style.height = '100%';
    target.style.top = '0';
    target.style.left = '0';
    target.style.zIndex = '100';
    target.style.position = 'absolute';
    target.style.backgroundColor = 'white';

    return () => {
      target.style.width = '';
      target.style.height = '';
      target.style.top = '';
      target.style.left = '';
      target.style.zIndex = '';
    }
  }, []);
}
