export interface SVGToFontPluginOptions {
  /** Path to directory containing .svg files used to create the icon font */
  svgPath: string
  /** Name of generated Icon Font. Default: "icon-font" */
  fontName?: string
  /** Subdirectory of rollup build output. Default: "icons" */
  outDir?: string
}

export type SVGToFontPluginConfig = Omit<SVGToFontPluginOptions, 'outDir'> & {
  outDir: string
  isBuild: boolean
  base: string
}
