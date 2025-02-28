import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['lucide-react', 'chunk-J7JDWDWR'],
    'process.env': process.env,
  },
  server: {
    host: "0.0.0.0", // Allow external connections
    port: Number(process.env.PORT) || 10000, // Ensure Vite listens on the expected port
    strictPort: true, // Prevents Vite from switching ports
  },
  preview: {
    host: "0.0.0.0", // Allow external connections
    port: Number(process.env.PORT) || 10000, // Ensure `vite preview` runs on the expected port
    strictPort: true,
  },
});
