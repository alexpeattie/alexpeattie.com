---
title: 'Rails tip – Grouping ActiveRecord objects by day or week using <code>datetrunc</code>'
---

Here's a quick Rails question for you. We have a bunch of _Posts_ in a Postgres DB which we want to order by publication day - but Posts published on the **same day** should be ordered by a different column: upvotes. (This is basically how [Product Hunt](https://www.producthunt.com/tech) does it). We're paginating, so we only care about the first 100 posts. How would we do it?

<!-- excerpt -->

Maybe you'd start with something like this:

```ruby
Post.all.group_by { |post|
  post.published_at.to_date
}.flat_map { |day, posts|
  posts.sort_by(&:score).reverse
}.first(100)
```

It's not terrible (it works), it's the [kind of thing](http://stackoverflow.com/questions/4987392/how-do-i-group-by-day-instead-of-date) you'll find if you Google "rails group by day". The problem with the code is _a)_ it's a bit ugly and _b)_ is it's not very efficient. Using our `Enumerable` methods (`group_by` and `flat_map`), means we have to load **all** our Posts into memory, sort them with Ruby, then pull out the 100 we care about. This is slow & inefficient.

To get me started I ran this on 30K records, it took about 7 seconds (I didn't profile the memory usage, but I'd expect it to be quite high). So we might get away with using Ruby to order a few hundred records, but this doesn't scale to thousands or millions of records.

Postgres is way faster and doing these kind of sorts (especially with indexes, as we'll see below) - but simply ordering by `published_at` and `upvotes` doesn't give us what we want:

```ruby
Post.order('published_at DESC, upvotes DESC').limit(5).pluck(:published_at, :upvotes)
#=> (14.4ms) SELECT "posts"."published_at", "posts"."upvotes" FROM "posts" ORDER BY published_at DESC, upvotes DESC LIMIT 5

[[Fri, 15 Jan 2016 15:25:46 UTC +00:00, 12],
 [Fri, 15 Jan 2016 13:22:11 UTC +00:00, 158],
 [Fri, 15 Jan 2016 12:50:37 UTC +00:00, 88],
 [Thu, 14 Jan 2016 21:48:44 UTC +00:00, 24],
 [Thu, 14 Jan 2016 14:46:51 UTC +00:00, 282]]
```

Unless two are added at the same second, the second sort column (upvotes) will never be used. We need to to tell Postgres to sort by the publication _day_, but to ignore the rest of the timestamp.

## Enter `datetrunc`

Luckily we can use super handy function called `date_trunc` for just that (it's documented here). Despite it's handiness I couldn't find any real mention of people using it in a Rails context - although it is used inside the [groupdate gem](https://github.com/ankane/groupdate) which I'd recommend for more complex use-cases, or if you're not using Postgres.

<br>

<video autoplay loop muted playsinline aria-hidden='true'>
  <source src='/assets/images/posts/grouping-activerecord-by-day-or-week-with-datetrunc/what-day.mp4' type='video/mp4'>
</video>

<br>

`datetrunc` is really simple, it truncates a date down to a certain precision. If the precision is `'day'` for example, it'll "reset" the date to midnight (a bit like Rails' beginning_of_day method). Let's modify our example above:

```ruby
Post.order("date_trunc('day', published_at) DESC, upvotes DESC").limit(5).pluck("date_trunc('day', published_at)", :upvotes)
#=> SELECT date_trunc('day', published_at), "collaborations"."upvotes" FROM "collaborations" ORDER BY date_trunc('day', published_at) DESC, upvotes DESC LIMIT 5

[[2016-01-15 00:00:00 UTC, 158]],
 [2016-01-15 00:00:00 UTC, 88],
 [2016-01-15 00:00:00 UTC, 12]],
 [2016-01-14 00:00:00 UTC, 282]],
 [2016-01-14 00:00:00 UTC, 24]]
```

Pretty cool huh? Everything after the day in our publication timestamp is discarded, which means posts from the same day are correctly sorted by upvotes 🎊!

We can truncate down to any arbitrary precision, from `'week'` to `'millennium'` (useful for that database of ancient alien races you might be making).

```ruby
Post.order("date_trunc('week', published_at)")
Post.order("date_trunc('millennium', published_at)")
```

<div class='Callout'>
<p>Be careful, unlike most of the time in Ruby, single/double quotes <strong>aren't</strong> interchangeable here - in Postgres literal strings like <code>'day'</code> <a href='http://www.postgresql.org/docs/9.4/static/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS'>have to be single-quoted</a>.</p>
</div>

### Using indexes for crazy performance 🔥

Using `date_trunc` is faster than our plain-Ruby approach from the get-go - running our final query (below) on the same 30K rows takes just 155ms seconds!

```ruby
Post.order("date_trunc('day', published_at) DESC, upvotes DESC").limit(100)
#=> Post Load (155.2ms)  SELECT  "posts".* FROM "posts" ORDER BY date_trunc('day', published_at) DESC, upvotes DESC  LIMIT 100
```

We can push performance even further by adding an index. We're doing something a bit more complex than just indexing the value of column here, because we're running it through a function first. We'll need expression (or function-based) index. These aren't natively supported in vanilla Rails yet (but there's an [open Pull Request](https://github.com/rails/rails/pull/13684) to add them), so we'll use the [`schema_plus_pg_indexes`](https://github.com/SchemaPlus/schema_plus_pg_indexes) gem.

With the gem added to our Gemfile, we'll generate a migration

```ruby
bin/rails g migration add_creation_day_score_index_to_posts
```

Then we'll add our expression index:

```ruby
class AddCreationDayScoreIndexToPosts < ActiveRecord::Migration

  def up
    add_index :posts, expression: "date_trunc('day', published_at) DESC, score DESC", name: 'posts_creation_day_score_index'
  end

  def down
    remove_index :posts, name: 'posts_creation_day_score_index'
  end

end
```

With the index in place, I saw the query complete in **2.2ms** - that's a 70x speedup. Of course 150ms is already pretty fast - but this has real implications if we're grouping by day/month on a really big table.

I tried using `date_trunc` on a collection of videos from [Peg's](https://peg.co) database, with 16 million rows - ordering the Videos' `published_at` day and `view_count`. Without indexing the query took 42 seconds, with indexing it was only - 20ms not much slower than our 30K row table! I didn't even try the pure Ruby version (spoiler alert: you're in for a bad time).

### Conclusion

`date_trunc` is a very handy little function, that lets you group by time period much much quicker than in plain old Ruby. Have you used `date_trunc`? Any tips for getting the most out of it? Let me know in the comments 😊!
