declare module 'types/rollup-plugin-generate-package-json' {
  import type { Plugin } from 'rollup'
  import { PackageJson } from 'type-fest'
  export default function generatePackageJson(options: {
    additionalDependencies: string[] | PackageJson.Dependency
    baseContents:
      | Partial<PackageJson>
      | ((pkg: Partial<PackageJson>) => Partial<PackageJson>)
    inputFolder: string
    outputFolder: string
  }): Plugin
}
