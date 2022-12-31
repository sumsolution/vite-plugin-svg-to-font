import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const projPath = (path: string) => resolve(__dirname, path)

export default defineConfig({
  build: {
    lib: {
      entry: projPath('lib/index.ts'),
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['lit'],
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
      },
    }
  },
  plugins: [dts({
    tsConfigFilePath: projPath('tsconfig.json')
  })]
})
