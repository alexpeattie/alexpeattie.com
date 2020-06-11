const readTimeEstimate = require('read-time-estimate').default

module.exports = {
  readingTime: function (content) {
    const { duration } = readTimeEstimate(content, 275, 12, 500, [
      'img',
      'Image',
      'video',
      `div class=['"]observable-embed`
    ])

    if (duration > 20) {
      rounded = Math.round(duration / 5) * 5
    } else {
      rounded = Math.max(Math.round(duration), 1)
    }

    return `${rounded} minute read`
  },
  icon: function (name) {
    return `<svg class="icon icon--${name}" role="img" aria-hidden="true" width="24" height="24">
      <use xlink:href="#icon-${name}"></use>
    </svg>`
  }
}
