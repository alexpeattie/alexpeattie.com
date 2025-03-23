---
title: "Quick tip: simple unique jobs on Solid Queue"
---

I recently migrated from Sidekiq to [Solid Queue](https://github.com/rails/solid_queue) on a personal project, and generally found the transition to be quite painless. However, at the time of writing, Solid Queue doesn't support unique jobs, either natively or through a 3rd party gem. (Sidekiq has both, through the popular [sidekiq-unique-jobs](https://github.com/mhenrixon/sidekiq-unique-jobs) or via its [Enterprise offering](https://github.com/sidekiq/sidekiq/wiki/Ent-Unique-Jobs).)

The good news is that native support seems to be [in progress](https://github.com/rails/solid_queue/issues/176), but in the meantime, it's quite easy to roll your own unique job class using the `around_enqueue` callback and a simple query against Solid Queue's `Job` table.

```ruby
---
filename: app/jobs/unique_job.rb
---
class UniqueJob < ApplicationJob
  around_enqueue do |job, block|
    # `.scheduled` scope == all unfinished jobs
    if SolidQueue::Job.scheduled.where(class_name: job.class.name).none?
      block.call # enqueue the job
    else
      Rails.logger.info("Skipping #{job.class.name} because it is already present")
      # If we don't invoke `block.call`, the job won't be enqueued
    end
  end

  def perform(...)
    # UniqueJob is an abstract class, we shouldn't enqueue it directly
    raise NotImplementedError
  end
end
```

Now any job that inherits from `UniqueJob` can only be enqueued if a job of that class is not already enqueued, running or scheduled:

```ruby
---
filename: app/jobs/example_job.rb
---
class ExampleJob < UniqueJob
  def perform
    sleep 20
  end
end
```

If I try to enqueue the job twice, the second call will be skipped[^skipped] with a log message:

```ruby
> ExampleJob.perform_later
[ActiveJob]   SolidQueue::Job Exists? (2.3ms)  SELECT 1 AS one FROM "solid_queue_jobs" WHERE "solid_queue_jobs"."finished_at" IS NULL AND "solid_queue_jobs"."class_name" = $1 LIMIT $2  [["class_name", "ExampleJob"], ["LIMIT", 1]]
[ActiveJob]   TRANSACTION (0.2ms)  BEGIN
[ActiveJob]   SolidQueue::Job Create (1.7ms)  INSERT INTO "solid_queue_jobs" ("queue_name", "class_name", "arguments", "priority", "active_job_id", "scheduled_at", "finished_at", "concurrency_key", "created_at", "updated_at") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING "id"  [["queue_name", "default"], ["class_name", "ExampleJob"], ["arguments", "{\"job_class\":\"ExampleJob\",\"job_id\":\"a0f861a9-43c2-4879-a7f2-71a51aa946c1\",\"provider_job_id\":null,\"queue_name\":\"default\",\"priority\":500,\"arguments\":[],\"executions\":0,\"exception_executions\":{},\"locale\":\"en\",\"timezone\":\"UTC\",\"enqueued_at\":\"2025-03-23T12:39:54.064482095Z\",\"scheduled_at\":\"2025-03-23T12:39:54.064000220Z\"}"], ["priority", 500], ["active_job_id", "a0f861a9-43c2-4879-a7f2-71a51aa946c1"], ["scheduled_at", "2025-03-23 12:39:54.064000"], ["finished_at", nil], ["concurrency_key", nil], ["created_at", "2025-03-23 12:39:54.068897"], ["updated_at", "2025-03-23 12:39:54.068897"]]
[ActiveJob]   TRANSACTION (0.1ms)  SAVEPOINT active_record_1
[ActiveJob]   SolidQueue::Job Load (1.1ms)  SELECT "solid_queue_jobs".* FROM "solid_queue_jobs" WHERE "solid_queue_jobs"."id" = $1 LIMIT $2  [["id", 234], ["LIMIT", 1]]
[ActiveJob]   SolidQueue::ReadyExecution Create (1.5ms)  INSERT INTO "solid_queue_ready_executions" ("job_id", "queue_name", "priority", "created_at") VALUES ($1, $2, $3, $4) RETURNING "id"  [["job_id", 234], ["queue_name", "default"], ["priority", 500], ["created_at", "2025-03-23 12:39:54.086915"]]
[ActiveJob]   TRANSACTION (0.1ms)  RELEASE SAVEPOINT active_record_1
[ActiveJob]   TRANSACTION (0.5ms)  COMMIT
[ActiveJob] Enqueued ExampleJob (Job ID: a0f861a9-43c2-4879-a7f2-71a51aa946c1) to SolidQueue(default)

> ExampleJob.perform_later
[ActiveJob]   SolidQueue::Job Exists? (0.3ms)  SELECT 1 AS one FROM "solid_queue_jobs" WHERE "solid_queue_jobs"."finished_at" IS NULL AND "solid_queue_jobs"."class_name" = $1 LIMIT $2  [["class_name", "ExampleJob"], ["LIMIT", 1]]
[ActiveJob] Skipping ExampleJob because it is already present
[ActiveJob] Enqueued ExampleJob (Job ID: 41e8ff4c-ec58-4821-a686-ca58740af2ca) to SolidQueue(default)
[ActiveJob] ↳ (apmovies):9:in `<main>'
```

This setup is basically equivalent to the `sidekiq-unique-jobs` configured with `sidekiq_options lock: :until_executed, on_conflict: :log`.

[^skipped]: The log still claims `Enqueued ExampleJob`, but we can see nothing is actually enqueued.