require 'helpers/summary'
require 'rack/rewrite'

configure :development do
  activate :livereload
end

set :css_dir, 'assets/css'
set :js_dir, 'assets/js'
set :images_dir, 'assets/images'

set :markdown, smart_quotes: 'lsquo,rsquo,ldquo,rdquo'

Tilt::KramdownTemplate.send(:remove_const, :DUMB_QUOTES)
Tilt::KramdownTemplate.const_set(:DUMB_QUOTES, 'lsquo,rsquo,ldquo,rdquo')

# activate :directory_indexes
activate :syntax, line_numbers: true, css_class: 'codehilite'

activate :autoprefixer do |config|
  config.browsers = ['last 3 versions', 'Explorer >= 10']
end

# Keep the root directory clean
files.watch :source, path: File.join(root, 'source', 'assets', 'favicons'), priority: 100

sprockets.append_path File.join(root, 'node_modules')

activate :blog do |blog|
  blog.prefix = 'blog/'
  blog.permalink = ':title.html'
  blog.layout = 'post'
  blog.summary_generator = Summary::Generator.method(:generate)
end
ignore 'blog/*.external*'

page 'projects/*', layout: 'project'

configure :build do
  activate :minify_css
  activate :minify_javascript
  activate :gzip
end

configure :development do
  # mimic Netlify's URL rewriting (https://www.netlify.com/docs/redirects#trailing-slash)
  use ::Rack::Rewrite do
    rewrite %r{^/([^.]+)$}, '/$1.html'
  end
end

# Redirects
redirect 'projects/justvector_icons.html', to: '/projects/justvector-icons'
redirect 'projects/animate-textshadow.html', to: '/projects#legacy'
redirect 'projects/feedback_button.html', to: '/projects#legacy'
redirect 'hp.html', to: '/talks/hp'
