const githubEmoji = require('github-emoji')

module.exports = Object.fromEntries(
  [...githubEmoji.all().entries()].map(([shortCode, info]) => [
    shortCode,
    info.string
  ])
)
