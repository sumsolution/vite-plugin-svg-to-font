import { BuiltFiles } from '../lib/fs/BuiltFiles'
import { initGeneratedFiles } from '../lib/fs/generatedFiles'
import { IconFs } from '../lib/fs/iconFs'
import { SourceFiles } from '../lib/fs/SourceFiles'
import { testPluginConfig } from './config'

export const testGeneratedFiles = initGeneratedFiles(testPluginConfig.fontName)
export const testSourceFiles = new SourceFiles(testPluginConfig.svgPath)
export const testBuiltFiles = new BuiltFiles(
  testPluginConfig,
  testGeneratedFiles,
)
export const testFs: IconFs = {
  src: testSourceFiles,
  dist: testBuiltFiles,
}
