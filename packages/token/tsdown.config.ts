import { defineConfig } from 'tsdown';

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
  outExtensions: ({ format }) =>
    format === 'cjs'
      ? { js: '.cjs', dts: '.d.cts' }
      : { js: '.js', dts: '.d.ts' },
});
