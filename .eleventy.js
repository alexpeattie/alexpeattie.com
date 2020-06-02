require('dotenv').config()

const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const pluginSvgContents = require('eleventy-plugin-svg-contents')

const iconsprite = require('./utils/iconsprite.js')

const filters = require('./utils/filters.js')
const shortcodes = require('./utils/shortcodes.js')

const markdownIt = require('markdown-it')
const markdownItKatex = require('@iktakahiro/markdown-it-katex')
const markdownItAttrs = require('markdown-it-attrs')
const markdownItEmoji = require('markdown-it-emoji')
const markdownItDiv = require('markdown-it-div')
const markdownItFootnote = require('markdown-it-footnote')

const emoji = require('./utils/emoji')

const shiki = require('shiki')

const htmlmin = require('html-minifier')

const isDev = process.env.NODE_ENV === 'development'

module.exports = function (config) {
  config.addPlugin(pluginRss)
  config.addPlugin(pluginNavigation)
  config.addPlugin(pluginSvgContents)

  config.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: '<!-- excerpt -->'
  })

  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName])
  })

  Object.keys(shortcodes).forEach((shortcodeName) => {
    config.addShortcode(shortcodeName, shortcodes[shortcodeName])
  })

  config.addNunjucksAsyncShortcode('iconsprite', iconsprite)

  config.addPassthroughCopy('src/robots.txt')
  config.addPassthroughCopy('src/site.webmanifest')
  config.addPassthroughCopy('src/assets/images')
  config.addPassthroughCopy('src/files')
  config.addPassthroughCopy({ 'src/assets/favicons': '/' })

  let highlighter
  const ghTheme = shiki.loadTheme(
    require.resolve('github-textmate-theme/GitHub Light.tmTheme')
  )

  shiki
    .getHighlighter({
      theme: { ...ghTheme, bg: '#f6f8fa' }
    })
    .then((hl) => {
      highlighter = hl
    })

  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: (code, lang) => {
      if (!highlighter || !lang) return ''
      return highlighter.codeToHtml(code, lang)
    }
  })
    .use(markdownItKatex)
    .use(markdownItAttrs)
    .use(markdownItDiv)
    .use(markdownItFootnote)
    .use(markdownItEmoji, { defs: emoji })

  md.renderer.rules.footnote_block_open = () => `
    <hr class="footnotes-sep">
    <h3>Footnotes</h3>
    <section class="footnotes">
      <ol class="footnotes-list">
  `

  md.renderer.rules.footnote_caption = (tokens, idx) =>
    Number(tokens[idx].meta.id + 1)

  md.linkify.set({ fuzzyLink: false })

  config.setLibrary('md', md)

  if (!isDev) {
    config.addTransform('htmlmin', (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        let minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true
        })
        return minified
      }
      return content
    })
  }

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
      layouts: '_layouts',
      data: '_data'
    },
    templateFormats: ['njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  }
}
