import { SVGToFontPluginConfig } from '../config'
import { BuiltFiles } from './BuiltFiles'
import { GeneratedFiles } from './generatedFiles'
import { SourceFiles } from './SourceFiles'

export interface IconFs {
  src: SourceFiles
  dist: BuiltFiles
}

export type CreateIconFs = (
  conf: SVGToFontPluginConfig,
  generated: GeneratedFiles,
) => IconFs

export const iconFs: CreateIconFs = (conf, generated) => {
  return {
    src: new SourceFiles(conf.svgPath),
    dist: new BuiltFiles(conf, generated),
  }
}
