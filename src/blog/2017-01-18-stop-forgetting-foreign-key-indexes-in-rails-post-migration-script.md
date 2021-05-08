---
title: 'Stop forgetting your foreign key indexes in Rails with this simple post-migration script'
---

One of our New Year's resolutions at [Peg](https://peg.co) was to make the site faster. For the most part the site was responsive (requests completed in < 100ms), but certain pages were taking much longer to load than they should - with database queries eating up most of the time.

<!-- excerpt -->

I quickly discovered one source of slowdown: not all of our foreign keys were indexed. About 40% of our foreign keys (46 out of 116) weren't 😱, which was causing a Rails' performance to degrade noticeably for some queries. The fix was very quick: a mega migration with 46 `add_index` statements. But how could I stop the problem going forward?

### Why we were missing foreign key indexes

**Foreign keys should always be indexed** - Tom Ward gives a great explanation of why in [this post](https://archive.is/i7SLO). So what were we playing at? Human error was to blame - in many instances we'd added the foreign keys as `integer`s rather than (following best practice) as `references`. To recap the difference, if I say:

```bash
bin/rails g migration AddRegionIdToAddresses region_id:integer
```

Rails makes no assumptions about what kind of integer column `region_id` is, and won't index it. But, in all likelihood, I'll be querying addresses based which region they belong to (_Return addresses where `region_id = X`_) which is going to be slow without an index. If I instead do:

```bash
bin/rails g migration AddRegionIdToAddresses region_id:references

# or

bin/rails g migration AddRegionIdToAddresses region_id:belongs_to
```

The index will be automatically created. Note, that everything else works if your foreign key is a plain ol' integer, so it's an easy mixup to make.

### Automatically warning about missing foreign key indexes

Prevention is better than a cure, so I whipped up a quick script to keep an eye on missing foreing key indexes going forward. Rake offers a very handy `enhance` method which lets you add behavior that runs after an existing task. In our case, we extended the `db:migrate` task to **check for any unindexed foreign keys and promptly warn the developer**:

```ruby
---
filename: lib/tasks/post_migration_index_checker.rake
---
Rake::Task['db:migrate'].enhance do
  tables = ActiveRecord::Base.connection.tables
  all_foreign_keys = tables.flat_map do |table_name|
    ActiveRecord::Base.connection.columns(table_name).map {|c| [table_name, c.name].join('.') }
  end.select { |c| c.ends_with?('_id') }

  indexed_columns = tables.map do |table_name|
    ActiveRecord::Base.connection.indexes(table_name).map do |index|
      index.columns.map {|c| [table_name, c].join('.') }
    end
  end.flatten

  unindexed_foreign_keys = (all_foreign_keys - indexed_columns)

  if unindexed_foreign_keys.any?
    warn "WARNING: The following foreign key columns don't have an index, which can hurt performance: #{ unindexed_foreign_keys.join(', ') }"
  end
end
```

The code is quite straightforward: we iterate through every column of every table, and select those that end in `_id`; this is quite a naive way to identify foreign keys, but worked AOK for us. Then we loop through our indexes, and names of the columns they're indexing. If there are any foreign keys which aren't in the list of indexed columns, we output a warning. To install, just save the script as, say, `post_migration_index_checker.rake` and put it in your `libs/tasks` directory. Here's the script in action:

<video autoplay loop poster="https://i.imgur.com/hRYOSiq.jpg">
  <source src="https://i.imgur.com/hRYOSiq.mp4" type="video/mp4">
</video>

I'm always interested in creative ways to nudge developers towards best practices. Has something similar worked well in your company? Let me know by leaving a comment, [dropping me a line](mailto:me@alexpeattie.com) or pinging me on Twitter [@alexpeattie](https://twitter.com/alexpeattie).
