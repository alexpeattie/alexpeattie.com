require('dotenv').config()

const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const pluginSvgContents = require('eleventy-plugin-svg-contents')

const iconsprite = require('./utils/iconsprite.js')
const { observableCell } = require('./utils/observable.js')

const filters = require('./utils/filters.js')
const shortcodes = require('./utils/shortcodes.js')

const link = require('linkinator');

const markdownIt = require('markdown-it')
const markdownItKatex = require('@iktakahiro/markdown-it-katex')
const markdownItAttrs = require('markdown-it-attrs')
const markdownItEmoji = require('markdown-it-emoji')
const markdownItDiv = require('markdown-it-div')
const markdownItFootnote = require('markdown-it-footnote')
const markdownItAdmonition = require('markdown-it-admonition')

const emoji = require('./utils/emoji')

const shiki = require('shiki')

const htmlmin = require('html-minifier')

const isDev = process.env.NODE_ENV === 'development'
const isFullBuild = () => {
  const nodeARGV = process.env.npm_config_argv ? JSON.parse(process.env.npm_config_argv) : { cooked: [] }
  return nodeARGV.cooked.pop() === 'build'
}

module.exports = function (config) {
  config.addPlugin(pluginRss)
  config.addPlugin(pluginNavigation)
  config.addPlugin(pluginSvgContents)

  config.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: '<!-- excerpt -->',
    excerpt_alias: 'excerpt'
  })

  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName])
  })

  Object.keys(shortcodes).forEach((shortcodeName) => {
    config.addShortcode(shortcodeName, shortcodes[shortcodeName])
  })

  config.addNunjucksAsyncShortcode('iconsprite', iconsprite)
  config.addNunjucksAsyncShortcode('observableCell', observableCell)

  config.addPassthroughCopy('src/robots.txt')
  config.addPassthroughCopy('src/site.webmanifest')
  config.addPassthroughCopy('src/assets/images')
  config.addPassthroughCopy('src/files')
  config.addPassthroughCopy({ 'src/assets/favicons': '/' })

  config.on('afterBuild', async () => {
    if(isFullBuild()) {
      console.log('Checking links...')
      const checker = new link.LinkChecker()

      checker.on('pagestart', url => {
        console.log(`Scanning ${url}`)
      });

      const results = await checker.check({
        path: './dist',
        recurse: true,
        retry: false,
        timeout: 5000,
        linksToSkip: [
          '.+archive\.is.+'
        ]
      })

      const brokenLinks = results.links.filter(l => l.status >= 400 && l.status <= 599)

      console.log(`${brokenLinks.length}/${results.links.length} links are broken.`)
      if(brokenLinks.length) console.log(brokenLinks.map(l => [l.url, l.status]))
    }

  })

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
    .use(markdownItAdmonition, {
      html: true,
      types: ['note', 'warning', 'failure', 'success', 'tip', 'update']
    })

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
    const isBuild = () => {
      npm_config_argv
    }
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
