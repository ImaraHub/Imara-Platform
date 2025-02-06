import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
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
    host: true, // Enable listening on all network interfaces
    port: process.env.PORT || 3000, // Use environment port or default to 3000
  },
});


