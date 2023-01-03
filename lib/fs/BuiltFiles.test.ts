import { EmittedFile } from 'rollup'
import { afterEach, describe, expect, it } from 'vitest'
import { testPluginConfig } from '../../test/config'
import { testBuiltFiles, testGeneratedFiles } from '../../test/testFs'
import { BuiltFiles } from './BuiltFiles'
import { GeneratedFileType } from './generatedFiles'

describe(BuiltFiles.name, () => {
  const testFileType = GeneratedFileType.CSS
  const testFileId = `${testPluginConfig.fontName}.${testFileType}`
  const testFileContent = 'Test File Content'
  const testBuffer = Buffer.from(testFileContent)

  afterEach(() => {
    // Cleanup after tests
    testBuiltFiles.write(testFileType, Buffer.from(''))
  })

  describe('BuiltFiles getters', () => {
    Object.entries(testGeneratedFiles).map(([key, val]) => {
      describe(`BuiltFiles.${key}`, () => {
        it(`returns the ${key} GeneratedFile object`, () => {
          expect(testBuiltFiles[key]).toBe(val)
        })
      })
    })
  })

  describe('BuiltFiles.has', () => {
    it('returns true if the given id exists and the contents are not empty', () => {
      // Before running the test we need to add some content
      testBuiltFiles.write(testFileType, testBuffer)

      const actual = testBuiltFiles.has(testFileId)
      expect(actual).toBe(true)
    })

    it('returns undefined if the id exists but has no content', () => {
      const actual = testBuiltFiles.has(testFileId)
      expect(actual).toBe(false)
    })

    it('returns undefined if the id does not exist', () => {
      const actual = testBuiltFiles.has('foo.bar')
      expect(actual).toBe(false)
    })
  })

  describe('BuiltFiles.read', () => {
    it('returns the Buffer contents as a string if the given id exists and the contents are not empty', () => {
      // Before running the test we need to add some content
      testBuiltFiles.write(testFileType, testBuffer)

      const actual = testBuiltFiles.read(testFileId)
      expect(actual).toEqual(testFileContent)

      // Cleanup after test
      testBuiltFiles.write(testFileType, Buffer.from(''))
    })

    it('returns null if the id exists but has no content', () => {
      const actual = testBuiltFiles.read(testFileId)
      expect(actual).toBe(null)
    })

    it('returns null if the id does not exist', () => {
      const actual = testBuiltFiles.read('foo.bar')
      expect(actual).toBe(null)
    })
  })

  describe('BuiltFiles.write', () => {
    it('stores the provided buffer on the specified GeneratedFiles object', () => {
      // Verify the file has no content yet
      const initialValue = testBuiltFiles.read(testFileId)
      expect(initialValue).toEqual(null)

      // Write content
      testBuiltFiles.write(testFileType, testBuffer)

      // Test for updated content
      const updatedValue = testBuiltFiles.read(testFileId)
      expect(updatedValue).toEqual(testFileContent)
    })
  })

  describe('BuiltFiles.emit', () => {
    it('generates a rollup EmittedFile object for the specified file type', () => {
      const expected: EmittedFile = {
        type: 'asset',
        fileName: `${testPluginConfig.outDir}/${testFileId}`,
        source: testBuffer,
      }

      testBuiltFiles.write(testFileType, testBuffer)

      const actual = testBuiltFiles.emit(testFileType)
      expect(actual).toEqual(expected)
    })
  })
})
