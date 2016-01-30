---
title: "Retiring two old projects – animate-textshadow.js and CSS floating feedback button"
---

Happy New Year! First of all I'd like to wish everyone reading a wonderful 2016 😁. New years are traditionally associated with new beginnings - clearing out the clutter of the previous year to start afresh. In that spirit, I'm retiring a couple of my old projects **animate-textshadow.js** and my **CSS floating feedback button** tutorial. I won't be actively maintaining them anymore, and they are effectively deprecated - i.e. I wouldn't recommend their use going forward.

*Note: both projects can still be found in the [Legacy section](/projects#legacy) of my Projects page.*

## Why?

Every year that goes by sees browsers become more powerful, as new standards are adopted more and more widely. During 2015 [CSS transitions](http://caniuse.com/#feat=css-transitions) and [2d transforms](http://caniuse.com/#feat=transforms2d) surpassed 90% support (according to caniuse.com), meaning in most cases the aforementioned projects can be replaced by a few lines of CSS -

### animate-textshadow.js

[This project](https://web.archive.org/web/20150910071737/http://alexpeattie.com/projects/animate-textshadow/) was a fun one for me to cobble together - it was the first tool (to my knowledge) that allowed tweening between different text shadow states.

However, manipulating CSS 'non-natively' (i.e. from JavaScript) is a bit hacky. For example the plugin only handles a few units (`px`, `pt` and `em`) and each unit has to be handled differently. Adding the rest of the valid unit types (`mm`, `cm`, `in`, `pc`, `vh`, `vw`, `rem`, `ex` etc.) is significant work & added bloat. The same problem is true for color formats, named colors & `hsl`/`hsla` don't work. 

Parsing the CSS is done with regular expressions, which do a much poorer job than browsers' native parsers. The plugin is much stricter about the format in which `text-shadow`s are declared than regular CSS.

In browsers that support transitions, it's a simple case of writing the before & after states, and adding a `transition: text-shadow [...]`, as demonstrated below:

<style>
.blog-TextShadowDemo {
  font-size: 2em;
  text-align: center;
  margin: 1em auto;
  text-shadow: none;
  transition: text-shadow 0.5s ease;
  cursor: pointer;
}

.blog-TextShadowDemo:hover {
  text-shadow: red 0 0 15px;
}
</style>
<p class='blog-TextShadowDemo'>Hover me</p>

~~~css
.text-shadow {
  font-size: 2em;
  text-align: center;
  margin: 1em auto;
  text-shadow: none;
  transition: text-shadow 0.5s ease;
  cursor: pointer;
}

.text-shadow:hover {
  text-shadow: red 0 0 15px;
}
~~~

~~~html
<p class='text-shadow'>Hover me<p>
~~~

Prior to retiring the project I did merge in a PR (after a shamefully long delay 🙈) to get the plugin working with new versions of jQuery.

### CSS floating feedback button

This was more a tutorial than a discrete project, specifically focusing on recreating the vertical feedback buttons that we all the rage a few years back (you still see them around a fair bit)

![Feedback button](https://s3.amazonaws.com/img.usabilitypost.com/1104/slideout1.png)
Image credit [Dmitry Fadeyev](http://usabilitypost.com/2011/04/19/pure-css-slideout-interface/)
{: .u-imageCaption }

The tutorial is not completely obsolete, but collected together [a bunch of workarounds and polyfills](https://web.archive.org/web/20150910072548/http://alexpeattie.com/projects/feedback_button/) that were needed at the time to get any semblance of cross-browser support.

Unless you *really really* care about old browsers, I'd skip the SVG and IE filters stuff, and just stick with CSS transforms:


<style>
.blog-FeedbackBtnDemo {
  text-align: center;
  position: relative;
  margin: 2em 0 4em;
}

.blog-FeedbackBtnDemo .FeedbackBtnDemo-button {
  background: #67ab4b;
  transform: rotate(-90deg);
  border: none;
  color: #fff;
  text-transform: uppercase;
  font-size: 80%;
  outline: none;
  padding: 0.3em 1em;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>
<p class='blog-FeedbackBtnDemo'>
  <button class='FeedbackBtnDemo-button'>Feedback</button>
</p>

~~~css
button.feedback {
  background: #67ab4b;
  transform: rotate(-90deg);
  border: none;
  color: #fff;
  outline: none;
  text-transform: uppercase;
  padding: 0.3em 1em;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
~~~

~~~html
<button class='feedback'>Feedback</button>
~~~

### Closing thoughts

It's a little sad to retire these, but 5 years is a long time - old code needs to be 'killed' eventually, even if it's still providing value to a few folks.

Oh, I should point out that the 90% figures I quoted at the top of the article are including prefixes - my example code deliberately omitted prefixes. I'd really recommend something like [autoprefixer](https://github.com/postcss/autoprefixer) to take care of prefixes for you.

How do you deal with gracefully retiring old projects? Let me know in the comments if you have any thoughts.