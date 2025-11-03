import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const ROOT = 'packages/micro-viewer';

const TS = typescript({
  tsconfig: `${ROOT}/tsconfig.json`
});

export default [
  // ESM bundle
  {
    input: `${ROOT}/src/public.ts`,
    output: {
      dir: `${ROOT}/dist/esm`,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), TS],
    treeshake: { moduleSideEffects: false },
  },

  // UMD bundle (single chunk)
  {
    input: `${ROOT}/src/umd.ts`,
    output: {
      file: `${ROOT}/dist/umd/micro-viewer.umd.js`,
      format: 'umd',
      name: 'MicroViewer',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [resolve(), commonjs(), TS],
    treeshake: { moduleSideEffects: false },
  },

  // Type declarations
  {
    input: `${ROOT}/src/public.ts`,
    output: {
      file: `${ROOT}/dist/types/index.d.ts`,
      format: 'es',
    },
    plugins: [dts()],
  },
];
