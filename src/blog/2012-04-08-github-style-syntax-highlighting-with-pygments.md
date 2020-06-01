---
title: 'GitHub-style syntax highlighting with Pygments'
---

<div class='Callout'><p><strong>Update 2016</strong>: This tutorial is out-of-date. See the <a href='https://github.com/alexpeattie/alexpeattie.com'>repository for  alexpeattie.com</a> and the <a href='https://github.com/alexpeattie/alexpeattie.com#syntax-highlighting'>associated README</a> to see how I do it now.</p></div>

<!-- excerpt -->

A few people have asked me how I do the Github-style syntax highlighting on this site. Here's an example Ruby script with highlighting:

```ruby
class A < B; def self.create(object = User) object end end
class Zebra; def inspect; "X#{2 + self.object_id}" end end

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

This how-to explains my setup on Middleman (which this site is built on), but it should be applicable to any site using [Pygments](http://pygments.org/) for syntax highlighting.

To enable basic syntax highlighting, we need to add the middleman-syntax gem to our `Gemfile`:

```ruby
gem "middleman-syntax"
```

and activate it in our `config.rb`:

```ruby
activate :syntax
```

We'll also turn on the `lineanchors` option, which we'll need for line numbering ([see below](#line-numbers)).

```ruby
activate :syntax, lineanchors: 'line'
```

## Fenced code blocks

The first feature we'll add is fenced code blocks, a feature of [Github Flavored Markdown](http://github.github.com/github-flavored-markdown/). This allows us to conveniently specify the language (and thus, the [Pygments lexer](http://pygments.org/docs/lexers/)) of our code:

    ~~~ruby
    puts "Hello world from ruby"
    ~~~

We'll need to change our Markdown pre-processor to Redcarpet which supports fenced code blocks. We need to add:

```ruby
gem "redcarpet"
```

to our `Gemfile` and put the following into our `config.rb`:

```ruby
set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true
```

## Github highlighting color scheme

Next we'll add some CSS to match Github's color scheme: <https://github.com/richleland/pygments-css/blob/master/github.css>

We have to make one small change, `.hll` needs to be replaced with `.highlight`

```css
.hll {
  background-color: #ffffcc;
} /* WRONG */
.highlight {
  background-color: #ffffcc;
} /* RIGHT */
```

## Line numbers

The last thing we're missing are line-numbers. We'll implement this in pure CSS, using [CSS counters](https://developer.mozilla.org/en-US/docs/CSS/Counters):

```css
pre {
  counter-reset: line-numbering;
  border: solid 1px #d9d9d9;
  border-radius: 0;
  background: #fff;
  padding: 0;
  line-height: 23px;
  margin-bottom: 30px;
  white-space: pre;
  overflow-x: auto;
  word-break: inherit;
  word-wrap: inherit;
}

pre a::before {
  content: counter(line-numbering);
  counter-increment: line-numbering;
  padding-right: 1em; /* space after numbers */
  width: 25px;
  text-align: right;
  opacity: 0.7;
  display: inline-block;
  color: #aaa;
  background: #eee;
  margin-right: 16px;
  padding: 2px 10px;
  font-size: 13px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

pre a:first-of-type::before {
  padding-top: 10px;
}

pre a:last-of-type::before {
  padding-bottom: 10px;
}

pre a:only-of-type::before {
  padding: 10px;
}
```

Notice the `user-select: none;` - this ensures that when the code is selected, the line numbers won't be selected too, which makes copying and pasting a lot more convenient.

CSS counters will work fine for [~95% of users](http://caniuse.com/css-counters) - and older browsers will degrade gracefully (they just won't show any line numbers).
