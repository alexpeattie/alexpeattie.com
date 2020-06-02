# alexpeattie.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/f5deafa7-b7f4-41e5-b320-320bc1e17540/deploy-status)](https://app.netlify.com/sites/alexpeattie-v2/deploys) [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

This is the code for my personal site - [alexpeattie.com](https://alexpeattie.com) - it's a static site built with [Eleventy](https://github.com/11ty/eleventy) and hosted on [Netlify](http://netlify.com/).

## Features

- 🎨 Style preprocessing with SASS/SCSS, [PostCSS](https://github.com/postcss/postcss) and [Autoprefixer](https://github.com/postcss/autoprefixer)
- 📦 [Webpack](https://github.com/webpack/webpack) for asset bundling
- 🌐 ES6 support with [Babel](https://github.com/babel/babel)
- 🔍 SEO friendly pages (including Open Graph and Twitter meta)
- 🗺 Automatic RSS feed & sitemap generation
- 💡 [light-server](https://github.com/txchen/light-server) as local dev server
- 💻 [Netlify CLI](https://github.com/netlify/cli) for local replication of the prod environment
- ⚡️ Build-time style optimization (with [cssnano](https://github.com/cssnano/cssnano)) and [Turbolinks](https://github.com/turbolinks/turbolinks) for snappy performance
- ✨ [Stimulus](https://github.com/stimulusjs/stimulus) as a JS micro-framework
- 🧮 [Shiki](https://github.com/octref/shiki) for syntax highlighting, [KaTeX](https://github.com/KaTeX/KaTeX) for math rendering

---

## 🛠 Installation & dev setup

1. Install and use the correct version of Node using [NVM](https://github.com/nvm-sh/nvm)

```bash
nvm install
```

2. Install dependencies

```bash
yarn
```

3. Start the development server

```bash
yarn run dev
```

The site should be running on <http://localhost:4000> ✅.

## 📦 Building for production

To generate a full static production build

```bash
NODE_ENV=production yarn run build
```

You can preview the generated site as it will appear on Netlify, using [Netlify Dev]():

```bash
yarn global add netlify-cli # if not already installed
yarn run netlify dev
```

The production site can be previewed on <http://localhost:4001> ✅.

## 🎨 Color Reference

| Color      | Hex                                                                |
| ---------- | ------------------------------------------------------------------ |
| Text       | ![#212529](https://via.placeholder.com/10/212529?text=+) `#212529` |
| Headings   | ![#000000](https://via.placeholder.com/10/000000?text=+) `#000000` |
| Light text | ![#738a94](https://via.placeholder.com/10/738a94?text=+) `#738a94` |
| Logo       | ![#fff255](https://via.placeholder.com/10/fff255?text=+) `#fff255` |
| Code BG    | ![#f6f8fa](https://via.placeholder.com/10/f6f8fa?text=+) `#f6f8fa` |
| Separators | ![#e9ecef](https://via.placeholder.com/10/e9ecef?text=+) `#e9ecef` |
| Link       | ![#007bff](https://via.placeholder.com/10/007bff?text=+) `#007bff` |
| Link hover | ![#0056b3](https://via.placeholder.com/10/0056b3?text=+) `#0056b3` |

(The colors used across the site are stored as SASS variables in [`_variables.scss`](/blob/master/source/assets/css/_variables.scss))

## Contributing

As you might imagine, I'm only after contributions for actual bugs or typos (maybe refactoring) - please don't open an issue because you think the site's content is rubbish :sweat_smile:!

Of course, feel free to fork this repo if you want to use it as the base for your own site.

## License

Copyright © 2020 Alex Peattie. MPLv2 Licensed, see [LICENSE](https://github.com/alexpeattie/alexpeattie.com/blob/master/LICENSE.md) for details.
