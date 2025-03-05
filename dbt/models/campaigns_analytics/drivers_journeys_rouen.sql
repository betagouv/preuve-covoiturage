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
    ) as driver_journey_rank
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
      p.aom = '200023414'
      or p2.aom = '200023414'
    )
    and c.start_datetime between '2023-01-01' and '2023-03-01'
),

incentives as (
  select
    carpool_id,
    sum(amount) as amount
  from {{ source('carpool', 'operator_incentives') }}
  where
    carpool_id in (select _id from driver_journeys)
    and siret = '20002341400036'
  group by 1
),

driver_incentives as (
  select
    dj.*,
    oi.amount,
    sum(oi.amount)
      over (
        partition by
          driver_operator_user_id, date_trunc('month', dj.start_datetime)
        order by dj.start_datetime nulls last
      )
    as cummulative_amount_month
  from
    driver_journeys as dj
  left join incentives as oi on
    dj._id = oi.carpool_id
)

select * from driver_incentives
