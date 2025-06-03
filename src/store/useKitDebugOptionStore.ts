// store/useKitDebugOptionsStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type KitDebugOptions = {
  targetSelector: string;
  background: string;
  extraTargetSelectors?: string[];
  excludeTargetSelector?: string[];
  positionStyleFilePath?: string;
};

type KitDebugOptionsStore = {
  options: KitDebugOptions;
  setOptions: (options: Partial<KitDebugOptions>) => void;
};


export const useKitDebugOptionsStore = create<KitDebugOptionsStore>()(
  devtools(
    (set) => ({
      options: {
        targetSelector: "",
        background: "",
        extraTargetSelectors: [],
        excludeTargetSelector: [],
        positionStyleFilePath: "",
      },
      setOptions: (options) =>
        set((state) => ({
          options: {
            ...state.options,
            ...options,
          },
        })),
    }),
    { name: "KitDebugOptionsStore" }  // ⭐️ devtools 패널에서 이름으로 보임
  )
);