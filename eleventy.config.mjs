import 'dotenv/config'

import fs from 'fs'
import pluginRss from '@11ty/eleventy-plugin-rss'
import pluginNavigation from '@11ty/eleventy-navigation'
import pluginSvgContents from 'eleventy-plugin-svg-contents'

import iconsprite from './utils/iconsprite.js'
import { observableCell } from './utils/observable.js'

import shortcodes from './utils/shortcodes.js'
import filters from './utils/filters.js'

import eleventyRemark from '@fec/eleventy-plugin-remark'
import { visit } from 'unist-util-visit'
import remarkEmoji from 'remark-emoji'
import remarkFootnotes from 'remark-footnotes'
import { renumberFootnotes as remarkRenumberFootnotes } from '@amanda-mitchell/remark-renumber-footnotes'
import remarkCodeFrontmatter from 'remark-code-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from '@silvenon/remark-smartypants'
import remarkDirective from 'remark-directive'
import remarkMath from 'remark-math'
import remarkSlug from 'remark-slug'
import remarkAutolinkHeadings from 'remark-autolink-headings'
import remarkRehype from 'remark-rehype'
import remarkTextr from 'remark-textr'
import typographicArrows from 'typographic-arrows'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import h from 'hastscript'
import s from 'hastscript/svg.js'
import u from 'unist-builder'
import find from 'unist-util-find'
import { select, matches } from 'hast-util-select'
import _ from 'lodash'

import { createHighlighter } from 'shiki'
import { transformerNotationDiff } from '@shikijs/transformers'
import htmlmin from 'html-minifier'

const isDev = process.env.NODE_ENV === 'development'

export default async function (config) {
  let highlighter;

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

  const githubLight = JSON.parse(
    fs.readFileSync('./utils/github-plus.json', 'utf-8')
  )

  config.on('eleventy.before', async () => {
    highlighter = await createHighlighter({ themes: [], langs: ['bash', 'javascript', 'json', 'python', 'ruby', 'yaml'] })
    await highlighter.loadTheme(githubLight)
  })

  config.addPlugin(eleventyRemark, {
    enableRehype: false,
    plugins: [
      remarkEmoji,
      remarkFootnotes,
      remarkRenumberFootnotes,
      remarkGfm,
      remarkMath,
      remarkSmartypants,
      remarkSlug,
      {
        plugin: remarkTextr,
        options: {
          plugins: [typographicArrows]
        }
      },
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
            const highlighted = highlighter.codeToHtml(node.value, {
              lang: node.lang,
              theme: 'github-light',
              transformers: [
                transformerNotationDiff({
                  matchAlgorithm: 'v3',
                }),
                // {
                // line(node, line) {
                //   node.properties['data-line'] = line
                //   if ([1, 3, 4].includes(line))
                //     this.addClassToHast(node, 'highlight')
                // },
              // }
              ]
            })
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
      rehypeKatex,
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
            ol.children = _.sortBy(
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
