<div align="center">
  <img alt="Logo" src="https://raw.githubusercontent.com/alexpeattie/alexpeattie.com/master/src/assets/favicons/android-chrome-256x256.png" width="100" />
</div>
<h1 align="center">
  alexpeattie.com
</h1>

<p align="center">
  <a href="https://app.netlify.com/sites/alexpeattie/deploys"><img src="https://api.netlify.com/api/v1/badges/3eb76d3e-b429-4c25-b066-afda0bd66f72/deploy-status" alt="Netlify Status"></a> <a href="https://opensource.org/licenses/MPL-2.0"><img src="https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg" alt="License: MPL 2.0"></a>
</p>

<p align="center">
  <img src='https://github.com/user-attachments/assets/c0670fc7-7b7a-40e5-a9dd-44deefadfdd9' width="600" alt='Site preview'>
</p>

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

## Contributing

As you might imagine, I'm only after contributions for actual bugs or typos (maybe refactoring) - please don't open an issue because you think the site's content is rubbish :sweat_smile:!

Of course, feel free to fork this repo if you want to use it as the base for your own site.

## License

Copyright © 2025 Alex Peattie. MPLv2 Licensed, see [LICENSE](https://github.com/alexpeattie/alexpeattie.com/blob/master/LICENSE.md) for details.
