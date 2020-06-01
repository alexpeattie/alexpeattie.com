---
title: "Quick tip: Set the default controllerAs to <code>vm</code> for <code>.component()</code>   in Angular 1.5+"
meta: '<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@alexpeattie" />
<meta name="twitter:title" content="Quick tip: Set the default controllerAs to vm for .component() in Angular 1.5+" />
<meta name="twitter:description" content="One of the most exciting features in the newly released Angular 1.5 is the new .component() helper method..." />
<meta name="twitter:image" content="https://alexpeattie.com/assets/images/posts/setting-the-default-controlleras-to-vm-for-component-angular-1-5/angular.png" />'
---

One of the most exciting features in the newly released Angular 1.5 is the new `.component()` helper method (see Todd Motto's [excellent, detailed write-up](https://toddmotto.com/exploring-the-angular-1-5-component-method) for a full walkthrough). It's now [considered best practice](https://github.com/johnpapa/angular-styleguide#style-y030) to use `controllerAs` - a best practice which `.component()` enofrces. If you don't provide a value for `controllerAs` it will default to `$ctrl`.

Why `$ctrl`? You can see the original (well-reasoned) discussion [on Github](https://github.com/angular/angular.js/issues/13664). However, [John Papa recommends](https://github.com/johnpapa/angular-styleguide#style-y032) using `vm` (short for view-model) and if you're like me, you'll find yourself doing this a lot:

~~~js
.component('myCoolComponent', {
  controllerAs: 'vm',
  bindings: { ... }
})
~~~

Luckily it's quite easy to override the `.component()` helper in your application, to default to something other than `$ctrl`. You'll want to do this at the point you're defining your application's module:

~~~js
angular.module('myApp', ['ngAnimate', 'ngTouch']);
~~~

Becomes:

~~~js
var app = angular.module('myApp', ['ngAnimate', 'ngTouch']);

var _component = app.component;
app.component = function (name, options) {
  return _component(name, angular.extend({ controllerAs: 'vm' }, options));
};
~~~

Pretty straightforward - we save the original `.component()` helper method to a variable, then replace it with a modified method that call the original, but firsts calls [`angular.extend`](https://docs.angularjs.org/api/ng/function/angular.extend) on our `options` object to set our preferred `controllerAs` default.

This modified method will only apply to any components defined for our app's module - any 3rd party plugins shouldn't be affected. You can see a Plunkr demonstrating this [here](https://plnkr.co/edit/nPjov0d4ktjKuoL8bvxJ?p=preview).

If you found this helpful, or if you have a neater way to do this, let me know in the comments 😊.