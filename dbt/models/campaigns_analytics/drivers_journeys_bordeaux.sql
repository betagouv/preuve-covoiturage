{{
  config(
    materialized = 'table',
    )
}}

with driver_journeys as (
  select
    c.driver_operator_user_id,
    c.operator_journey_id,
    c.operator_id,
    c._id,
    c.start_datetime,
    row_number() over (
      partition by driver_operator_user_id
      order by
        c.start_datetime
    ) as driver_journey_rank,
    row_number() over (
      partition by driver_operator_user_id, date_trunc('day', start_datetime)
      order by
        c.start_datetime
    ) as driver_journey_daily_rank
  from
    {{ source('carpool', 'carpools') }} as c
  left join {{ source('carpool', 'geo') }} as g
    on
      c._id = g.carpool_id
  left join {{ source('geo', 'perimeters') }} as p
    on
      g.start_geo_code = p.com
      and p.year = 2024
  left join {{ source('geo', 'perimeters') }} as p2
    on
      g.end_geo_code = p2.com
      and p2.year = 2024
  where
    (
      p.aom = '243300316'
      or p2.aom = '243300316'
    )
    and c.start_datetime between '2024-01-01' and '2024-10-01'
)

select * from driver_journeys
