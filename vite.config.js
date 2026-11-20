import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// js-aruco2 gắn AR/CV lên `this` ở đầu file (kiểu CommonJS cũ) nên Rolldown không coi đó là export;
// đổi sang `exports` cho bản build, worker và bước gom thư viện của dev server.
const jsAruco2Exports = {
  name: 'js-aruco2-exports',
  transform(code, id) {
    return /js-aruco2[\\/]src[\\/]/.test(id) ? code.replace(/\bthis\.(AR|CV)\b/g, 'exports.$1') : null;
  },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), jsAruco2Exports],
    optimizeDeps: {
      rolldownOptions: {plugins: [jsAruco2Exports]},
    },
    // Worker quét bảng cũng nạp js-aruco2 nên cần cùng plugin
    worker: {
      format: 'es',
      plugins: () => [jsAruco2Exports],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
