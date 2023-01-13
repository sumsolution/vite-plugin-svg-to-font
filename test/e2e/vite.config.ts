import { resolve } from 'path'
import { defineConfig } from 'vite'
import vitePluginSVGToFont from '../../lib'

export default defineConfig({
  plugins: [
    vitePluginSVGToFont({
      fontName: 'icon-font',
      svgPath: resolve(__dirname, '..', 'icons')
    })
  ]
})