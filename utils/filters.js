const { DateTime } = require('luxon')
const { humanize } = require('inflected')
const Vinyl = require('vinyl')
const h2p = require('html2plaintext')
const { fromText } = require('commonmark-extract-text')

function plain(html) {
  return h2p(html).replace(/\s\s+/g, ' ').trim()
}

module.exports = {
  dateToFormat: function (date, format) {
    return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(String(format))
  },
  dateToISO: function (date) {
    return DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
      includeOffset: false,
      suppressMilliseconds: true
    })
  },
  groupByYear: function (posts) {
    const result = posts.reduce((r, post) => {
      const year = post.date.getFullYear()
      ;(r[year] || (r[year] = [])).push(post)

      return r
    }, {})
    return Object.entries(result).sort((a, b) => b[0] - a[0])
  },
  humanizedStem: function (string) {
    const file = new Vinyl({ path: string })
    return humanize(file.stem.replace(/-/g, ' '))
  },
  plain: plain,
  plainFromMd: function (md) {
    if (!md) return md
    return fromText(md).trim()
  }
}
