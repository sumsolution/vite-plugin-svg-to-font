import { createReadStream, ReadStream } from 'fs'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { EmittedFile } from 'rollup'
import { SVGToFontPluginConfig } from './config'

export enum GeneratedFileType {
  CSS = 'css',
  EOT = 'eot',
  SVG = 'svg',
  TTF = 'ttf',
  WOFF = 'woff',
  WOFF2 = 'woff2',
}
const generatedFileTypes: GeneratedFileType[] = Object.values(GeneratedFileType)
const isGeneratedFileType = (ft: string): ft is GeneratedFileType =>
  generatedFileTypes.includes(ft as GeneratedFileType)

export type GeneratedFiles = {
  [P in GeneratedFileType]: GeneratedFile
}

interface GeneratedFile {
  /**
   * The name of the generated file with extension
   */
  name: string
  /**
   * The contents of the generated file
   */
  content: Buffer
  /**
   * A reference to the generated file provided by Rollup
   */
  ref: string
}

export interface IconFs {
  src: {
    names: string[]
    [Symbol.iterator](): Generator<
      { stream: ReadStream; file: string },
      void,
      unknown
    >
  }
  dist: GeneratedFiles & {
    /**
     * Determines whether the ID is a generated file identifier
     * @param id
     */
    has: (id: string) => id is GeneratedFileType
    /**
     * Returns the file contents as a string
     * @param id
     */
    read: (id: GeneratedFileType) => string | null
    /**
     * Save generated file contents to virtual file system
     * @param id
     * @param content
     */
    write: (id: GeneratedFileType, content: Buffer) => void
    /**
     * Generate EmittedFile metadata for build mode
     */
    emitAsset: (type: GeneratedFileType) => EmittedFile
  }
}

export const iconFs = async ({
  fontName,
  svgPath,
  outDir,
}: SVGToFontPluginConfig): Promise<IconFs> => {
  const srcFiles = await readdir(svgPath)

  const matcher = new RegExp(`${fontName}\\.(${generatedFileTypes.join('|')})$`)
  const generatedFiles = generatedFileTypes.reduce<GeneratedFiles>(
    (acc, nxt) => {
      const name = `${fontName}.${nxt}`
      acc[nxt] = {
        name,
        content: Buffer.from(''),
        ref: name,
      }
      return acc
    },
    {} as GeneratedFiles,
  )

  const getFileType = (id: string): GeneratedFileType | undefined => {
    const matches = id.match(matcher)
    return matches.length > 1 && isGeneratedFileType(matches[1])
      ? matches[1]
      : undefined
  }

  const hasFile = (
    id: string,
  ):
    | { has: true; type: GeneratedFileType }
    | { has: false; type: undefined } => {
    const type = getFileType(id)
    const noFile = { has: false, type: undefined }
    if (!type) {
      return noFile
    }

    const generatedFile = generatedFiles[type]
    const has = generatedFile && generatedFile.content.length > 0
    if (!has) {
      return noFile
    }

    return { has, type }
  }

  const readFile = (id: string): string | null => {
    const { has, type } = hasFile(id)
    if (has) {
      return generatedFiles[type].content.toString()
    }
    return null
  }

  return {
    src: {
      names: srcFiles.filter(file => /\.svg$/.test(file)),
      *[Symbol.iterator]() {
        for (const file of this.names) {
          yield { stream: createReadStream(join(svgPath, file)), file }
        }
      },
    },
    dist: {
      css: generatedFiles.css,
      eot: generatedFiles.eot,
      svg: generatedFiles.svg,
      ttf: generatedFiles.ttf,
      woff: generatedFiles.woff,
      woff2: generatedFiles.woff2,
      has: (id: string): id is GeneratedFileType => hasFile(id).has,
      read: readFile,
      write: (id: GeneratedFileType, content: Buffer) =>
        (generatedFiles[id].content = content),
      emitAsset: (type: GeneratedFileType): EmittedFile => ({
        type: 'asset',
        fileName: `${outDir.length ? `${outDir}/` : ''}${
          generatedFiles[type].name
        }`,
        source: generatedFiles[type].content,
      }),
    },
  }
}
