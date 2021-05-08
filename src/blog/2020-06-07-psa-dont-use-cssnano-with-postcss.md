---
title: "PSA: Don't use cssnano from within <code>postcss-loader</code>"
---

While redesigning this site, I ran into an odd problem: my build pipeline was generating [CSS source maps](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps) but they were somehow getting messed up. Definitions were pointing to incorrect lines, and sometimes the wrong file altogether.

<!-- excerpt -->

I employed the old developer standby of turning off all the possible causes one by one, and tracked the problem down to one line in my [PostCSS](https://postcss.org/) config:

```js
---
filename: postcss.config.js
---
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {},
    cssnano: {} // 👈 remove this line and source maps behave again
  }
}
```

At the time of writing the documentation for PostCSS[^1] and cssnano[^2] both seem to suggest the two should play nicely together. However, it turns out that according [this Github issue](https://github.com/cssnano/cssnano/issues/659) the developers of cssnano actually don't recommend loading cssnano with `postcss-loader` anymore:

> Don't use cssnano in postcss-loader [...] using on postcss-loader makes impossible same optimization, also css-loader can rewrite some css stuff

The issue mentions a plugin called `optimize-cssnano-plugin` but that seems to be unmaintained - a much better alternative seems to be [`cssnano-webpack-plugin`](https://www.npmjs.com/package/cssnano-webpack-plugin):

```js
---
filename: webpack.config.js
---
const CssnanoPlugin = require('cssnano-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CssnanoPlugin({
      sourceMap: true
    })
  ]
}
```

_Voilà_ - CSS compression without mangled source maps.

[^1]: Source: [`postcss-loader` README (v3.0.0)](https://github.com/postcss/postcss-loader/blob/v3.0.0/README.md#configuration)
[^2]: Source: [Getting started guide - cssnano (v4.1.10)](https://github.com/cssnano/cssnano/blob/v4.1.10/site/content/guides/getting-started.md)
