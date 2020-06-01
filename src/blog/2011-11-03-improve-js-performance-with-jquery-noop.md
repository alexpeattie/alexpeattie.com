---
title: 'Improve JS performance with $.noop'
---

Just a simple tip that you might not be aware of - if you have an empty, anonymous function in your code like this:

~~~javascript
{ foo: function(){} }
~~~

and you're using jQuery, you can use `$.noop` ([docs](http://api.jquery.com/jQuery.noop/)) instead:

~~~javascript
{ foo: $.noop }
~~~

It's a little shorter, but are there any other advantages? There are indeed. Say you have a plugin which creates a widget, with an `onClick` callback:

~~~javascript
$.fn.myWidget.defaults = {
  onClick: function() {}
}
~~~

A new anonymous function will be created every time you instantiate a widget. If you're dealing with hundreds or thousands of instances those extraneous functions add unnecessary overhead, slowing things down. If instead we use `$.noop`:

~~~javascript
$.fn.myWidget.defaults = {
  onClick: $.noop
}
~~~

We're reusing a single empty function over and over, rather than creating a new one each time. For more info, take a look [this Stackoverflow question](http://stackoverflow.com/questions/2069345/what-real-purpose-does-noop-serve-in-jquery-1-4).