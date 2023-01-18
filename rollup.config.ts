import { readPackage } from 'read-pkg'
import rimraf from 'rimraf'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import externals from 'rollup-plugin-node-externals'

export default defineConfig(async _ => {
  const { author, bugs, exports, license, name, repository, types, version, } =
    await readPackage()

  return {
    input: 'lib/index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'es',
      },
      {
        file: 'dist/index.js',
        format: 'cjs',
      },
    ],
    plugins: [
      {
        name: 'clean-dist',
        buildStart: () => {
          rimraf.sync('dist/*')
        },
      },
      typescript(),
      externals(),
      generatePackageJson({
        baseContents: {
          name,
          version,
          license,
          author,
          repository,
          bugs,
          types,
          exports,
        },
      }),
    ],
  }
})
