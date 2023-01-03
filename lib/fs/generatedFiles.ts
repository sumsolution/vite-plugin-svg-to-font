export enum GeneratedFileType {
  CSS = 'css',
  EOT = 'eot',
  SVG = 'svg',
  TTF = 'ttf',
  WOFF = 'woff',
  WOFF2 = 'woff2',
}

export type GeneratedFiles = {
  [P in GeneratedFileType]: GeneratedFile
}

export interface GeneratedFile {
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

export const generatedFileTypes: GeneratedFileType[] =
  Object.values(GeneratedFileType)

export const isGeneratedFileType = (ft: string): ft is GeneratedFileType =>
  generatedFileTypes.includes(ft as GeneratedFileType)

export const initGeneratedFiles = (fontName: string) =>
  generatedFileTypes.reduce<GeneratedFiles>((acc, nxt) => {
    const name = `${fontName}.${nxt}`
    acc[nxt] = {
      name,
      content: Buffer.from(''),
      ref: name,
    }
    return acc
  }, {} as GeneratedFiles)
