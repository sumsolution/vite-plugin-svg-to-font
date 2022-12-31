import type { PluginOption, ResolvedConfig } from 'vite'

import { buildCSS } from './buildCSS'
import { SVGToFontPluginConfig, SVGToFontPluginOptions } from './config'
import { FontBuilder } from './fontBuilder'
import { GeneratedFileType, IconFs, iconFs } from './iconFs'

export async function vitePluginSVGToFont(
  opt: SVGToFontPluginOptions,
): Promise<PluginOption> {
  let isBuild: boolean
  const pluginConfig: SVGToFontPluginConfig = {
    ...{
      outDir: 'icons',
    },
    ...opt,
  }

  const fs: IconFs = await iconFs(pluginConfig)
  const distFs = fs.dist
  const fontBuilder: FontBuilder = FontBuilder(fs, pluginConfig)

  return {
    name: 'vite-plugin-svg-to-font',
    async configResolved(resolvedConfig: ResolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },
    async buildStart() {
      await fontBuilder.build()

      if (isBuild) {
        distFs.eot.ref = this.emitFile(distFs.emitAsset(GeneratedFileType.EOT))
        distFs.svg.ref = this.emitFile(distFs.emitAsset(GeneratedFileType.SVG))
        distFs.ttf.ref = this.emitFile(distFs.emitAsset(GeneratedFileType.TTF))
        distFs.woff.ref = this.emitFile(
          distFs.emitAsset(GeneratedFileType.WOFF),
        )
        distFs.woff2.ref = this.emitFile(
          distFs.emitAsset(GeneratedFileType.WOFF2),
        )

        await buildCSS(fs, ref => this.getFileName(ref))
        fs.dist.css.ref = this.emitFile(distFs.emitAsset(GeneratedFileType.CSS))
        return
      }

      await buildCSS(fs, ref => ref)
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
