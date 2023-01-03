import { resolve } from 'path'
import { dirSync } from 'tmp'
import { SVGToFontPluginConfig } from '../lib/config'

export const testOutDir = dirSync()

export const testPluginConfig: SVGToFontPluginConfig = {
  fontName: 'testFont',
  outDir: testOutDir.name,
  svgPath: resolve(__dirname, 'icons'),
}
