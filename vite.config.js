import { defineConfig } from 'vite';
// import { babel } from '@rollup/plugin-babel';
// import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // visualizer()
  ],
  build: {
    target: 'esnext', // --target=es2020
  },
  base: './',
});
