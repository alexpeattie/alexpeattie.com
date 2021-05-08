---
title: 'How to load local PostCSS plugins with <code>postcss-loader</code>'
---

PostCSS is a great tool for enhancing CSS and it has an extensive ecosystem - [postcss.parts](https://www.postcss.parts/) has a great catalog of available plugins. It also make it quite easy to [write your own plugins](https://github.com/postcss/postcss/blob/master/docs/writing-a-plugin.md) to extend CSS in weird and wonderful ways.

If your plugin is particularly lightweight though, you might not want to bother with the overhead of creating a package, publishing it to NPM etc. Fortunately, it's quite easy to load a PostCSS local plugin inline.

<!-- excerpt -->

#### Our example plugin

For illustration, let's create a tiny plugin which will replace (unsupported) `line-clamp` declarations with [`-webkit-line-clamp`]() - [`autoprefixer`]() won't do this since `-webkit-line-clamp` is a non-standard property.

```js
---
filename: src/postcss-line-clamp.js
---
module.exports = postcss.plugin('postcss-line-clamp', function () {
  return function (root) {
    root.walkDecls(function (decl) {
      if (decl.prop === 'line-clamp') decl.prop = '-webkit-line-clamp'
    })
  }
}
```

#### Loading a local plugin

If you're not using PostCSS with Webpack & `postcss-loader`, just load your local plugin as you would any other plugin:

```js
const postcss = require('postcss')
const postcssImport = require('postcss-import')
const postcssPresetEnv = require('postcss-preset-env')
const postcssPxtorem = require('postcss-pxtorem')
const postcssLineClamp = require('./src/postcss-line-clamp')

const processedCSS = postcss(
  postcssImport(),
  postcssPresetEnv(),
  postcssPxtorem(),
  postcssLineClamp()
).process(css).css
```

However, things a slightly more complicated if we are using Webpack & `postcss-loader`. I didn't figure out how to get local plugins working with `postcss.config.js`, so instead we'll load our PostCSS plugins in `webpack.config.js` (see the [Plugins section](https://github.com/postcss/postcss-loader#plugins) of the `postcss-loader' README). Assuming our initial setup looks like:

```js
---
filename: webpack.config.js
---
module: {
  rules: [
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader']
    }
  ]
}
```

```js
---
filename: postcss.config.js
---
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {},
    'postcss-pxtorem': {}
  }
}
```

We can delete our `postcss.config.js`, and load our plugins manually like so:

```js
---
filename: webpack.config.js
---
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-preset-env')(),
                require('postcss-pxtorem')()
              ]
            }
          }
        ]
      }
    ]
  }
}
```

Now we just have to extend our `plugins` array to include our `line-clamp` plugin:

<!-- prettier-ignore-start -->
```js
---
filename: webpack.config.js
---
module.exports = {
  // ...
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-preset-env')(),
                require('postcss-pxtorem')(),
                require('./src/postcss-line-clamp')(),
              ],
  // ...
}
```
<!-- prettier-ignore-end -->