---
title: 'New projects - CSS feedback button & animate-textshadow'
---

[![animate-textshadow and Pure CSS floating feedback button](/assets/images/posts/new-projects-added/preview.png)](/projects)

It's been a while since I blogged last. Since then, lots has happened in the tech world: we had the [S3 apocalypse](https://uk.pcmag.com/news/105748/with-amazons-cloud-on-the-mend-customers-ask-why), the [PSN debacle](http://blog.eu.playstation.com/2011/04/23/update-on-playstation-network-qriocity-services/), [Microsoft bought Skype](https://web.archive.org/web/20110512044223/http://about.skype.com/press/2011/05/microsoft_to_acquire_skype.html), the world [bought LinkedIn shares](http://www.bbc.co.uk/news/business-13451057). I've been keeping myself equally busy, and I'm going to be rolling out a bunch of new coolness over the next few weeks.

<!-- excerpt -->

To kick things off, there are two new additions to the [Projects](/projects/) section. The first is one of those fancy floating feedback buttons you see everywhere - except this one's done without images (instead using clever CSS trickery). It's more of a fun proof-on-concept than something I'd necessarily recommend for production - it's probably most useful as an example of solid, cross-browser vertical text in CSS (with a bit of supplementary Javascript), which took a while to figure out.

Second, is a redux of Edwin Martin's excellent [Shadow animation plugin](http://www.bitstorm.org/jquery/shadow-animation/) providing a way to animate the `text-shadow` property; you can browse the source [on Github](https://github.com/alexpeattie/animate-textshadow). Although I was able to reuse a lot of the code from Edwin's plugin, but there were a couple of gotchas. Most notably, [the spec](http://www.w3.org/TR/1998/REC-CSS2-19980512/text.html#text-shadow-props) for text-shadow allows the color to be declared at the beginning _or_ end of the property, while in `box-shadow`'s [spec](http://www.w3.org/TR/css3-background/#the-box-shadow) only the beginning is allowable. Additionally, I wanted to allow `text-shadow` to be given in `em`, which meant the text's `font-size` had to be passed in to the parser. On the plus side, `text-shadow` is actually part of the CSS2 spec, so no [vendor prefixes](http://www.quirksmode.org/blog/archives/2010/03/css_vendor_pref.html)!
