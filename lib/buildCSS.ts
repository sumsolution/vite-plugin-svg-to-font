import { parseStringPromise } from 'xml2js'

import { GeneratedFileType, IconFs } from './iconFs'

interface SVGFile {
  svg: {
    defs: Defs
  }
}

type Defs = [
  {
    font: [
      {
        $: { id: string; 'horiz-adv-x': string }
        glyph: Glyph[]
      },
    ]
  },
]

interface Glyph {
  $: {
    'glyph-name': string
    unicode: string
    'horiz-adv-x': string
    d: string
  }
}

export const buildCSS = async (
  fs: IconFs,
  getFilePath: (ref: string) => string,
): Promise<void> => {
  const svgXml = fs.dist.svg.content
  const res: SVGFile = await parseStringPromise(svgXml)
  const root = res.svg.defs[0].font[0]
  const fontFamily = root.$.id
  const glyphs = root.glyph.map(({ $ }: Glyph) => ({
    name: $['glyph-name'],
    code: $.unicode,
  }))
  const css = `
@font-face {
  font-family: '${fontFamily}';
  src: url('${getFilePath(fs.dist.eot.ref)}');
  src: url('${getFilePath(
    fs.dist.woff2.ref,
  )}') format('woff2'), /* Super Modern Browsers */
       url('${getFilePath(
         fs.dist.woff.ref,
       )}')  format('woff'), /* Pretty Modern Browsers */
       url('${getFilePath(
         fs.dist.ttf.ref,
       )}')   format('truetype'), /* Safari, Android, iOS */
       url('${getFilePath(
         fs.dist.svg.ref,
       )}#${fontFamily}') format('svg'); /* Legacy iOS */
  font-weight: normal;
  font-style: normal;
}
.${fontFamily} {
  display: inline-block;
  font: normal normal normal 24px/1 ${fontFamily};
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
${glyphs
  .map(
    g => `
.${g.name}:before {
  content: "${g.code}";
}
`,
  )
  .join('')}
  `

  fs.dist.write(GeneratedFileType.CSS, Buffer.from(css))
}
