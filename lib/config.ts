export interface SVGToFontPluginOptions {
  /** Name of generated Icon Font */
  fontName: string
  /** Path to directory containing .svg files used to create the icon font */
  svgPath: string
  /** Subdirectory of rollup build output. Default: "icons" */
  outDir?: string
}

export type SVGToFontPluginConfig = Omit<SVGToFontPluginOptions, 'outDir'> & {
  outDir: string
}
