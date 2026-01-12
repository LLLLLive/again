import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 确保 API_KEY 在构建时被注入。如果环境变量中没有，则设为空字符串以防崩溃。
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 确保所有静态资源都能正确引用
    assetsDir: 'assets',
  },
  server: {
    port: 3000
  }
});
