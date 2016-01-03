require 'active_support/core_ext/string/inflections'

module MetadataHelpers
  def title
    page_title = current_page.data.title
    return page_title if page_title&.include?('Alex Peattie')

    [(page_title || slug), 'Alex Peattie'].join(' - ')
  end

  def slug
    template_name = File.basename(current_page.file_descriptor.relative_path).sub(/\..*/, '')
    template_name.gsub('-', ' ').humanize
  end

  def summary(path, html = true)
    path += '.html' unless path.end_with?('.html')
    page = sitemap.find_resource_by_path(path)

    html ? page.html_summary : page.text_summary
  end

  def source_url(page)
    base = 'https://github.com/alexpeattie/alexpeattie.com/blob/master/source/'

    base + page.file_descriptor.relative_path.to_s
  end
end