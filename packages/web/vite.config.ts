import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import solid from 'vite-plugin-solid';
import suidPlugin from '@suid/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    suidPlugin(),
    solid({ babel: { parserOpts: { plugins: ['decorators'] } } }),
    tsConfigPaths(),
  ],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: ['@nestjs/swagger'],
    },
  },
  resolve: {
    alias: {
      // TODO: Add shim to build and replace swagger import with it
      '@nestjs/swagger': path.resolve(__dirname, './shims/nestjs-swagger.shim.js'),
    },
  },
});
