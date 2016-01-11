require 'helpers/summary'

configure :development do
  activate :livereload
end

set :css_dir, 'assets/css'
set :js_dir, 'assets/js'
set :images_dir, 'assets/images'

activate :directory_indexes
activate :syntax, line_numbers: true, css_class: 'codehilite'

activate :autoprefixer do |config|
  config.browsers = ['last 3 versions', 'Explorer >= 10']
end

# Keep the root directory clean
files.watch :source, path: File.join(root, 'source', 'assets', 'favicons'), priority: 100
sprockets.append_path File.join(root, 'bower_components')

activate :blog do |blog|
  blog.prefix = 'blog/'
  blog.permalink = ':title'
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

# S3 config, obviously change this if you're not me 😉
activate :s3_sync do |s3_sync|
  s3_sync.bucket = 'alexpeattie.com'
  s3_sync.region = 'us-east-1'
  s3_sync.aws_access_key_id = ENV['AP_AWS_ACCESS_KEY_ID']
  s3_sync.aws_secret_access_key = ENV['AP_AWS_SECRET_ACCESS_KEY']
  s3_sync.version_bucket = true
  s3_sync.index_document = 'index.html'
end

# Redirects
redirect 'projects/justvector_icons.html', to: '/projects/justvector-icons'
redirect 'projects/animate-textshadow.html', to: '/projects#legacy'
redirect 'projects/feedback_button.html', to: '/projects#legacy'