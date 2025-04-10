{{
  config(
    materialized = 'table',
    indexes = [
      {
        "columns": ['user_identity_key'],
        "unique": true
      }
    ],
    description = 'Identifications des utilisateurs dont les trajets ont souvent la même distance/heure de départ.'
    )
}}

select
  c.user_identity_key,
  count(
    distinct c.operator_journey_id
  ) as journeys_count,
  count(distinct c.operator_journey_id) filter (
    where c.role = 'driver'
  ) as journeys_count_as_driver,
  count(distinct c.operator_journey_id) filter (
    where c.role = 'passenger'
  ) as journeys_count_as_passenger,
  count(
    distinct c.operator_trip_id
  ) as trips_count,
  stddev_samp(c.distance) filter (
    where c.role = 'driver'
  ) as distance_std_as_driver,
  stddev_samp(extract(
    hour
    from
    c.start_datetime
  ) * 3600
  + extract(
    minute
    from
    c.start_datetime
  ) * 60
  + extract(
    second
    from
    c.start_datetime
  )) filter (
    where c.role = 'driver'
  ) as start_time_std_as_driver,
  stddev_samp(c.distance) filter (
    where c.role = 'passenger'
  ) as distance_std_as_passenger,
  stddev_samp(extract(
    hour
    from
    c.start_datetime
  ) * 3600
  + extract(
    minute
    from
    c.start_datetime
  ) * 60
  + extract(
    second
    from
    c.start_datetime
  )) filter (
    where c.role = 'passenger'
  ) as start_time_std_as_passenger,
  array_agg(
    distinct c.operator_id
  ) as operators_ids
from
  {{ ref('users_trips') }} as c
where
  c.start_datetime >= now() - interval '1 month'
group by
  1
having
  count(distinct c.operator_journey_id) filter (where c.role = 'driver') >= 10
  or count(distinct c.operator_journey_id) filter (where c.role = 'passenger')
  >= 10
