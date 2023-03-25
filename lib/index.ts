import { ResolvedConfig, ViteDevServer } from 'vite'
import { cssBuilder } from './builders/cssBuilder'
import { SVGToFontPluginConfig, SVGToFontPluginOptions } from './config'
import { FontBuilder } from './builders/FontBuilder'
import { GeneratedFileType, initGeneratedFiles } from './fs/generatedFiles'
import { iconFs } from './fs/iconFs'

export default function vitePluginSVGToFont(opt: SVGToFontPluginOptions) {
  const pluginConfig: SVGToFontPluginConfig = {
    ...{
      outDir: 'icons',
      fontName: 'icon-font',
      base: '/',
      isBuild: true
    },
    ...opt,
  }

  // Setup
  const generatedFiles = initGeneratedFiles(pluginConfig.fontName)
  const fs = iconFs(pluginConfig, generatedFiles)
  const fontBuilder: FontBuilder = new FontBuilder(fs, pluginConfig)
  const distFs = fs.dist

  // Handle virtual module
  const virtualModuleId = 'virtual:svg-to-font.css'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vite-plugin-svg-to-font',
    configResolved(resolvedConfig: ResolvedConfig) {
      pluginConfig.isBuild = resolvedConfig.command === 'build'
      pluginConfig.base = resolvedConfig.base
    },

    configureServer(server: ViteDevServer) {
      for (const [name, mime] of Object.entries(fs.dist.fileNameMimeMap)) {
        server.middlewares.use(`${pluginConfig.base}${name}`, (req, res) => {
          const font = fs.dist.read(name)
          res.setHeader('content-type', mime)
          res.setHeader('content-length', font.length)
          res.statusCode = 200
          return res.end(font)
        })
      }
    },

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    async buildStart() {
      await fontBuilder.build()

      if (pluginConfig.isBuild) {
        distFs.eot.ref = this.emitFile(distFs.emit(GeneratedFileType.EOT))
        distFs.svg.ref = this.emitFile(distFs.emit(GeneratedFileType.SVG))
        distFs.ttf.ref = this.emitFile(distFs.emit(GeneratedFileType.TTF))
        distFs.woff.ref = this.emitFile(distFs.emit(GeneratedFileType.WOFF))
        distFs.woff2.ref = this.emitFile(distFs.emit(GeneratedFileType.WOFF2))

        await cssBuilder(fs, ref => `${pluginConfig.base}${this.getFileName(ref)}`)
        fs.dist.css.ref = this.emitFile(distFs.emit(GeneratedFileType.CSS))
        return
      }

      await cssBuilder(fs, ref => `${pluginConfig.base}${ref}`)
    },

    load: (id: string) => {
      // Handle virtual module
      if (id === resolvedVirtualModuleId) {
        return fs.dist.css.content.toString()
      }
      return null
    },
  }
}
