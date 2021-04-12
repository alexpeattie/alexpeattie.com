---
title: 'Better GitHub-style syntax highlighting with Rouge'
---

!!! update Update 2020
This tutorial is out-of-date. See the repository for [alexpeattie.com](https://github.com/alexpeattie/alexpeattie.com) to see how I do it now.
!!!

<!-- excerpt -->

This is a sequel to my earlier post: [GitHub-style syntax highlighting with Pygments](/blog/github-style-syntax-highlighting-with-pygments/) - I recently updated the way I do syntax highlighting on this site, so here's a quick writeup of how I'm doing it. As before, here's a snippet of Ruby code to demonstrate how the highlighting looks:

```ruby
class A < B; def self.create(object = User)
class Zebra; def inspect; "X#{2 + self.object_id}"

module ABC::DEF
  include Comparable

  # @param test
  # @return [String] nothing
  def foo(test)
    Thread.new do |blockvar|
      ABC::DEF.reverse(:a_symbol, :'a symbol', :<=>, 'test' + test)
    end.join
  end

  def [](index) self[index] end
  def ==(other) other == self end
end

anIdentifier = an_identifier
Constant = 1
render action: :new
```

Of course _better_ is a very fuzzy term - but some advantages over the previous approach:

- [Rouge](https://github.com/jayferd/rouge) is 100% Ruby-based. So no more having to rely on the (albeit excellent) python-based [Pygments](https://pygments.org/) - which always felt like a bit of a hack
- Easier line numbers, without any extra CSS. Has the added advantage of universal browser support.
- [middleman-syntax](https://github.com/middleman/middleman-syntax) uses Rouge by default in version 1.2+

This post focuses on [middleman](http://middlemanapp.com/) (which this site is built on) but rouge can be used with Rails[^1] or Sinatra[^2] too.

## Setup

To enable basic syntax highlighting, we need to add the `middleman-syntax` gem to our `Gemfile`:

```ruby
gem "middleman-syntax"
```

and activate it in our `config.rb`:

```ruby
activate :syntax
```

Finally we'll enable line numbers with the aptly-named `line_numbers` option:

```ruby
activate :syntax, line_numbers: true
```

## Styling

Most of the work is done already, thanks to richleland's [Github color scheme](https://github.com/richleland/pygments-css/blob/146708f9003299106baf05987abf393eae4424fc/github.css). We just need to tweak the first line, to replace `.hll` with `.highlight`

```css
.hll {
  background-color: #ffffcc;
} /* WRONG */
.highlight {
  background-color: #ffffcc;
} /* RIGHT */
```

And we'll add a little extra CSS to style our `<pre>`, add some extra padding, and prettify the line numbers a bit.

```css
pre {
  border: solid 1px #ddd;
  background: #fff;
  padding: 0;
  line-height: 23px;
  margin-bottom: 30px;
  white-space: pre;
  overflow-x: auto;
  word-break: inherit;
  word-wrap: inherit;
}

.highlight td {
  padding: 8px 15px;
}

.gl {
  background: #fafafa;
  border-right: 1px solid #ddd;
  color: #999;

  /* Stop line numbers being visually selected */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

## Markdown

I couldn't get rouge to play nicely with [Redcarpet](https://github.com/vmg/redcarpet) on middleman - so I decided to switch to [Kramdown](https://github.com/gettalong/kramdown), which I highly recommend. It's written in pure Ruby, and comes with [fenced code blocks](https://kramdown.gettalong.org/syntax.html#fenced-code-blocks) out-of-the-box, as well as footnotes and a bunch of other useful features[^3].

[^1]: <http://web.archive.org/web/20161220034236/http://crabonature.pl/posts/17-syntax-highlighting-in-ruby-on-rails>
[^2]: <https://github.com/zzak/glorify>
[^3]: <https://kramdown.gettalong.org/syntax.html#fenced-code-blocks>
