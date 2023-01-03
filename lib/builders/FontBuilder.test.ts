import { afterEach, describe, expect, it } from 'vitest'
import { testPluginConfig } from '../../test/config'
import { testFs } from '../../test/testFs'
import { FontBuilder } from './FontBuilder'

describe(FontBuilder.name, () => {
  const emptyContent = Buffer.from('')

  afterEach(() => {
    testFs.dist.eot.content = emptyContent
    testFs.dist.svg.content = emptyContent
    testFs.dist.ttf.content = emptyContent
    testFs.dist.woff.content = emptyContent
    testFs.dist.woff2.content = emptyContent
  })

  describe(`${FontBuilder.name}.build`, () => {
    it('generates the font file data and saves to the IconFS', async () => {
      // Confirm file contents start empty
      expect(testFs.dist.eot.content).toEqual(emptyContent)
      expect(testFs.dist.svg.content).toEqual(emptyContent)
      expect(testFs.dist.ttf.content).toEqual(emptyContent)
      expect(testFs.dist.woff.content).toEqual(emptyContent)
      expect(testFs.dist.woff2.content).toEqual(emptyContent)

      // Build Fonts
      const builder = new FontBuilder(testFs, testPluginConfig)
      await builder.build()

      expect(testFs.dist.eot.content.length).toBeGreaterThan(0)
      expect(testFs.dist.svg.content.length).toBeGreaterThan(0)
      expect(testFs.dist.ttf.content.length).toBeGreaterThan(0)
      expect(testFs.dist.woff.content.length).toBeGreaterThan(0)
      expect(testFs.dist.woff2.content.length).toBeGreaterThan(0)
    })
  })
})
