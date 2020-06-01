---
title: 'Cross-domain communication without CORS'
---

In a recent project, I had to send data between two subdomains on a site. Unfortunately, this meant I had to deal with [browsers' same origin policy](http://en.wikipedia.org/wiki/Same_origin_policy). The canonical solution to this is to set up Cross-origin resource sharing ([CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)) , but this is a bit of a pain to do[^1] - especially if you're only making one or two cross-domain requests - and it isn't supported by some older browsers. Luckily there are some alternatives.

<!-- excerpt -->

## JSONP

[JSONP](http://en.wikipedia.org/wiki/JSONP) (JSON with padding) basically just means wrapping JSON in a function. So instead of this:

```javascript
{ foo: 3, bar: 5 }
```

You have this:

```javascript
callbackFunction({ foo: 3, bar: 5 })
```

Now all you have to do is define `callbackFunction()` and then load in your JSONP with a `<script>` tag:

```html
<script src="http://otherdomain.com/jsonp.js"></script>
<script>
  function callbackFunction(data) {
    console.log(data.foo)
    console.log(data.bar)
  }
</script>
```

This is really easy to set up in Rails, you can just `render :json` as normal, but add a `:callback` option to turn it into JSONP:

```ruby
def example
  respond_to do |format|
    format.js do
      render json: { foo: 3, bar: 5 }, callback: "callbackFunction"
    end
  end
end
```

## document.domain

This solution is even simpler, but _only_ works if you're dealing with different subdomains (not different domains). You can tell pages from `http://a.example.com` and `http://b.example.com` to trust each other by setting their `document.domain` property ([MDN](https://developer.mozilla.org/en-US/docs/DOM/document.domain)) to point to the root domain:

```javascript
// On both a.example.com and b.example.com
document.domain = 'example.com'
```

However, if we tried to change `document.domain` to `somewhereelse.com`, we'd get an `Illegal document.domain value` error.

## window.postMessage

If you have an iframe pulling content from a different domain, and you need the iframe and parent window to communicate, your best bet is `window.postMessage` ([MDN](https://developer.mozilla.org/en-US/docs/DOM/window.postMessage)). It's not compatible across all browsers, but its [quite widely supported](http://caniuse.com/x-doc-messaging).

For example your iframe could send a message to the parent window like so:

```javascript
window.parent.postMessage('hello', '*')
```

Which is handled by the parent window's `message` event handler:

```javascript
window.addEventListener(
  'message',
  function (e) {
    if (e.data == 'hello ') console.log('The iframe said hello!')
  },
  false
)
```

You'd also probably want to validate the origin the message is being sent from, by checking `e.origin`.

## Footnotes

[^1]: Alexey Vasiliev has [a good tutorial](http://leopard.in.ua/2012/07/08/using-cors-with-rails/) for setting up CORS on Rails. Additionally, this Rack middleware may be of help: <https://github.com/cyu/rack-cors>.
