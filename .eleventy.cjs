require('dotenv').config()

const fs = require('fs')
const sp = require('synchronized-promise')

const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const pluginSvgContents = require('eleventy-plugin-svg-contents')

const iconsprite = require('./utils/iconsprite.js')
const { observableCell } = require('./utils/observable.js')

const filters = require('./utils/filters.js')
const shortcodes = require('./utils/shortcodes.js')

const link = require('linkinator')

const eleventyRemark = require('@fec/eleventy-plugin-remark')
const visit = require('unist-util-visit')
const remarkEmoji = require('remark-emoji')
const remarkFootnotes = require('remark-footnotes')
const {
  renumberFootnotes: remarkRenumberFootnotes
} = require('@amanda-mitchell/remark-renumber-footnotes')
const remarkCodeFrontmatter = require('remark-code-frontmatter')
const remarkGfm = require('remark-gfm')
const remarkSmartypants = require('@silvenon/remark-smartypants')
const remarkDirective = require('remark-directive')
const remarkSlug = require('remark-slug')
const remarkAutolinkHeadings = require('remark-autolink-headings')
const remarkRehype = require('remark-rehype')
const rehypeStringify = require('rehype-stringify')
const rehypeRaw = require('rehype-raw')
const h = require('hastscript')
const s = require('hastscript/svg')
const u = require('unist-builder')
const find = require('unist-util-find')
const { select, matches } = require('hast-util-select')
const sortBy = require('lodash/sortBy')

const shiki = require('shiki')
const htmlmin = require('html-minifier')

const isDev = process.env.NODE_ENV === 'development'
const isFullBuild = () => {
  const nodeARGV = process.env.npm_config_argv
    ? JSON.parse(process.env.npm_config_argv)
    : { cooked: [] }
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
  config.addPassthroughCopy('src/assets/audio')
  config.addPassthroughCopy('src/files')
  config.addPassthroughCopy({ 'src/assets/favicons': '/' })

  config.on('afterBuild', async () => {
    if (isFullBuild()) {
      console.log('Checking links...')
      const checker = new link.LinkChecker()

      checker.on('pagestart', (url) => {
        console.log(`Scanning ${url}`)
      })

      const results = await checker.check({
        path: './dist',
        recurse: true,
        retry: false,
        timeout: 5000,
        linksToSkip: ['.+archive.is.+']
      })

      const brokenLinks = results.links.filter(
        (l) => l.status >= 400 && l.status <= 599
      )

      console.log(
        `${brokenLinks.length}/${results.links.length} links are broken.`
      )
      if (brokenLinks.length)
        console.log(brokenLinks.map((l) => [l.url, l.status]))
    }
  })

  const githubLight = JSON.parse(
    fs.readFileSync('./utils/github-plus.json', 'utf-8')
  )
  const highlighter = sp(() => shiki.getHighlighter({ theme: githubLight }))()

  config.addPlugin(eleventyRemark, {
    enableRehype: false,
    plugins: [
      remarkEmoji,
      remarkFootnotes,
      remarkRenumberFootnotes,
      remarkGfm,
      remarkSmartypants,
      remarkSlug,
      {
        plugin: remarkAutolinkHeadings,
        options: {
          behavior: 'append',
          content: s(
            'svg',
            {
              className: ['icon', 'icon--link'],
              width: '1em',
              height: '1em'
            },
            [s('use', { 'xlink:href': '#icon-link' })]
          ),
          linkProperties: {
            ariaHidden: 'true',
            tabIndex: -1,
            className: ['header-link']
          }
        }
      },
      remarkDirective,
      // TODO: Move custom plugins into their own files
      function directives() {
        return transform

        function transform(tree) {
          visit(
            tree,
            { type: 'containerDirective', name: 'admonition' },
            admonitionDirective
          )
          visit(
            tree,
            { type: 'leafDirective', name: 'figure' },
            figureDirective
          )
          // visit(tree, { type: 'textDirective', name: 'doi' }, doiDirective)

          function admonitionDirective(node, index, parent) {
            const data = node.data || (node.data = {})
            const kind = node.attributes.kind || 'note'

            const title = find(node, { data: { directiveLabel: true } })
            if (title) {
              const titleData = title.data || (title.data = {})
              titleData.hName = 'span'
              titleData.hProperties = { className: ['admonition-title'] }
            }

            data.hName = 'div'
            data.hProperties = { className: ['admonition', kind] }
          }

          function figureDirective(node, index, parent) {
            const data = node.data || (node.data = {})
            const caption = node.children

            node.type = 'figure'
            data.hName = 'figure'
            const imageAttributes = { ...node.attributes, data: {} }
            if (imageAttributes.width)
              imageAttributes.data.hProperties = {
                width: imageAttributes.width
              }

            node.children = [
              u('image', imageAttributes),
              u('figcaption', { data: { hName: 'figcaption' } }, caption)
            ]
          }
        }
      },
      remarkCodeFrontmatter,
      function highlightCode() {
        return transformer

        function transformer(tree) {
          visit(tree, 'code', visitor)

          function visitor(node, i, parent) {
            const highlighted = highlighter.codeToHtml(node.value, node.lang)
            node.type = 'html'
            node.value = highlighted

            if (node.frontmatter.filename)
              parent.children.splice(i, 0, {
                type: 'html',
                value: `<div class='code-filename'>${node.frontmatter.filename}</div>`
              })
          }
        }
      },
      {
        plugin: remarkRehype,
        options: { allowDangerousHtml: true }
      },
      rehypeRaw,
      function inlineCodeFix() {
        return transformer

        function transformer(tree) {
          visit(tree, { tagName: 'code' }, visitor)

          function visitor(node, _index, outerEl) {
            if (matches('a', outerEl))
              outerEl.properties.className = [
                ...(outerEl.properties.className || []),
                'has-code'
              ]
          }
        }
      },
      function enhanceFootnotes() {
        return transformer

        function transformer(tree) {
          const footnotesDiv = select('div.footnotes', tree)

          if (footnotesDiv) {
            const hrIndex = footnotesDiv.children.findIndex((node) =>
              matches('hr', node)
            )
            footnotesDiv.children.splice(hrIndex + 1, 0, h('h3', 'Footnotes'))

            // Fix for out of order footnotes from tables
            const ol = select('ol', footnotesDiv)
            ol.children = sortBy(
              ol.children.filter((el) => el.tagName === 'li'),
              (li) => parseInt(li.properties.id.split('-')[1], 10)
            )

            tree.children = [
              h(
                'div',
                {
                  dataController: 'footnotes-highlight',
                  dataAction:
                    'hashchange@window->footnotes-highlight#highlightFootnote'
                },
                tree.children
              )
            ]
          }
        }
      },
      rehypeStringify
    ]
  })

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
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  }
}
