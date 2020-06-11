---
title: 'Quick tip: Loading a plain IRB session with no syntax highlighting or multiline editing in Ruby 2.7+'
image: /assets/images/meta/posts/loading-an-irb-session-with-no-syntax-highlighting-or-multiline.png
---

One of the nice additions in Ruby 2.7 is that IRB by default gets [pry](https://github.com/pry/pry)-inspired syntax highlighting and multiline editing by default.

<p>
  I've found sometimes though that this can cause IRB to run slower, especially when performing operations like pasting a large amount of data from the clipboard.
</p>

<!-- excerpt -->

<video autoplay loop muted playsinline aria-describedby='irb-highlighted-paste-alt'>
  <source src='/assets/images/posts/loading-an-irb-session-with-no-syntax-highlighting-or-multiline/irb-highlighted-paste.mp4' type='video/mp4'>
  <div id='irb-highlighted-paste-alt'>
    When pasting in a large block of JSON, IRB becomes noticeably laggy.
  </div>
</video>

Fortunately, it's easy to run an "old-fashioned" IRB session, just append the `--nocolorize` and `--nomultiline` options:

```sh
irb --nocolorize --nomultiline
```

And pasting becomes snappy once again:

<video autoplay loop muted playsinline aria-describedby='irb-plain-paste-alt'>
  <source src='/assets/images/posts/loading-an-irb-session-with-no-syntax-highlighting-or-multiline/irb-plain-paste.mp4' type='video/mp4'>
  <div id='irb-plain-paste-alt'>
    With the --nocolorize and --nomultiline, pasting in the same block of JSON is now almost instantaneous.
  </div>
</video>
