var postcss = require('postcss')

module.exports = postcss.plugin('postcss-font-smoothing', function () {
  return function (root) {
    root.walkDecls(function (decl) {
      if (decl.prop === 'font-smoothing') {
        if (decl.value === 'antialiased') {
          decl.cloneBefore({
            prop: '-webkit-' + decl.prop
          })

          decl.cloneBefore({
            prop: '-moz-osx-' + decl.prop,
            value: 'grayscale'
          })
        }

        if (decl.value === 'auto') {
          decl.cloneBefore({
            prop: '-webkit-' + decl.prop
          })

          decl.cloneBefore({
            prop: '-moz-osx-' + decl.prop
          })
        }

        if (decl.value === 'grayscale') {
          decl.cloneBefore({
            prop: '-webkit-' + decl.prop,
            value: 'antialiased'
          })

          decl.cloneBefore({
            prop: '-moz-osx-' + decl.prop
          })
        }

        decl.remove()
      }
    })
  }
})
