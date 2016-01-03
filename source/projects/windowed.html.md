---
title: windowed.js
scripts:
  - projects/windowed/jquery.windowed.min
  - projects/windowed/demo
---

# windowed.js

[Download (.zip)](https://github.com/alexpeattie/windowed/archive/master.zip){: .Btn .Btn--large .Btn--cta }
[Source](https://github.com/alexpeattie/windowed){: .Btn .Btn--large .Btn--source }
{: .u-centerText }
{: role='menu' }

**windowed.js** is a [jQuery][] plugin that implements Chris Norström's awesome ["Windowed Slider" concept][]. It takes your regular checkboxes or `<select>` lists and transforms them into slick 'windowed sliders'.

![Concept by Chris Norström](projects/windowed/concept.png)

When an option is selected with the slider, the value of the original checkbox or `<select>` is updated too, so it should work seamlessly with existing forms.

I've tested the plugin on recent versions of Firefox, Chrome and Safari (mobile & desktop) - theoretically it should work fine in IE7+ and Opera, but these are untested. Requires jQuery 1.7+.

windowed.js is freely distributable under the terms of the [MIT license][].

[jQuery]: http://jquery.com/
["Windowed Slider" concept]: http://www.chrisnorstrom.com/2012/11/invention-multiple-choice-windowed-slider-ui/
[MIT license]: https://github.com/alexpeattie/windowed/blob/master/LICENSE.md

## Contents

- [Usage & demos](#usage--demos)
  - [Checkbox](#checkbox)
  - [Select box](#select-box)
  - [Vertical](#vertical)
  - [Custom text, width and height](#custom-text-width-and-height)
  - [Callback](#callback)
  - [Themes](#themes)
  - [Disabled](#disabled)
  - [Animation](#animation)
  - [Change state](#change-state)
  - [Tinted window](#tinted-window)
  - [Custom themes](#custom-themes)
- [Options](#options)
  - [Overriding defaults](#overriding-defaults)
- [Methods](#methods)
  - [setEnabled](#setenabled)
  - [toggleEnabled](#toggleenabled)
  - [setState](#setstate)
  - [toggleState](#togglestate)
  - [selectOption](#selectoption)
- [Todo and contributing](#todo-and-contributing)
{: .TableOfContents }

## Usage & demos

For all the examples below, you'll first need to add the `windowed.min.css` and `jquery.windowed.min.js` files to your HTML page:

~~~html
<head>
  <link rel="stylesheet" href="path/to/windowed.min.css">
</head>
<body>
  <!-- blah blah -->
  <script src='jquery.js'></script>
  <script src='/path/to/jquery.windowed.min.js'></script>
</body>
~~~

Note: I've simplified the HTML in the examples for brevity's sake. For instance, when using this in real life, make sure your `<input>`/`<select>` elements have a `name` attribute.

### Checkbox

<input class="basic" type="checkbox" />

To get started, just call `.windowed()` on a checkbox or dropdown.

*HTML*:

~~~html
<input type='checkbox'>
~~~

*JavaScript*:

~~~javascript
$("input:checkbox").windowed();
~~~

### Select box

<select class="basic"><option>WE</option><option>HAVE</option><option>CHOICES!</option></select>

*HTML*:

~~~html
<select>
  <option>WE</option>
  <option>HAVE</option>
  <option>CHOICES!</option>
</select>
~~~
*JavaScript*:

~~~javascript
$("select").windowed();
~~~

### Vertical

<select class="vertical"><option>If you need more room for choices</option><option selected="selected">Feel free to go with the vertical orientation</option><option>It's not as elegant as using a radio button</option><option>But it's an option</option></select>

You can make a vertical select using by setting the `vertical` option to `true`.

*HTML*:

~~~html
<select>
  <option>If you need more room for choices</option>
  <option selected='selected'>Feel free to go with the vertical orientation</option>
  <option>It's not as elegant as using a radio button</option>
  <option>But it's an option</option>

~~~

*JavaScript*:

~~~javascript
$("select").windowed({
  vertical: true
});
~~~

### Custom text, width and height

<input class="custom" type="checkbox">

Customize the label text on a checkbox with the `on` and `off` options.

*JavaScript*:

~~~javascript
$("input:checkbox").windowed({
  on: "ENABLED",
  off: "DISABLED"
});
~~~

You can use CSS to set the component's width and height. Alternatively, you can pass a 
`width` or `height` option to the JS function.

*CSS*:

~~~css
.window-toggle {
  width: 200px;
  height: 50px;
}
~~~

### Callback

<input class="callback" type="checkbox">

<select class="callback"><option>ONE</option><option>TWO</option><option>THREE</option></select>

Set a callback (fires on change) using the `change` option.

The callback function will be passed:

  - the jQuery [event object][] for the callback
  - either:
    - For a checkbox, a boolean value indicating if the component's checked (`true`) or unchecked (`false`).
    - For a `<select>` dropdown, the currently selected `<option>` element.
    
[event object]: http://api.jquery.com/category/events/event-object/
    
Note: if the DOM element has an `onchange` event, that *will* still be fired - although using a windowed.js `change` callback is preferable.

*JavaScript*:

~~~javascript
$("input:checkbox").windowed({
  change: function(event, checked) {
    alert( "The checkbox is now " + (checked ? "checked" : "unchecked") );
    console.log( $(this) );
  }
});

$("select").windowed({
  change: function(event, selected) {
    alert( 
      "You selected item #" + ($(selected).index() + 1) + 
      " - " + $(selected).text()
    );
  }
});
~~~

### Themes

<input class="info" type="checkbox">

<input checked="checked" class="success" type="checkbox">

<input class="warning" type="checkbox">

<input checked="checked" class="danger" type="checkbox">

The `theme` option can change the style of the component, by adding classes to the component's container `<div>`.
Included by default are 4 themes: `info`, `success`, `warning` and `danger`.

`theme` can be a string, or if set to `true`, windowed.js will use the CSS classes already present on the checkbox/dropdown.

For info on creating a custom theme, see [custom themes](#custom-themes) below.

*HTML*:

~~~html
<input id="themeDemo" type="checkbox">

<input class="success" type="checkbox" checked="checked">
<input class="warning" type="checkbox">
<input class="danger" type="checkbox" checked="checked">
~~~

*JavaScript*:

~~~javascript
$("#themeDemo").windowed({
  theme: "info"
})

$("input:checkbox:not(#themeDemo)").windowed({
  theme: true
});
~~~

### Disabled

<input id="demoDisable" type="checkbox">

[Enable](#){: .windowed-enable } · [Disable](#){: .windowed-disable } · [Toggle](#){: .windowed-toggle }

<select disabled="disabled"><option>Hello</option><option>World</option></select>

Set `disabled` to `true` to make a disabled component. The component will also inherit the disabled state (if present)
on the existing `<input>` or `<select>`.

You can also change the enabled/disabled state by calling `windowed('disable')`, `windowed('enable')`, `windowed('toggleEnabled')`.

*HTML*:

~~~html
<input id="demoDisable" type="checkbox">

<button class="btn enable">Enable</button>
<button class="btn disable">Disable</button>
<button class="btn toggle">Toggle enabled</button>

<select disabled="disabled">
  <option>Hello</option>
  <option>World</option>
</select>
~~~

*JavaScript*:

~~~javascript
$("#demoDisable").windowed({
  disabled: true
});

$("select").windowed();

$(".btn.enable").click(function(){
  $("#demoDisable").windowed('setEnabled', true);
});

$(".btn.disable").click(function(){
  $("#demoDisable").windowed('setEnabled', false);
});

$(".btn.toggle").click(function(){
  $("#demoDisable").windowed('toggleEnabled');
});
~~~

### Animation

<input type='checkbox' class='no-animate'><br>
<select class='slow-animate'><option>TAKE</option><option>IT</option><option>SLOW</option></select>

Set `animate` to `false` to disable animation.

You can change the speed of animation (in milliseconds), using the `animateDuration` option.

*HTML*:

~~~html
<input type="checkbox">

<select>
  <option>TAKE</option>
  <option>IT</option>
  <option>SLOW</option>
</select>
~~~

*JavaScript*:

~~~javascript
$("input:checkbox").windowed({
  animate: false
});

$("select").windowed({
  animateDuration: 1000
});
~~~

### Change state

<input class='changestate' type="checkbox">

[On](#){: .windowed-on } · [Off](#){: .windowed-off } · [Toggle](#){: .windowed-toggle-onoff }

<select class='changestate-select'>
  <option>ONE</option>
  <option>TWO</option>
  <option>THREE</option>
</select>

[1](#){: .windowed-num } · [2](#){: .windowed-num } · [3](#){: .windowed-num }

You can change a checkbox's state using `.windowed('setState', s)` where `s` can be `true` (checked) or `false` (unchecked);
or using `.windowed('toggleState')`.

For dropdowns, use `windowed('selectOption', n)` where `n` is the (0-based) index of the option you want selected.

*HTML*:

~~~html
<input type="checkbox">

<button class="btn on">On</button>
<button class="btn off">Off</button>
<button class="btn toggle">Toggle</button>

<select>
  <option>ONE</option>
  <option>TWO</option>
  <option>THREE</option>
</select>

<button class="btn num">1</button>
<button class="btn num">2</button>
<button class="btn num">3</button>
~~~

*JavaScript*:

~~~javascript
$("input:checkbox, select").windowed();

$(".btn.on").click(function(){
  $("input:checkbox").windowed('setState', true);
});

$(".btn.off").click(function(){
  $("input:checkbox").windowed('setState', false);
});

$(".btn.toggle").click(function(){
  $("input:checkbox").windowed('toggleState');
});

$(".btn.num").click(function(){
  // We have to -1 because the index is 0 based
  // i.e. the first option's index is 0, 2nd is 1 etc.
  $("select").windowed('selectOption', $(this).text() - 1);
});
~~~

### Tinted window

<div class='tinted'><input class='basic tinted' type='checkbox'></div>

You can tint the window in CSS, using an [RGBa][] `background` property - in [browsers that support it](http://caniuse.com/#feat=css3-colors).

*CSS*:

~~~css
.windowed .slider {
  background: rgba(0, 0, 0, 0.1);
}
~~~

[RGBa]: https://developer.mozilla.org/en-US/docs/CSS/color_value#rgba%28%29_

### Custom themes

<input class='customtheme' type='checkbox'>

<select class='customtheme'>
  <option>BLACK</option>
  <option>IS</option>
  <option>BEAUTIFUL</option>
</select>

You can use CSS to style the windowed.js component. Some useful classes:

- `.windowed` - The component's container `<div>`, this is where your custom theme class will be applied
- `.slider` - The sliding window
- `.checkstate` - The on/off label text for a checkbox
- `.option` - A dropdown option
- `.selected` - The currently selected `.option` or `.checkstate`
- `.checkbox` - Applied to components created from an `<input type='checkbox'>`
- `.select-one` - Applied to components created from a `<select>`

*HTML*:

~~~html
<input type="checkbox">

<select>
  <option>BLACK</option>
  <option>IS</option>
  <option>BEAUTIFUL</option>
</select>
~~~

*JavaScript*:

~~~javascript
$("input:checkbox, select").windowed({theme: "custom"});
~~~

*CSS*:

~~~css
.windowed.custom {
  background-image: -moz-linear-gradient(center bottom, #000, #333)
}

.windowed.custom .slider {
  border-color: #6c3;
  box-shadow: 0 1px 1px 1px #363 inset, 0 0 0 2px #363;
}

.windowed.custom .checkstate, .windowed.custom .option {
  color: #ddd;
  text-shadow: 1px 1px #000;
}

.windowed.custom .selected {
  color: #bfa;
}
~~~

## Options

{::comment}

Markdown source for options table, Markdown won't let us do rowspan though :(

Option|Type|Default
|------------------|
`animate`|boolean|true
Enables jQuery animation on the slider window.||
`animateDuration`|integer/string|400
Sets the duration of the animation (if enabled). As with jQuery's `.animate()` [method](http://api.jquery.com/animate/), this can be a number, indicating the animation duration in milliseconds, or a predefined string (e.g. `'fast'`, `'slow'`).||
`disabled`|boolean|false
Controls the disabled state of the component. Note: if the component is disabled, the original DOM element will be disabled too.||
`height`|integer|undefined
Sets the height of the component. Note: it's recommended that you instead use CSS to set this, if possible.||
`on`|string|"ON"
Sets the label for the checked state of a checkbox-based component.||
`off`|string|"OFF"
Sets the label for the unchecked state of a checkbox-based component.||
`theme`|string/boolean|undefined
Allows theming of the component. If a string, the string will be appended to the component's container `<div>`'s class attribute. If set to to `true`, the container `<div>` will inherit the classes from the original DOM element.||
`vertical`|boolean|false
Enables vertical mode. Can only be applied if the component was created from a `<select>`.||
`width`|integer|undefined
Sets the width of the component. See also: *height*.||

{:/comment}

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>animate</code></td>
      <td>boolean</td>
      <td>true</td>
    </tr>
    <tr>
      <td colspan="3">Enables jQuery animation on the slider window.</td>
    </tr>
    <tr>
      <td><code>animateDuration</code></td>
      <td>integer/string</td>
      <td>400</td>
    </tr>
    <tr>
      <td colspan="3">Sets the duration of the animation (if enabled). As with jQuery's <code>.animate()</code> <a href="http://api.jquery.com/animate/">method</a>, this can be a number, indicating the animation duration in milliseconds, or a predefined string (e.g. <code>'fast'</code>, <code>'slow'</code>).</td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>boolean</td>
      <td>false</td>
    </tr>
    <tr>
      <td colspan="3">Controls the disabled state of the component. Note: if the component is disabled, the original DOM element will be disabled too.</td>
    </tr>
    <tr>
      <td><code>height</code></td>
      <td>integer</td>
      <td>undefined</td>
    </tr>
    <tr>
      <td colspan="3" colspan="3">Sets the height of the component. Note: it's recommended that you instead use CSS to set this, if possible.</td>
    </tr>
    <tr>
      <td><code>on</code></td>
      <td>string</td>
      <td>"ON"</td>
    </tr>
    <tr>
      <td colspan="3">Sets the label for the checked state of a checkbox-based component.</td>
    </tr>
    <tr>
      <td><code>off</code></td>
      <td>string</td>
      <td>"OFF"</td>
    </tr>
    <tr>
      <td colspan="3">Sets the label for the unchecked state of a checkbox-based component.</td>
    </tr>
    <tr>
      <td><code>theme</code></td>
      <td>string/boolean</td>
      <td>undefined</td>
    </tr>
    <tr>
      <td colspan="3">Allows theming of the component. If a string, the string will be appended to the component's container <code>&lt;div&gt;</code>'s class attribute. If set to to <code>true</code>, the container <code>&lt;div&gt;</code> will inherit the classes from the original DOM element.</td>
    </tr>
    <tr>
      <td><code>vertical</code></td>
      <td>boolean</td>
      <td>false</td>
    </tr>
    <tr>
      <td colspan="3">Enables vertical mode. Can only be applied if the component was created from a <code>&lt;select&gt;</code>.</td>
    </tr>
    <tr>
      <td><code>width</code></td>
      <td>integer</td>
      <td>undefined</td>
    </tr>
    <tr>
      <td colspan="3">Sets the width of the component. See also: <em>height</em>.</td>
    </tr>
  </tbody>
</table>

### Overriding defaults

You can change the global defaults by modifying the `$.fn.windowed.defaults` object.

## Methods

windowed.js includes a few utility methods. The methods follow the jQuery UI pattern:

~~~javascript
$('select').windowed('methodName', [optionalParameters]);
~~~

### `setEnabled`

~~~javascript
$('select').windowed('setEnabled', enabled)
~~~

Enables/disables the component. enabled is a boolean, where `true` enables the component, and `false` disables it. The method returns this boolean value.

### `toggleEnabled`

~~~javascript
$('select').windowed('toggleEnabled')
~~~

Toggles the component's enabled/disabled state. Returns a boolean value indicating the component's new state, where `true == enabled`.

### `setState`

~~~javascript
$('input:checkbox').windowed('setState', state)
~~~

Checks/unchecks a checkbox component. state is a boolean, where `true` checks the component, and `false` unchecks it. The method returns this boolean value.

### `toggleState`

~~~javascript
$('input:checkbox').windowed('toggleState')
~~~
Toggles a checkbox component's checked/unchecked state. Returns a boolean value indicating the component's new state, where `true == checked`.

### `selectOption`

~~~javascript
$('select').windowed('selectOption', optionIndex)
~~~

Selects an option on a `<select>`-based component. `optionIndex` is an integer, representing the 0-based index of the option to be selected. The selected `.option` is returned.

## Todo and contributing

- Add ability to swap the checkbox labels (i.e. have OFF on the left, rather than the right).
- Responsive (variable width) components.
- Add tabbing support/keyboard navigation.

If you want to have a stab at any of the todo items above - or anything else - [pull requests](https://github.com/alexpeattie/windowed/pulls) are gratefully received.

For any bug reports or feature ideas, head over to [Github's issue tracker](https://github.com/alexpeattie/windowed/issues).