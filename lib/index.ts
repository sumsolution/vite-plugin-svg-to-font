import { cssBuilder } from './builders/cssBuilder'
import { SVGToFontPluginConfig, SVGToFontPluginOptions } from './config'
import { FontBuilder } from './builders/FontBuilder'
import { GeneratedFileType, initGeneratedFiles } from './fs/generatedFiles'
import { iconFs } from './fs/iconFs'

export default function vitePluginSVGToFont(opt: SVGToFontPluginOptions) {
  let isBuild: boolean
  const pluginConfig: SVGToFontPluginConfig = {
    ...{
      outDir: 'icons',
      fontName: 'icon-font',
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
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },

    configureServer(server) {
      for (const [name, mime] of Object.entries(fs.dist.fileNameMimeMap)) {
        server.middlewares.use(`/${name}`, (req, res) => {
          const font = fs.dist.read(name)
          res.setHeader('content-type', mime)
          res.setHeader('content-length', font.length)
          res.statusCode = 200
          return res.end(font)
        })
      }
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
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

    load: (id: string) => {
      // During dev, we return the font file contents
      if (distFs.has(id)) {
        return fs.dist.read(id).toString()
      }
      // Handle virtual module
      if (id === resolvedVirtualModuleId) {
        return fs.dist.css.content.toString()
      }
      return null
    },
  }
}
