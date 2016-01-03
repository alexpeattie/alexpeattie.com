module ListExternalPosts
  # External posts have .external in the filename and are ignored (not built)
  # By default ignored posts don't show up in the list of articles
  # this tweak modifies the default behaviour for external posts
  def manipulate_resource_list(resources)
    result = super
    resources.select(&:ignored?).each do |res|
      article = convert_to_article(res)
      @_articles << article if article.data.external_link
    end

    result
  end
end

Middleman::Blog::BlogData.send :prepend, ListExternalPosts