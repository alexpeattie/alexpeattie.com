# alexpeattie.com

This is the code for my personal site - [alexpeattie.com](https://alexpeattie.com) - it's a static site built with [Middleman](https://github.com/middleman/middleman) 4. There are a few differences from a 'vanilla' Middleman site, which are laid out in the [**Under the hood**](#under-the-hood) section :relaxed:.

In production, I'm hosting the site on Amazon S3.

![alexpeattie.com](https://cloud.githubusercontent.com/assets/636814/12183834/4bb61c34-b589-11e5-808e-ad3667cb6358.jpg)

## Getting the site up & running

#### Prerequisites
- Ruby 2.2.3
- Bundler
- NPM & Bower

~~~bash
bundle install
bower install
middleman
~~~

The site should be running on <http://localhost:4567> ✅. Build the site with:

~~~bash
middleman build
~~~

## Under the hood

### Directory structure

~~~bash
├── ap.sublime-project      # Sublime Text settings (ignore build directories)
├── bower.json              # external CSS & JS dependencies
├── config.rb               # Middleman config
├── Gemfile                 # external Ruby dependencies
│
├── helpers                 # additional Ruby helpers for custom functionality
└── source
    ├── assets
    │   ├── css             # stylesheets (written in SCSS)
    │   ├── favicons        # favicons live here (moved into root during build)
    │   ├── images
    │   ├── js
    │   └── videos
    ├── blog
    ├── components          # reusable components (i.e. partials)
    ├── files               # downloads
    ├── layouts
    └── projects
~~~

#### Bower

We're tracking all of our external JS/CSS dependencies with Bower. We use it even when the asset doesn't have a Bower package, in which case we just use a Git URL instead (see the [Bower spec](https://github.com/bower/spec/blob/master/json.md#dependencies)).

We're loading our Bower component in using [`middleman-sprockets`](https://github.com/middleman/middleman-sprockets), as laid out by [Steve Johnson](http://abstractcoder.com/2013/07/12/using-bower-with-middleman-through-sprockets.html).

#### Favicons

<p align='center'><img src='https://cloud.githubusercontent.com/assets/636814/12183378/5e5e8ca2-b586-11e5-8a20-fa0fa7b64652.png' width='100'></p>

The favicons/home/tile icons were generated with (the excellent) [Real Favicon Generator](http://realfavicongenerator.net/). To avoid cluttering up the root of the `source/` directory with 30 (!) icons, we use (abuse?) a new feature of Middleman 4 which allows us to have multiple source directories:

~~~ruby
files.watch :source, path: File.join(root, 'source', 'assets', 'favicons'), priority: 100
~~~

The fact that this new source directory is inside the existing one doesn't seem to phase MM - `priority: 100` ensures it takes precedent over the default source directory. The favicons will end up in the root of the `build/` directory.

#### Styles

The stylesheets are written with SCSS. The primary colors and breakpoints for the sites are stored in `_variables.scss`, which is imported into (almost every file). `all.css` combines our external (Bower dependencies) with our local CSS files. `global/layout.scss` is loaded before every other stylesheet.

As far as possible, I'm using [SUIT CSS's naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) throughout. Prefixes are added during build with [`middleman-autoprefixer`](https://github.com/middleman/middleman-autoprefixer).

#### Syntax highlighting

<p align='center'><img src='https://cloud.githubusercontent.com/assets/636814/12183416/9cedea3a-b586-11e5-9149-db5f3ad810f0.png' width='300'></p>

Designed to mirror Github's syntax highlighting. I use `middleman-syntax` with Rich Leland's [Github CSS for Pygments](https://github.com/richleland/pygments-css/blob/master/github.css) with a bit of my own styling, see [`global/code.scss`](https://github.com/alexpeattie/alexpeattie.com/blob/master/source/assets/css/global/code.scss).

#### Summaries

I've extended the `middleman-blog`'s default code for generating summaries (in [`helpers/summary.rb`](https://github.com/alexpeattie/alexpeattie.com/blob/master/helpers/summary.rb). Summaries are scoped to the *first paragraph containing text*, ignoring paragraphs with a `role='menu'` attribute.

The same code is used to generate the default Meta description tags.

#### External posts

I adapted the approach layout out by @tdreyno [here](https://github.com/middleman/middleman-blog/issues/48) to allow external links to be embedded in the blog.

Any post with `.external` in the filename is ignored (not compiled during the build process). I had to monkey-patch the `Middleman::Blog::BlogData` class, because by default ignored posts don't show up in the article list :monkey_face:.

The `external_link` attribute it the post's front-matter is used as the link. External articles have different styling.

#### SVG animation

<p align='center'><img src='https://cloud.githubusercontent.com/assets/636814/12183493/0c5193ea-b587-11e5-858c-80cccb81e8a7.gif'></p>

The animated icons on [the homepage](http://alexpeattie.com) are animated with [vivus.js](https://github.com/maxwellito/vivus). Each icon is cloned, the copy being overlayed over the original for the hover state. The hover states are [styled in CSS](https://github.com/alexpeattie/alexpeattie.com/blob/d19f3dabf9b30db6f738f10155ba088a06e0b656/source/assets/css/home/me.scss#L88-L91) to give each one a different stroke color - the vivus animation plays `onmouseover`, and reverses `onmouseout`.

#### Source code links

After some tinkering I found you could get the path to the source file of the template being rendered (not just it's URL) by calling `current_page.file_descriptor.relative_path` (this returns a [`Pathname`](http://ruby-doc.org/stdlib-2.3.0/libdoc/pathname/rdoc/Pathname.html) instance that you can `.to_s` as neccessary).

This made it easy to link every page on [alexpeattie.com](http://alexpeattie.com) to it's equivalent source file in this repo :grin: (see [`layouts/layout.erb`](https://github.com/alexpeattie/alexpeattie.com/blob/master/source/layouts/layout.erb)).

#### Comments

Comments are powered by [Disqus](https://disqus.com) - rather than using [`middleman-disqus`](https://github.com/simonrice/middleman-disqus) I rolled my own (see [`layouts/_comments.erb`](https://github.com/alexpeattie/alexpeattie.com/blob/master/source/layouts/_comments.erb)) :speech_balloon:.

## Contributing

As you might imagine, I'm only after contributions for actual bugs or typos (maybe refactoring) - please don't open an issue because you think the site's content is rubbish :stuck_out_tongue_winking_eye:!

Of course, feel free to fork this repo if you want to use it as the base for your own site.

## License

Copyright © 2016 Alex Peattie. MPLv2 Licensed, see [LICENSE](https://github.com/alexpeattie/alexpeattie.com/blob/master/LICENSE.md) for details.