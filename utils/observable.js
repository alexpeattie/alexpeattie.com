const puppeteer = require('puppeteer')

const embedCode = (id, cell, prerender = '') => {
  return `<div class="observable" id="${id}">${prerender}</div>
  <script type="module">
  import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
  import define from "https://api.observablehq.com/@${id}.js?v=3";
  const inspect = () => new Inspector(document.getElementById('${id}'));
  (new Runtime).module(define, name => {
    return name === "${cell}" ? inspect() : undefined
  });
  </script>`
}

module.exports = async (id, cell) => {
  if (process.env.NODE_ENV === 'development') {
    return embedCode(id, cell)
  } else {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    html = `<html><body>${embedCode(id, cell)}</body></html>`

    await page.setContent(html)
    await page.waitForSelector('canvas')

    const imageData = await page.evaluate(() =>
      document.querySelector('canvas').toDataURL()
    )
    await browser.close()

    return embedCode(id, cell, `<img src='${imageData}'>`)
  }
}
