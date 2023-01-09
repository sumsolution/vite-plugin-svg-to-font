import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import externals from 'rollup-plugin-node-externals'

export default defineConfig({
  input: 'lib/index.ts',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'es'
    },
    {
      file: 'dist/index.js',
      format: 'cjs'
    }
  ],
  plugins: [
    typescript(),
    externals(),
  ],
})
