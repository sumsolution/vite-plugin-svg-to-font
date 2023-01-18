import 'virtual:svg-to-font.css'
import './style.css'
import { testIconsNames } from '../../test/icons'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>@sumsolution/vite-plugin-svg-to-font</h1>
    <div id="icons">
        ${testIconsNames
          .map(
            iconName =>
              `<div class="card"><i class="icon-font ${iconName}"></i></div>`,
          )
          .join('\n')}
    </div>
    <a class="read-the-docs" href="https://github.com/sumsolution/vite-plugin-svg-to-font/README.md">
      Read the docs
    </a>
  </div>
`
