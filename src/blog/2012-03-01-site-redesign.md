---
title: 'Site redesign'
---

My project for February was a redesign of the site. As well as overhauling the look of the site, I revamped the site's internals -- migrating the site from [Jekyll](http://jekyllrb.com/) to [Middleman](http://middlemanapp.com/).

<!-- excerpt -->

## The redesign

Below you can see a side-by-side comparison of the new site and the old:

![New site vs. old site](posts/site-redesign/before-after.png)

#### Cleaner feel

There were a few things I wanted to achieve with redesign. Foremost, I wanted a simpler, cleaner look that made better use of the available space. The new design leverages more of the screen's width, and it uses gradients and shadows sparingly (i.e. [flat design](http://www.matthewmooredesign.com/almost-flat-design/)). The smaller, circular thumbnails further reduce the screen real-estate used leaving room for the larger social icons.

#### Typography

The state of web fonts had improved greatly since I'd created the original design, which gave me the opportunity to greatly improve the site's typography. Annoyingly, no web font provider offers both of the fonts I used - [Minion Pro](https://typekit.com/fonts/minion-pro) (body text) and [Helvetica Neue](http://www.fonts.com/font/linotype/neue-helvetica?QueryFontType=Web#product_top) (headings) - meaning I had to fork out for two subscriptions to Fonts.com and Typekit respectively.

#### CSS transitions

Another thing which now has much wider browser support. Again, the site uses [CSS transitions](https://developer.mozilla.org/en-US/docs/CSS/Tutorials/Using_CSS_transitions#) sparingly - for instance on the top nav's hover effect, and on the social icons on the front page.

## Under the hood

I was very happy with the performance of the old site. As a static site generated by Jekyll and [hosted on Amazon S3](http://aws.typepad.com/aws/2011/02/host-your-static-website-on-amazon-s3.html), it always fast regardless of traffic and had effectively 0% downtime (and hosting costs were extremely cheap). I wanted to continue with a generated static site, but was looking for something a little more fully featured. Although I considered [Octopress](http://octopress.org), I settled on Middleman for a few reasons.

#### Great out-of-the-box format support

Middleman supports a [wealth of different templating languages](http://middlemanapp.com/templates/#toc_7). The new site is build with a mixture of [LESS](http://lesscss.org/), [Coffeescript](http://coffeescript.org/), [Slim](http://slim-lang.com/) and [Markdown](http://daringfireball.net/projects/markdown/).

#### Rails-style asset pipeline

Middleman provides an [asset pipeline](http://middlemanapp.com/asset-pipeline/), which makes it easy to write modular JS/CSS. Equally useful is asset preprocessing when your site is built - minifying JS/CSS, optimizing images etc.

#### Easily extensible

Jekyll does have [a plugin system](https://github.com/mojombo/jekyll/wiki/Plugins), but I always found it a pain to use. Making extensions for Middleman, on the other hand, is a cinch, and a solid collection of [user-created extensions](http://directory.middlemanapp.com/#/extensions/all) is available.