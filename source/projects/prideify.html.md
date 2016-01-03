---
title: prideify.js
scripts:
  - projects/prideify/prideify
  - projects/prideify/demo
---

# ![prideify.js](projects/prideify/logo.png)

[Source](https://github.com/alexpeattie/prideify){: .Btn .Btn--large .Btn--source }
{: .u-centerText }
{: role='menu' }

Inspired by [facebook.com/celebratepride](https://facebook.com/celebratepride) - a super-lightweight library (< 100 lines of code) to “prideify” any image using the `<canvas>` element. Licensed under [MIT](https://github.com/alexpeattie/prideify/blob/master/LICENSE).

And to boot, there are no external dependencies, although it does integrate with jQuery when it's present 😊.

![5 example images of prideify.js in action](projects/prideify/header.png)



## Demo

<section class='prideify-Dropzone' data-prideify-dropzone>
  <img src='/assets/images/projects/prideify/placeholder.svg'>
  <p>Drag and drop an image here.</p>
</section>

<p class='u-centerText'>
  <input type="url" class="prideify-UrlEntry" placeholder="Or enter an image's URL here..." data-prideify-url-fetch>
</p>

## Usage

### Quickstart

~~~html
<img src='/dave.jpg' class='profile-pic'>
<img src='/jenny.jpg' class='profile-pic'>

<script src='prideify.js'></script>
<script>
  Prideify('.profile-pic');
</script>
~~~

#### With jQuery

~~~html
<img src='/dave.jpg' class='profile-pic'>
<img src='/jenny.jpg' class='profile-pic'>

<script src='jquery.js'></script>
<script src='prideify.js'></script>
<script>
  $('.profile-pic').prideify();
</script>
~~~

### More examples

If you call `Prideify` without any arguments, any image with the `data-prideify` attribute set will be processed:

~~~html
<img src='/jenny.jpg' data-pridefied>
<script>
  Prideify();
</script>
~~~

If you are trying to call `Prideify` with an image **not hosted on your server**, you'll probably need to set the `crossOriginProxy` option to `true`, to avoid browser restrictions regarding the canvas element (see more under [Configuration options](#)):

~~~html
<img src='http://example.com/jenny.jpg'>
<script>
  Prideify('img', { crossOriginProxy: true });
</script>
~~~

By default Prideify will add a CSS class `'prideify'` after the image is rendered. You can use a different CSS class by setting the `renderedClass` option:

~~~javascript
Prideify('img', { renderedClass: 'some-custom-class' });
~~~

If you want something to happen after the image has been rendered, you can use the `afterRender` option. The newly rendered image will be passed into the callback function:

~~~html
<img src='http://example.com/jenny.jpg' id='jenny'>
<script>
  Prideify('#jenny', { afterRender: function(image) {
    console.log("Image rendered")
  } });
</script>
~~~

The first argument passed to `Prideify` can be a selector, image element, array of elements or jQuery collection:

~~~javascript
Prideify('img.profile-pic');
Prideify($('img.profile-pic'));
Prideify(document.getElementById('jenny'));
~~~

### Arguments

~~~javascript
Pridefy(target, [options]);
~~~

- **target** (optional)
- Default: `'[date-prideify]'`
- Type: `DOMElement`, array of `DOMElement`s, jQuery collection or CSS selector
{: .ArgumentSpec }

The image or collection of images you want to prideify. Alternatively you can pass a selector, in which case anything matching the selector will be prideified.

If left blank, all images with `data-prideify` attributes (e.g. it defaults to the CSS selector `'[data-prideify]'`).

- **options** (optional)
- Default: `{}`
- Type: Object
{: .ArgumentSpec }

Additional configuration options - see below.

### Configuration options

- **renderedClass**
- Default: `'prideified'`
- Type: String
{: .ArgumentSpec }

A class that will be added the the `<img>` element after the image has been rendered successfully.

- **crossOriginProxy**
- Default: `false`
- Type: Boolean or string
{: .ArgumentSpec }

Due to browser restrictions, you won't be able to use prideify normally with most image that are not hosted on your domain (unless the image host has been kind enough to set `Access-Control-Allow-Origin` to `*`). You can learn more about cross-origin security and the `<canvas>` in [this MDN article](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image).

Setting crossOriginProxy to true will load the image via <http://crossorigin.me>, thereby avoid cross-origin restrictions. If you want to use a different proxy, you can pass its URL as a string.

- **customStripes**
- Default: `undefined`
- Type: Array of arrays
{: .ArgumentSpec }

If you don't want to use the default colors, or want extra or fewer stripes, you can set use a `customStripes` array. This is a nested array of arrays, each containing the RGB values of each stripe:

~~~javascript
Prideify('.profile-pic', { 
  customStripes: [[0, 0, 0], [255, 255, 255]] 
});
~~~

The above would overlay two stripes - a black one, and a white one - admittedly not very exciting!

- **afterRender**
- Default: undefined
- Type: Function
{: .ArgumentSpec }

A callback function that will run after the image has been rendered. The new image will be passed as the sole argument to the callback function.

## Download

[Download (.zip)](https://github.com/alexpeattie/prideify/archive/master.zip){: .Btn .Btn--large .Btn--cta }
{: .u-centerText }

## Todo

Better error handling 😇, bookmarklet, Bower support.

## Credits

Thanks to Facebook and the LGBT community for the inspiration and to [technoboy10](https://github.com/technoboy10) for the awesome CORS proxy.

Sent into the world with the blessing of [Peg](https://peg.co)!

# ![Rainbow peg](projects/prideify/peg.png){: .prideify-Peg }