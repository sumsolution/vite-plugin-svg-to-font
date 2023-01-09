import { testIconNames } from '../../test/icons'
import { testSourceFiles } from '../../test/testFs'
import { SourceFiles } from './SourceFiles'

describe(SourceFiles.name, () => {
  describe('SourceFiles.names', () => {
    it('returns an array of SVG filenames at the provided path', async () => {
      const actual = await testSourceFiles.names
      expect(actual).toEqual(testIconNames)
    })
  })

  describe('SourceFiles.asyncIterator', () => {
    it('iterates over the SVG files located at path, returning the file name and a read stream for each', async () => {
      let i = 0
      for await (const res of testSourceFiles) {
        expect(res.file).toEqual(testIconNames[i])
        i++
      }
    })
  })
})
