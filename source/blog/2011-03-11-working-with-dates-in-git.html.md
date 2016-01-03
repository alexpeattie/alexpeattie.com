---
title: Working with dates in Git
---

When working in [git](http://git-scm.com/), you most commonly trace a repository's history using commits' SHA-1 hashes. To revert to a previous commit, you might write something like this:

~~~console
$ git revert 883c3dc85a49d98da649
~~~
    
The problem is, we tend not to think in hashes. Rather, we wonder what changes we made *yesterday*, or remember that a now-broken piece of code worked perfectly *a week ago*. Although we can use `git log` to track down the commit we want, there has to be an easier way. Luckily git understands our human quirks, and offers us just that.

Understanding dates in Git: author date vs. committer date & 'approxidate'
--------------------------------------------------------------------------

There are two kinds of timestamp in git: a `GIT_AUTHOR_DATE` and a `GIT_COMMITTER_DATE`. Although in most cases they both store the same value, they serve slightly different purposes. As the [Pro Git Book](http://progit.org/book/ch2-3.html) explains:

> The author is the person who originally wrote the work, whereas the committer is the person who last applied the work.

So if, for instance, you send in a patch to a project, the author date will be when you made the original commit but the committer date will be when the patch was applied. Another common scenario is rebasing: rebasing will alter the commit date, but not the author date.

This distinction is worth mentioning because of an inconsistency in git that [Carl Worth points out](http://web.archive.org/web/20130508191420/http://cworth.org/hgbook-git/tour/):

> By default, `git log` displays author dates as "Date" but then uses commit dates when given a `--since` option. That seems like broken defaults to me.

In other words, all the methods listed below rely on the committer date, even though you're used to seeing the author date. As mentioned, most of the time they'll be the same, but to see committer dates in the log just use:

~~~console
$ git log --format=fuller
~~~
    
#### Date parsing with 'approxidate'

Git employs a kind of date parsing which will be familiar to any rubyists who've used [Chronic](http://chronic.rubyforge.org/). The parser, called 'approxidate' is very flexible, and allows both fixed dates in any format you can dream up ("10-11-1998", "Fri Jun 4 15:46:55 2010 +0200", "9/9/83") and relative dates ("today", "1 month 2 days ago", "six minutes ago"). You can include days of the week ("last Tuesday"), timezones ("3PM GMT") and 'named' times ("noon", "tea time").

Approxidate isn't really documented anywhere, but the [code for the parser](https://github.com/git/git/blob/master/date.c) is very readable, so check it out to get an idea of the kind of formats git will accept.

log, whatchanged, --since and --until
-------------------------------------

OK, so how about if we want to look at all the commits made since yesterday? All we need is the `--since` option:

~~~console
$ git log --since="yesterday"
~~~

We can also use `--until` to fetch all commits up to a certain date; or of course we can use both options in tandem:

~~~console
$ git log --since="1 week ago" --until="yesterday"
~~~

`--since` and `--until` can also be used with `whatchanged`.

~~~console
$ git whatchanged --since="1/1/2010"
~~~

Worth noting: instead of `--until` and `--since` you can use `--before` and `--after`, if that's more your style.

revert, diff and the @ construct
--------------------------------

Not all git commands have options like `--since` and `--until`. So what if we wanted to revert back to our repo as it was a month ago? Luckily git provides us with a more generic way to reference commits using dates, with the @ construct:

~~~console
$ git revert master@{"1 month ago"}
~~~

(where master is the name of the branch you're working on).

This lets us do clever things, like:

~~~console
$ git diff master@{"yesterday"} master@{"1 year 6 months ago"}
~~~

which will compare the repo as it was yesterday, and as it was 1 year, 6 months ago.
    
Change history: amending and editing dates
------------------------------------------

There might be certain situations where you want to alter the timestamps git assigns to commits. There are a couple of ways that you can do this.

#### Use `--date`

The `--date` option allows you to specify the author date that git attaches to the commit. Here we can't use approxidate unfortunately, only fixed dates will work (YYYY.MM.DD, MM/DD/YYYY, DD.MM.YYYY, [RFC 2822](http://www.apps.ietf.org/rfc/rfc2822.html#sec-3.3) and [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) are all valid).

~~~console
$ git commit --date="Wed Feb 16 14:00 2037 +0100"
~~~

We can also use `amend` to change the timestamp of a previous commit:

~~~console
$ git commit --amend --date="Wed Feb 16 14:00 2037 +0100"
~~~

Unfortunately `--date` will only change the `GIT_AUTHOR_DATE`, not `GIT_COMMITTER_DATE`. If this is a problem, you may need to...

#### Manually set `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE`

A word of warning - overriding `GIT_COMMITER_DATE` is somewhat [frowned upon](http://www.tin.org/bin/man.cgi?section=1&topic=CG-COMMIT):

> It should be never overridden, unless you know you absolutely need to override it (to ensure the commit gets the same ID as another or when migrating history around)

~~~console
$ export GIT_AUTHOR_DATE="Wed Feb 16 14:00 2037 +0100"
$ export GIT_COMMITTER_DATE="Wed Feb 16 14:00 2037 +0100"
$ git commit
~~~
    
The code above will alter both timestamps. Amending a commit in the past is more tricky, but the [GitFAQ](https://git.wiki.kernel.org/index.php/GitFaq#How_can_I_tweak_the_date_of_a_commit_in_the_repo.3F
) provides us with a handy bash script:

~~~bash
#!/bin/sh
#
# Rewrite all branches to modify the date of one specific commit in a repo.
#
# Sample date format: Fri Jan 2 21:38:53 2009 -0800
# ISO8601 and RFC822 dates will also work.
#
# Note: filter-branch is picky about the commit argument. As of 1.7.0.4,
# a hex ID will work, the symbolic revision HEAD will fail silently,
# and the usability of more exotic rev specs was not tested by the author.
#
# Copyright (c) Eric S. Raymond, 2010-08-01. BSD terms apply (if anybody really thinks that this
# script is long and non-obvious enough to fall under copyright law).
#
commit="$1"
date="$2"
git filter-branch --env-filter \
    "if test \$GIT_COMMIT = '$commit'
     then
         export GIT_AUTHOR_DATE
         export GIT_COMMITTER_DATE
         GIT_AUTHOR_DATE='$date'
         GIT_COMMITTER_DATE='$date'
     fi" &&
rm -fr "$(git rev-parse --git-dir)/refs/original/"
~~~
    
Instead of setting the date explicitly, we can also use `GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"` ( source: [this gist](https://gist.github.com/568898) ) to match up the committer date to the author date.