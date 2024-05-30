import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/': {
        target: 'https://dashscope.aliyuncs.com', // 目标服务器
        changeOrigin: true,
      }
    },
    cors: true
  }
})
