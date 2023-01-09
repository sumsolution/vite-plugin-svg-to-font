import type { PluginOption, ResolvedConfig } from 'vite'

import { cssBuilder } from './builders/cssBuilder'
import { SVGToFontPluginConfig, SVGToFontPluginOptions } from './config'
import { FontBuilder } from './builders/FontBuilder'
import { GeneratedFileType, initGeneratedFiles } from './fs/generatedFiles'
import { iconFs } from './fs/iconFs'

export default async function vitePluginSVGToFont(
  opt: SVGToFontPluginOptions,
): Promise<PluginOption> {
  let isBuild: boolean
  const pluginConfig: SVGToFontPluginConfig = {
    ...{
      outDir: 'icons',
    },
    ...opt,
  }

  const generatedFiles = initGeneratedFiles(pluginConfig.fontName)
  const fs = iconFs(pluginConfig, generatedFiles)
  const distFs = fs.dist
  const fontBuilder: FontBuilder = new FontBuilder(fs, pluginConfig)

  return {
    name: 'vite-plugin-svg-to-font',
    async configResolved(resolvedConfig: ResolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },
    async buildStart() {
      await fontBuilder.build()

      if (isBuild) {
        distFs.eot.ref = this.emitFile(distFs.emit(GeneratedFileType.EOT))
        distFs.svg.ref = this.emitFile(distFs.emit(GeneratedFileType.SVG))
        distFs.ttf.ref = this.emitFile(distFs.emit(GeneratedFileType.TTF))
        distFs.woff.ref = this.emitFile(distFs.emit(GeneratedFileType.WOFF))
        distFs.woff2.ref = this.emitFile(distFs.emit(GeneratedFileType.WOFF2))

        await cssBuilder(fs, ref => this.getFileName(ref))
        fs.dist.css.ref = this.emitFile(distFs.emit(GeneratedFileType.CSS))
        return
      }

      await cssBuilder(fs, ref => ref)
    },
    load: {
      order: 'pre',
      handler: (id: string) => {
        if (!isBuild && distFs.has(id)) {
          return fs.dist.read(id)
        }
        return null
      },
    },
  }
}
