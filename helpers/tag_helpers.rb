module TagHelpers
  def time_tag(date, options = {})
    no_year = options.delete(:no_year)
    
    options.reverse_merge!({datetime: date.strftime("%Y-%m-%d"), pubdate: true})
    content_tag :time, date.strftime("#{date.day.ordinalize} %B" + (no_year ? "" : " %Y")), options
  end

  def title_link_to(path, options = {})
    orig_path = path.dup

    path += '.html' unless path.end_with?('.html')
    page = sitemap.find_resource_by_path(path)

    link_to(page.data.title, orig_path, options)
  end

  def link_to_domain(url)
    uri = URI.parse(url)
    link_to uri.host, "#{ (uri.scheme || 'http') }://#{ uri.host }"
  end
end