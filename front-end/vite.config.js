import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['lucide-react', 'chunk-J7JDWDWR'],
    
  },
  server: {
    host: "0.0.0.0", // Allows external access
    port: Number(process.env.PORT) || 3000, // Use Render's expected port
    strictPort: true, // Prevents fallback to another port
    allowedHosts: ['imara-platform-1.onrender.com'], // Allow Render host
    sourcemap :false,
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 3000,
    strictPort: true,
    allowedHosts: ['imara-platform-1.onrender.com'], // Allow Render host
  },
});
