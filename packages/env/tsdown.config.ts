import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outExtensions: ({ format }) =>
    format === 'cjs'
      ? { js: '.cjs', dts: '.d.cts' }
      : { js: '.js', dts: '.d.ts' },
});
