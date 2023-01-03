import { execSync } from 'child_process'
import { createWriteStream } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import svg2ttf from 'svg2ttf'
import SVGIcons2SVGFontStream from 'svgicons2svgfont'
import { FileResult, fileSync } from 'tmp'
import ttf2eot from 'ttf2eot'
import ttf2woff from 'ttf2woff'
import { SVGToFontPluginConfig } from '../config'
import { GeneratedFileType } from '../fs/generatedFiles'

import { IconFs } from '../fs/iconFs'

export class FontBuilder {
  private readonly STARTING_CODEPOINT = 0xea01
  private fontStream: SVGIcons2SVGFontStream

  constructor(private fs: IconFs, config: SVGToFontPluginConfig) {
    this.fontStream = new SVGIcons2SVGFontStream({
      centerHorizontally: true,
      centerVertically: true,
      fontHeight: 1000,
      fontName: config.fontName,
      normalize: true,
    })
  }

  async build(): Promise<void> {
    return new Promise((resolve, reject) => {
      const svgTmp = fileSync()

      this.fontStream
        .pipe(createWriteStream(svgTmp.name, { fd: svgTmp.fd }))
        .on('finish', async () => {
          try {
            await this.generateFonts(svgTmp)
            resolve()
          } catch (e) {
            console.error('Failed to generate additional font files!')
            reject(e)
          }
        })
        .on('error', err => {
          console.error('Font creation failed!', err)
          reject()
        })

      const write = async () => {
        // Start by generating our .svg font file from our svg icons
        let codepoint = this.STARTING_CODEPOINT
        for await (const { stream, file } of this.fs.src) {
          const { nxtChar, metadata } = this.generateMetadata(file, codepoint)

          codepoint = nxtChar
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(stream as any).metadata = metadata

          this.fontStream.write(stream)
        }
      }

      write().then(() => {
        this.fontStream.end()
      })
    })
  }

  private async generateFonts(svgTmp: FileResult) {
    // Add the SVG Font to our IconFs
    this.fs.dist.write(GeneratedFileType.SVG, await readFile(svgTmp.name))

    // Generate TTF fonts from SVG font
    const ttf = svg2ttf(this.fs.dist.svg.content.toString())
    const ttfBuffer = Buffer.from(ttf.buffer)
    this.fs.dist.write(GeneratedFileType.TTF, ttfBuffer)

    // Generate EOT and WOFF from TTF
    this.fs.dist.write(GeneratedFileType.EOT, ttf2eot(ttf.buffer))
    this.fs.dist.write(GeneratedFileType.WOFF, ttf2woff(ttf.buffer))

    // Generate WOFF2 from TTF
    // I could not get this package to work via the js API, so I utilize the CLI
    const ttfTmp = fileSync()
    const woff2Tmp = fileSync()
    await writeFile(ttfTmp.name, ttf.buffer)
    execSync(`cat ${ttfTmp.name} | ttf2woff2 > ${woff2Tmp.name}`)
    this.fs.dist.write(GeneratedFileType.WOFF2, await readFile(woff2Tmp.name))
  }

  private generateMetadata(file: string, codePoint: number) {
    const unicode = String.fromCodePoint(codePoint)
    const filenameMatch = file.match(/([\w\W]+)\.svg$/)

    if (!filenameMatch || filenameMatch.length < 2) {
      throw new Error(
        `Font stream metadata provider failed to generate icon name for file: ${file}`,
      )
    }

    const metadata = {
      path: file,
      name: filenameMatch[1],
      unicode: [unicode],
      renamed: false,
    }

    const nxtChar = codePoint + 1

    return { nxtChar, metadata }
  }
}
