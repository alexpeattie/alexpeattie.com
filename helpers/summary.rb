require 'nokogiri'
require 'middleman-blog/truncate_html'

module Summary
  class Generator
    def self.generate(_this, article_html, max_length, ellipsis)
      article_body = Nokogiri::HTML::DocumentFragment.parse(article_html)
      content = article_body.css('p').detect { |p|
        not p.text.strip.empty? || p['role'] == 'menu'
      }.inner_html rescue nil

      TruncateHTML.truncate_html(content, max_length, '') + ellipsis
    end
  end

  module Pages
    def html_summary(length = 500)
      respond_to?(:summary?) ? summary(length) : Summary::Generator.generate(self, render(layout: false), length, '')
    end

    def text_summary(length = 500)
      CGI.escapeHTML Nokogiri::HTML(html_summary length).text
    end
  end
end

Middleman::Sitemap::Resource.send :include, Summary::Pages