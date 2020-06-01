---
title: 'Handling strong parameters in Devise 3.1+'
---

In Devise 3.1+ there's a new way to handle Rails 4's strong parameters. Here's a quick rundown of the change, and how to migrate to the new style. (Background: I wrote [the pull request](https://github.com/plataformatec/devise/pull/2566) that helped form this feature).

*TLDR; You can now shovel params (as symbols) into `devise_parameter_sanitizer.for`*

## The old way

First a bit of background. Rails 4 introduced the concept of [strong parameters](http://edgeapi.rubyonrails.org/classes/ActionController/StrongParameters.html), to mitigate [mass assignment vulnerabilities](http://pragtob.wordpress.com/2012/03/06/secure-your-rails-apps/). With strong parameters, we whitelist the model attributes that should be writeable in *the controller*.

~~~ruby
# app/controllers/articles_controller.rb

def create
  # only title and body are whitelisted
  Article.create params[:article].permit(:title, :body)
end
~~~

This is problematic in Devise, because by default we don't see the controllers & actions that Devise uses to handle creating and updating our `User` model.

Instead Devise gives us an interface to modify the whitelisted parameters that is uses internally: `devise_parameter_sanitizer`. 

Devise has three 'parameter sanitizers': for signing up, signing in and updating your account. Previous to 3.1 `devise_parameter_sanitizer`  took an argument specifying which sanitizer needs to be modified -- either `:sign_in`, `:sign_up` or `:sign_out` -- and a block which passes in the un-whitelisted parameters. We can then call `.permit` on those parameters as normal:

~~~ruby
# app/controllers/application_controller.rb

class ApplicationController < ActionController::Base
  before_filter :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_in) { |u| u.permit(:username, :password) }
  end
end
~~~

#### The problem

The main problem with this approach, is that by providing a block, we overrwrote Devise's default whitelistings. For example, if we wanted to add a `username` attribute to the permitted parameters, but keep all the Devise defaults, we'd need code like this:

~~~ruby
def configure_permitted_parameters
  devise_parameter_sanitizer.for(:sign_in) { |u| u.permit(:username, :password, :remember_me) }
  devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:username, :email, :password, :password_confirmation) }
  devise_parameter_sanitizer.for(:account_update) { |u| u.permit( :username, :email, :password, :password_confirmation, :current_password) }
end
~~~

..which is pretty verbose for adding a single attribute. Most of this is boilerplate code, to ensure that Devise's default whitelist is still applied.

## The new way

From Devise 3.1+ we can call `devise_parameter_sanitizer.for` without a block which will return an array of permitted parameters. We can shovel attributes into this array to whitelist them. So the code above would look like this after 3.1:

~~~ruby
def configure_permitted_parameters
  devise_parameter_sanitizer.for(:sign_in) << :username
  devise_parameter_sanitizer.for(:sign_up) << :username
  devise_parameter_sanitizer.for(:account_update) << :username
end
~~~

or a DRYer version:

~~~ruby
[:sign_in, :sign_up, :account_update].each do |action|
  devise_parameter_sanitizer.for(action) << :username
end
~~~

You can still pass a block to completely override the Devise defaults if you want.

#### Backwards incompatability

The upgrade introduces a small backwards incompatability, although it's fairly unlikely it'll affect your app. Previous to 3.1, if you wanted to explicitly apply a sanitizer and return the filtered parameters, you could call `devise_parameter_sanitizer.for` without a block. Now sanitizers must be explicitly applied by calling `devise_parameter_sanitizer.sanitize`.

*If you anywhere in your pre-3.1 app you're calling `devise_parameter_sanitizer.for` **without** a block, you'll need to use `devise_parameter_sanitizer.sanitize` instead.*