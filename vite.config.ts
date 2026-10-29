import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 4173);

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(root, 'src') },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: path.resolve(root, 'dist'),
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
    fs: { strict: true },
  },
  preview: {
    host: '127.0.0.1',
    port: Number(process.env.PREVIEW_PORT ?? 4174),
    strictPort: true,
  },
});
