# @sumsolution/vite-plugin-svg-to-font
![test](https://github.com/sumsolution/vite-plugin-svg-to-font/actions/workflows/test.yml/badge.svg)
![build](https://github.com/sumsolution/vite-plugin-svg-to-font/actions/workflows/build.yml/badge.svg)
[![npm package](https://badge.fury.io/js/@sumsolution%2Fvite-plugin-svg-to-font.svg)](https://badge.fury.io/js/@sumsolution%2Fvite-plugin-svg-to-font)

Vite plugin for converting SVG files into an icon font in the most commonly supported formats.

## Install
#### PNPM
`pnpm add -D @sumsolution/vite-plugin-svg-to-font`
#### Yarn
`yarn add -D @sumsolution/vite-plugin-svg-to-font`
#### NPM
`npm i -D @sumsolution/vite-plugin-svg-to-font`

## Usage
Add the plugin to your vite configs plugin array.
```typescript
// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vitePluginSVGToFont from '@sumsolution/vite-plugin-svg-to-font'

export default defineConfig({
  plugins: [
    vitePluginSVGToFont({
      svgPath: resolve(__dirname, 'icons')
    })
  ]
})
```
Import the virtual module into the apps main entry point
```typescript
// main.ts
import 'virtual:svg-to-font.css'
```

Use the font in templates with the icon font class and an icon class name. The default font class name is
"icon-font" and can be overriden by passing the `fontName` configuration option. Icon class names are derived from
their `.svg` file name.

In the below example, the `add` class would display the icon created from the file `{svgPath}/add.svg`
```html
<i class="icon-font add"></i>
```

## Configuration
The plugin has a very simple API consisting of one required parameter and 2 optional parameters.

### svgPath
* **required**
* **type**: `string`
* **description**: A path that resolves to a directory containing SVG files. The SVG files will be used to generate the icon font.

### fontName
* **type**: `string`
* **description**: The name used for the generated icon font, files, and font class
* **default**: "icon-font"

### outDir
* **type**: `string`
* **description**: The name of the sub-directory inside of the build output where the font files will be located.
* **default**: "icons"