import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/token/index.ts',
    'src/signed/index.ts',
    'src/shared/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
});
