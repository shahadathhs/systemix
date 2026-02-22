import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/token/index.ts',
    'src/signed/index.ts',
    'src/rsa/index.ts',
    'src/common/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
});
