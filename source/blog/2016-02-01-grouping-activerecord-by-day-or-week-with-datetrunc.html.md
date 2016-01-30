---
title: "Rails tip – Grouping ActiveRecord objects by day or week using <code>datetrunc</code>"
---

Here's a quick Rails question for you. We have a bunch of *Posts* in a Postgres DB which we want to order by publication day - but Posts published on the **same day** should be ordered by a different column: upvotes. (This is basically how [Product Hunt](https://www.producthunt.com/tech) does it). How would we do it?

Maybe you'd start with something like this:

~~~ruby
Post.all.group_by { |post|
  post.created_at.to_date
}.flat_map { |day, posts|
  posts.sort_by(&:score).reverse
}
~~~

It's not terrible (it works), it's the [kind of thing](http://stackoverflow.com/questions/4987392/how-do-i-group-by-day-instead-of-date) you'll find if you Google "rails group by day". The problem with the code is *a)* it's a bit ugly and *b)* is it's not very efficient. Using our `Enumerable` methods (`group_by` and `flat_map`), means we have to load all our Posts into memory and do the sorting in Ruby - which is relatively slow.

To get me started I ran this on 30K records, it took about 7 seconds (I didn't profile the memory usage, but I'd expect it to be quite high). So we might get away with using Ruby to order a few hundred records, but this doesn't scale to thousands or millions of records.

Postgres is way faster and doing these kind of sorts (especially with indexes, as we'll see below) - but simply ordering by `published_at` and `upvotes` doesn't give us what we want:

~~~ruby
Post.order('published_at DESC, upvotes DESC').limit(5).pluck(:published_at, :upvotes)
#=> (14.4ms) SELECT "posts"."published_at", "posts"."upvotes" FROM "posts" ORDER BY published_at DESC, upvotes DESC LIMIT 5

[[Fri, 15 Jan 2016 15:25:46 UTC +00:00, 12],
 [Fri, 15 Jan 2016 13:22:11 UTC +00:00, 158],
 [Fri, 15 Jan 2016 12:50:37 UTC +00:00, 88],
 [Thu, 14 Jan 2016 21:48:44 UTC +00:00, 24],
 [Thu, 14 Jan 2016 14:46:51 UTC +00:00, 282]]
~~~

Unless two are added at the same second, the second sort column (upvotes) will never be used. We need to to tell Postgres to sort by the publication *day*, but to ignore the rest of the timestamp.

## Enter `datetrunc`

Luckily we can use super handy function called `date_trunc` for just that (it's documented here). Despite it's handiness I couldn't find any real mention of people using it in a Rails context - although it is used inside the [groupdate gem](https://github.com/ankane/groupdate) which I'd recommend for more complex use-cases, or if you're not using Postgres.

<br>

![What day is it?](posts/grouping-activerecord-by-day-or-week-with-datetrunc/what-day.gif)

<br>

`datetrunc` is really simple, it truncates a date down to a certain precision. If the precision is `'day'` for example, it'll "reset" the date to midnight (a bit like Rails' beginning_of_day method). Let's modify our example above:

~~~ruby
Post.order("date_trunc('day', published_at) DESC, upvotes DESC").limit(5).pluck("date_trunc('day', published_at)", :upvotes)
#=> SELECT date_trunc('day', published_at), "collaborations"."upvotes" FROM "collaborations" ORDER BY date_trunc('day', published_at) DESC, upvotes DESC LIMIT 5

[[2016-01-15 00:00:00 UTC, 158]],
 [2016-01-15 00:00:00 UTC, 88],
 [2016-01-15 00:00:00 UTC, 12]],
 [2016-01-14 00:00:00 UTC, 282]],
 [2016-01-14 00:00:00 UTC, 24]]
~~~

Pretty cool huh? Everything after the day in our publication timestamp is discarded, which means posts from the same day are correctly sorted by upvotes 🎊!

We can truncate down to any arbitrary precision, from `'week'` to `'millennium'` (useful for that database of ancient alien races you might be making).

~~~ruby
Post.order("date_trunc('week', published_at)")
Post.order("date_trunc('millennium', published_at)")
~~~

<div class='Callout'>
<p>Be careful, unlike most of the time in Ruby, single/double quotes <strong>aren't</strong> interchangeable here - in Postgres literal strings like <code>'day'</code> <a href='http://www.postgresql.org/docs/9.4/static/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS'>have to be single-quoted</a>.</p>
</div>

### Using indexes for crazy performance 🔥

Using `date_trunc` is faster than our plain-Ruby approach from the get-go - running it on the same 30K rows took about 1.3 seconds.