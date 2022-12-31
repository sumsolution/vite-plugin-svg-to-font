import { createWriteStream } from 'fs'
import { readFile } from 'fs/promises'
import svg2ttf from 'svg2ttf'
import SVGIcons2SVGFontStream from 'svgicons2svgfont'
import { FileResult, fileSync } from 'tmp'
import ttf2eot from 'ttf2eot'
import ttf2woff from 'ttf2woff'
import ttf2woff2 from 'ttf2woff2'
import { SVGToFontPluginConfig } from './config'

import { GeneratedFileType, IconFs } from './iconFs'

export interface FontBuilder {
  build: () => Promise<void>
}

export const FontBuilder = (
  fs: IconFs,
  { fontName }: SVGToFontPluginConfig,
): FontBuilder => {
  const svgTmp = fileSync()
  const fontStream = new SVGIcons2SVGFontStream({
    centerHorizontally: true,
    centerVertically: true,
    fontHeight: 1000,
    fontName,
    normalize: true,
  })

  return {
    build: (): Promise<void> =>
      new Promise(async (resolve, reject) => {
        fontStream
          .pipe(createWriteStream(svgTmp.name, { fd: svgTmp.fd }))
          .on('finish', async () => {
            await generateFonts(svgTmp, fs)
            console.log('Fonts successfully created!')
            resolve()
          })
          .on('error', err => {
            console.error('Font creation failed!', err)
            reject()
          })

        // Start by generating our .svg font file from our svg icons
        let startCodepoint = 0xea01
        for (const { stream, file } of fs.src) {
          const { nxtChar, metadata } = generateMetadata(file, startCodepoint)

          startCodepoint = nxtChar
          ;(stream as any).metadata = metadata

          fontStream.write(stream)
        }
        fontStream.end()
      }),
  }
}

async function generateFonts(svgTmp: FileResult, fs: IconFs) {
  // Add the SVG Font to our IconFs
  fs.dist.write(GeneratedFileType.SVG, await readFile(svgTmp.name))

  // Generate TTF fonts from SVG font
  const ttf = svg2ttf(fs.dist.svg.content.toString())
  const ttfBuffer = Buffer.from(ttf.buffer)
  fs.dist.write(GeneratedFileType.TTF, ttfBuffer)

  // Generate EOT and WOFF from TTF
  fs.dist.write(GeneratedFileType.EOT, ttf2eot(ttf.buffer))
  fs.dist.write(GeneratedFileType.WOFF, ttf2woff(ttf.buffer))

  // Generate WOFF2 from TTF
  fs.dist.write(GeneratedFileType.WOFF2, ttf2woff2(ttfBuffer))
}

function generateMetadata(file: string, codePoint: number) {
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
