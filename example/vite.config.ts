import { resolve } from 'path'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import vitePluginSVGToFont from '@sumsolution/vite-plugin-svg-to-font'

export default defineConfig({
  base: '/foo',
  plugins: [
    Inspect(),
    vitePluginSVGToFont({
      svgPath: resolve(__dirname, 'icons')
    })
  ]
})