import { resolve } from 'path'
import { defineConfig } from 'vite'
import vitePluginSVGToFont from '@sumsolution/vite-plugin-svg-to-font'

export default defineConfig({
  plugins: [
    vitePluginSVGToFont({
      svgPath: resolve(__dirname, 'icons')
    })
  ]
})