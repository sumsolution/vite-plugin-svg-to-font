import { EmittedFile } from 'rollup'
import { SVGToFontPluginConfig } from '../config'
import {
  GeneratedFile,
  GeneratedFiles,
  GeneratedFileType,
  generatedFileTypes,
  isGeneratedFileType,
} from './generatedFiles'

export class BuiltFiles implements GeneratedFiles {
  constructor(
    private conf: SVGToFontPluginConfig,
    private readonly generatedFiles: GeneratedFiles,
  ) {}

  get css(): GeneratedFile {
    return this.generatedFiles.css
  }
  get eot(): GeneratedFile {
    return this.generatedFiles.eot
  }
  get svg(): GeneratedFile {
    return this.generatedFiles.svg
  }
  get ttf(): GeneratedFile {
    return this.generatedFiles.ttf
  }
  get woff(): GeneratedFile {
    return this.generatedFiles.woff
  }
  get woff2(): GeneratedFile {
    return this.generatedFiles.woff2
  }

  has(id: string): id is GeneratedFileType {
    return this.hasFile(id).has
  }

  read(id: string): string | null {
    const { has, type } = this.hasFile(id)
    if (has) {
      return this[type].content.toString()
    }
    return null
  }

  write(id: GeneratedFileType, content: Buffer): void {
    this.generatedFiles[id].content = content
  }

  emit(type: GeneratedFileType): EmittedFile {
    return {
      type: 'asset',
      fileName: `${this.conf.outDir.length ? `${this.conf.outDir}/` : ''}${
        this[type].name
      }`,
      source: this[type].content,
    }
  }

  private hasFile(
    id: string,
  ): { has: true; type: GeneratedFileType } | { has: false; type: undefined } {
    const type = this.getFileType(id)
    const noFile = { has: false, type: undefined }
    if (!type) {
      return noFile
    }

    const generatedFile = this.generatedFiles[type]
    const has = generatedFile && generatedFile.content.length > 0
    if (!has) {
      return noFile
    }

    return { has, type }
  }

  private getFileType(id: string): GeneratedFileType | undefined {
    const matcher = new RegExp(
      `${this.conf.fontName}\\.(${generatedFileTypes.join('|')})$`,
    )
    const matches = id.match(matcher)
    return matches && matches.length > 1 && isGeneratedFileType(matches[1])
      ? matches[1]
      : undefined
  }
}
