import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

const projPath = (path: string) => resolve(__dirname, path)

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
  },
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
    },
  },
  plugins: [
    dts({
      tsConfigFilePath: projPath('tsconfig.json'),
    }),
  ],
})
