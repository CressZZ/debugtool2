import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  css: {
    postcss: './postcss.config.js', // postcss에서 tailwind 설정
  },
  build: {
    cssCodeSplit: false, // ⭐️ 이거 추가!
    rollupOptions: {
      output: {
        entryFileNames: 'assets/kitDebugTool.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  }
})
