---
title: "Two awesome APIs you probably haven't heard of: SharedCount and RESTMailer"
---

I wanted to highlight a couple of APIs which I've found very useful, but haven't seemed to have gotten much exposure: SharedCount and RESTMailer. I have no connection to these services, I just think they're great!

ShareCount
----------

![Share buttons](posts/two-awesome-apis-sharedcount-restmailer/buttons.png)

Social sharing buttons (pictured above) are all the rage these days. The problem is they're generally loaded in an `<iframe>`, which means you don't have any control over their styling or behaviour. It's possible to make custom sharing buttons (as you see on this site) - but it's tricky to recreate the official buttons' dynamic share count.

The problem is that the different APIs for Facebook, Twitter, Google+ etc. all provide different methods for fetching a page's share count. [This Gist](https://gist.github.com/jonathanmoore/2640302) gives a taste of what a headache fetching the various stats can be.

This is where [SharedCount](http://sharedcount.com/) comes in handy. Just pass in the url of your page, and you get a breakdown of share counts across a bunch of services:

~~~json
"http://api.sharedcount.com/?url=http%3A%2F%2Fwww.alexpeattie.com%2Fprojects%2Fjustvector_icons%2F"
{
    "StumbleUpon": 0,
    "Reddit": 0,
    "Facebook": {
        "commentsbox_count": 0,
        "click_count": 0,
        "total_count": 177,
        "comment_count": 52,
        "like_count": 23,
        "share_count": 102
    },
    "Delicious": 245,
    "GooglePlusOne": 11,
    "Buzz": 0,
    "Twitter": 465,
    "Diggs": 0,
    "Pinterest": 0,
    "LinkedIn": 211
}
~~~

SharedCount supports JSONP and has built in caching, HTTP and HTTPS endpoints and a generous 100,000 req/day limit.

RESTMailer
----------

Adding a contact form to an otherwise static site is a common problem. Often sites will use a service like [Foxyform](http://www.foxyform.com/) or [JotForm](http://www.jotform.com/) to embed a 3rd-party contact form. Again we have the same problems as above: a lack of control over styling and behaviour.

[RESTMailer](http://restmailer.mihirgarimella.com/) offers a much better alternative. You build your own form in vanilla HTML, and style it however you want:

~~~html
<form id="contact-form" action="">
  <input type="text" placeholder="Your Name" name="name">
  <input type="text" placeholder="Your Email Address" name="email">
  <input type="text" placeholder="Subject" name="subject">
  <button type="submit">Send</button>
</form>
~~~
 
and then you can send your email with a `$.post` request to RESTMailer's API:
 
~~~javascript
$('#contact-form').on('submit', function() {
  $.ajax({
    type:'POST',
    url: 'http://restmailer-mihir.rhcloud.com/send/[USERNAME]',
    data: $('#contact-form').serialize(),
    dataType:'text',
    success: function() {
      alert('Message sent!')
    }
  });
});
~~~

RESTMailer also handily offers (optional) server-side validation.