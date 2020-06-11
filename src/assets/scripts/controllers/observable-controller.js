import { Controller } from 'stimulus'
import { Runtime, Inspector, Library } from '@observablehq/runtime'

function width(stdlib, selector) {
  return stdlib.Generators.observe((notify) => {
    let width = notify(document.querySelector(selector).clientWidth)

    function resized() {
      let newWidth = document.querySelector(selector).clientWidth
      if (newWidth !== width) notify((width = newWidth))
    }

    window.addEventListener('resize', resized)
    return () => window.removeEventListener('resize', resized)
  })
}

export default class extends Controller {
  async connect() {
    const notebooks = this.data.get('notebooks').split(',')
    const stdlib = new Library()

    this.runtime = new Runtime(
      Object.assign({}, stdlib, { width: width(stdlib, '.container') })
    )

    notebooks.forEach(async (notebook) => {
      const idParts = notebook.split('/')
      const title = idParts.pop()
      const author = idParts.pop() || 'alexpeattie'

      const define = await import(
        /* webpackIgnore: true */
        `https://api.observablehq.com/@${author}/${title}.js?v=3`
      )

      this.runtime.module(define.default, (name) => {
        const target = document.querySelector(`#${title}-${name}`)
        if (target) {
          return new Inspector(target)
        } else {
          return true
        }
      })
    })
  }
  disconnect() {
    this.runtime.dispose()
  }
}
