import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "./src/middleware/*", // ✅ 복사할 경로
          dest: "middleware", // ✅ 빌드 결과물에 들어갈 위치 (dist/static)
        },
      ],
    }),
  ],
  css: {
    postcss: "./postcss.config.js", // postcss에서 tailwind 설정
  },

  build: {
    sourcemap: true,
    cssCodeSplit: false, // ⭐️ 이거 추가!
    lib: {
      entry: "./src/main.tsx",
      name: "kitPositionDebugTool",
      fileName: "kitPositionDebugTool",
      formats: ["es", "umd"], // es: import 가능, umd: window 에도 사용 가능
    },
    rollupOptions: {
      output: {
        // entryFileNames: 'assets/kitPositionDebugTool.js',
        // chunkFileNames: 'assets/[name].js',
        // assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
