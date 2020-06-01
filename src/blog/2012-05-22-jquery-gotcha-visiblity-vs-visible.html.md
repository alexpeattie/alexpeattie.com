---
title: 'jQuery gotcha: visibility vs. :visible'
---

Something I ran into today - the behaviour of jQuery's `:visible` [selector](http://api.jquery.com/visible-selector/) (and its [sister selector](http://api.jquery.com/hidden-selector/) `:hidden`) is somewhat unintuitive - at least after [version 1.3.2](http://docs.jquery.com/Release:jQuery_1.3.2#:visible.2F:hidden_Overhauled). From the jQuery docs:

> Elements with visibility: hidden or opacity: 0 are considered visible, since they still consume space in the layout.

This means, that if we have code like this:

~~~javascript
$elem.css("visibility", "hidden")

if($elem.is(":hidden")) alert("ELEM IS HIDDEN");
if($elem.is(":visible")) alert("ELEM IS VISIBLE");
~~~

We'll (incorrectly) be told "ELEM IS VISIBLE". To take `opacity` and `visibility` into account, you'll have to do something like this:

~~~javascript
if($elem.is(":hidden") || $elem.css("visibility") == "hidden" || $.elem.css("opacity") == 0) {
  alert("ELEM IS HIDDEN")
} else {
  alert("ELEM IS VISIBLE");
}
~~~