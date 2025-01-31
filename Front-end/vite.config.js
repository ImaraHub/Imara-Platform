import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Enable listening on all network interfaces
    port: process.env.PORT || 3000, // Use environment port or default to 3000
  },
});
