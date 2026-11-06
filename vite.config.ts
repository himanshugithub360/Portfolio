import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import adminPlugin from './admin/vite-plugin-admin';

export default defineConfig(({ mode }) => {
  // ADMIN_PASSWORD comes from .env.local (git-ignored). See README → Admin dashboard.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), adminPlugin({ password: env.ADMIN_PASSWORD })],
    // Listen on all network interfaces so the site opens from other devices via this PC's IP.
    server: {
      host: true,
      port: 5173,
      watch: { ignored: ['**/.admin-backups/**', '**/src/data/content.json.tmp'] },
    },
    preview: { host: true, port: 4173 },
    build: {
      target: 'es2020',
      // Only the public site is built; the admin (admin.html) exists in `npm run dev` only.
      rollupOptions: {
        input: 'index.html',
        output: {
          manualChunks: { motion: ['framer-motion'], react: ['react', 'react-dom'] },
        },
      },
    },
  };
});
