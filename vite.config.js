import { defineConfig } from 'vite';
import { babel } from '@rollup/plugin-babel';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [babel({ extensions: ['.ts'], babelHelpers: 'bundled' })],
  build: {
    target: 'esnext', // --target=es2020
  },
  base: './',
});
