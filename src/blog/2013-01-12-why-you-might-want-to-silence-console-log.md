---
title: 'Why you might want to silence console.log'
---

`console.log` might be the most useful debugging tool in a front-end coder's arsenal. If you aren't using it, go read [Mastering Console Logging](http://archive.fo/DVhyA/) to see why its so awesome.

<!-- excerpt -->

But `console.log` statements can potentially break things - IE8 and below will throw a JS error (unless the Developer Console is active), which effectively halting the execution of your Javascript. One solution[^1] to this is to create an empty `console.log` function if it doesn't exist:

```javascript
// Stop console.log causing failures in IE
if (typeof console === 'undefined' || typeof console.log === 'undefined') {
  console = {}
  console.log = function () {}
}
```

The console should really just be used for development purposes - but if you don't want to meticulously remove every `console.log` statement from your production site, you can use the same trick:

```js
// In a .js.erb file in Rails
<% if Rails.env.production? %>
  console = {};
  console.log = function() {};
<% end %>
```

[^1]: Another good solution is Paul Irish's [log() wrapper](http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/).
