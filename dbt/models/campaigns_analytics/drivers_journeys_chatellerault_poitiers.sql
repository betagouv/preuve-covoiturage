{{
  config(
    materialized = 'view',
    )
}}

select
  c._id,
  c.driver_operator_user_id,
  c.operator_journey_id,
  c.operator_id,
  c.operator_class,
  c.start_datetime,
  g.start_geo_code,
  p.aom    as start_aom,
  p.l_aom  as start_l_aom,
  g.end_geo_code,
  p2.aom   as end_aom,
  p2.l_aom as end_l_aom
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
    p.aom in ('200069854', '248600413')
    or p2.aom in ('200069854', '248600413')
  )
  and c.start_datetime between '2024-02-01' and '2024-12-31'
