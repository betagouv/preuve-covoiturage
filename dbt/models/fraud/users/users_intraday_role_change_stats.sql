{{
  config(
    materialized = 'table',
    tags=["fraud"],
    unique_key='user_identity_key',
    indexes = [
      {
        "columns":["user_identity_key"],
        "unique": true
      }
    ]
    )
}}

with roles as (
  select
    user_identity_key,
    start_datetime,
    role
  from
    {{ ref('users_trips') }}
),

lagged as (
  select
    *,
    lag(role, -1)
      over (
        partition by
          user_identity_key, date_trunc('day', start_datetime)
        order by start_datetime
      )
    as next_role
  from roles
),

intraday_stats as (
  select
    user_identity_key,
    start_datetime                as start_day,
    sum((role != next_role)::int) as count_consecutive_changes
  from lagged
  group by 1, 2
)

select
  user_identity_key,
  count(start_day)               as total_traveled_days,
  sum(count_consecutive_changes) as total_consecutives_intraday_role_changes,
  avg(
    count_consecutive_changes
  )                              as avg_daily_consecutives_intraday_role_changes,
  max(
    count_consecutive_changes
  )                              as max_daily_consecutives_intraday_role_changes
from intraday_stats
group by 1
