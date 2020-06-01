const { plain } = require('./filters')

module.exports = {
  readingTime: function (content) {
    // See https://help.medium.com/hc/en-us/articles/214991667-Read-time
    const wordsPerMin = 265

    const estimate = Math.round(
      plain(content).split(/\s+/).length / wordsPerMin
    )
    let rounded

    if (estimate > 20) {
      rounded = Math.round(estimate / 5) * 5
    } else {
      rounded = estimate
    }

    return `${rounded} minute read`
  },
  icon: function (name) {
    return `<svg class="icon icon--${name}" role="img" aria-hidden="true" width="24" height="24">
      <use xlink:href="#icon-${name}"></use>
    </svg>`
  }
}
