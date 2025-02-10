---
title: 'Defining versions in Ruby gems'
---

This post is inspired by a [question I answered](http://stackoverflow.com/questions/7851498/defining-gem-version-in-gemspec/7852090#7852090) on StackOverflow a while back, asking about the best way to define the version of a Ruby gem.

<!-- excerpt -->

By far the simplest method is to just hardcode the version number in your `.gemspec`:

```ruby
# mygem.gemspec
Gem::Specification.new do |s|
  s.name        = "mygem"
  s.version     = "1.0.0"
end
```

But you'll often see gems instead defining the version in a separate file, then `require`'ing it in the `.gemspec`:

```ruby
# lib/mygem/version.rb
module Mygem
  VERSION = "1.0.0"
end

# mygem.gemspec
$:.push File.expand_path("../lib", __FILE__)
require "mygem/version"

Gem::Specification.new do |s|
  s.name        = "mygem"
  s.version     = Mygem::VERSION
end
```

More code for the apparently same effect, so what are the advantages of the more verbose method? Well, for one, we can easily access the gem's version easily with the `Mygem::VERSION`. This can come in handy for 3rd party apps - for instance, this Devise patch which targets specific versions ([source](https://gist.github.com/parndt/4660837)):

```ruby
# config/initializers/devise_patch.rb
require 'devise/version'
if !defined?(Devise::VERSION) || (Devise::VERSION < "1.4.0" && %w[1.2 1.3].all? {|v| !Devise::VERSION.start_with?(v)})
  raise "I don't know how to patch your devise version. See http://blog.plataformatec.com.br/2013/01/security-announcement-devise-v2-2-3-v2-1-3-v2-0-5-and-v1-5-3-released/"
end

if Devise::VERSION < "1.5.0"
  warn "Patching devise #{Devise::VERSION} with < 1.5.0 patch"
  Devise::Models::Authenticatable::ClassMethods.class_eval do
    def auth_param_requires_string_conversion?(value); true; end
  end
elsif [("1.5.0".."1.5.3"), ("2.0.0".."2.0.4"), ("2.1.0".."2.1.2"), ("2.2.0".."2.2.2")].any? { |range|
  range.include?(Devise::VERSION)
}
  warn "Patching devise #{Devise::VERSION} with < 2.2.3 patch"
  Devise::ParamFilter.class_eval do
    def param_requires_string_conversion?(_value); true; end
  end
end
```

Also if we wanted to see Git commits that changed the gem's version, we could run:

```bash
git log version.rb
```

A couple of further tips - it's not a bad idea to use `.freeze` to stop `Mygem::VERSION` getting overwritten accidentally:

```ruby
module Mygem
  VERSION = "1.0.0".freeze
end
```

Some gems (including [Rails](https://github.com/rails/rails/blob/v7.2.0/version.rb)) break down the version number into `MAJOR`, `MINOR` and `TINY` (or `PATCH`) releases:

```ruby
module Mygem
  module VERSION
    MAJOR = 1
    MINOR = 0
    TINY = 0

    STRING = [MAJOR, MINOR, TINY].compact.join('.')
  end
end
```

This is handy if you're following [semantic versioning](http://semver.org/).
