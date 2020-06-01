---
title: 'Two quick tips to speed up Rails 3 on Heroku'
---

There are lots of ways to speed up your Rails site, but here are two I see a lot of sites neglecting: gzipping and serving jQuery by CDN.

Enabling gzip on Heroku
-----------------------

Heroku's Cedar Stack by default doesn't gzip assets, which means everything is sent to the browser uncompressed. This goes against [best practices](http://developer.yahoo.com/performance/rules.html#gzip), and can slow down your load times considerably. Luckily it's a super easy fix. In your `config.ru`, just `use Rack::Deflater` before you run your application:

~~~ruby
require ::File.expand_path('../config/environment',  __FILE__)
use Rack::Deflater
run MyApp::Application
~~~

Technically, we're using `DEFLATE` rather than `GZIP` - there's a good write-up of the subtle differences [here](http://zoompf.com/2012/02/lose-the-wait-http-compression).

Loading jQuery from a CDN
-------------------------

By default Rails 3 uses jQuery, and by default it serves jQuery through your app's asset pipeline. This probably isn't ideal - loading jQuery from a content delivery network (CDN) can speed things up significantly, Dave Ward has a [great write-up](http://encosia.com/3-reasons-why-you-should-let-google-host-jquery-for-you/) of why that is. Again, it's really simple to set up, thanks to the [jquery-rails-cdn](https://github.com/kenn/jquery-rails-cdn) gem.

Full instructions are on Github, but basically you need to remove:

~~~ruby
//= require jquery
~~~

from your `application.js`, and in your layout add:

~~~ruby
= jquery_include_tag :google
~~~

I'd recommend sticking with Google's CDN, but there are other options to choose from. Pingdom has a [very thorough rundown](http://royal.pingdom.com/2012/07/24/best-cdn-for-jquery-in-2012/) of the pros/cons of the various CDNs out there.