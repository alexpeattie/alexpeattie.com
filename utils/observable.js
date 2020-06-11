const puppeteer = require('puppeteer')
const imageminPngquant = require('imagemin-pngquant')

const embedCode = (author, title, cell) => {
  return `<div class='observable-embed' id='${title}-${cell}'></div>
  <script type="module">
  import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
  import define from "https://api.observablehq.com/@${author}/${title}.js?v=3";
  const inspect = () => new Inspector(document.getElementById('${title}-${cell}'));
  (new Runtime).module(define, name => {
    return name === "${cell}" ? inspect() : undefined
  });
  </script>`
}

module.exports = {
  observableCell: async (notebook, cell) => {
    const idParts = notebook.split('/')
    const title = idParts.pop()
    const author = idParts.pop() || 'alexpeattie'

    if (process.env.NODE_ENV === 'development') {
      return `<div class='observable-embed' id='${title}-${cell}'></div>`
    } else {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      html = `<html><body>${embedCode(author, title, cell)}</body></html>`

      await page.setContent(html)
      await page.waitForSelector('canvas')

      let imageData = await page.evaluate((title, cell) =>
        document.querySelector('canvas').toDataURL()
      )
      await browser.close()
      const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64')
      imageData = (
        await imageminPngquant({ quality: [0.3, 0.5] })(imageBuffer)
      ).toString('base64')

      return `<div class='observable-embed' id='${title}-${cell}'>
        <img src='data:image/png;base64,${imageData}'>
      </div>`
    }
  }
}
