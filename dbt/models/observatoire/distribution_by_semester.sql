{{ config(
    materialized='incremental',
    incremental_strategy='delete+insert',
    unique_key=['year', 'semester', 'code', 'type', 'direction'],
    indexes = [
      {
        'columns':[
          'year',
          'month',
          'type',
          'direction'          
        ],
        'unique':true
      }
    ]
  )
}}
with distances as (
  select
    year,
    semester,
    code,
    type,
    direction,
    json_agg(
      json_build_object(
        'dist_classes', dist_classes, 'journeys', journeys
      )
    ) as distances
  from (
    select
      extract('year' from start_date) as year,
      case
        when extract('quarter' from start_date)::int > 3 then 2 else 1
      end                             as semester,
      code,
      type,
      direction,
      dist_classes,
      sum(journeys)                   as journeys
    from {{ ref('distribution_distances_by_day') }}
    group by 1, 2, 3, 4, 5, 6
    order by 1, 2, 3, 4, 5, 6
  ) as t
  {% if is_incremental() %}
    where
      (year * 10 + semester)
      >= (SELECT max(year * 10 + semester) FROM {{ this }})
  {% endif %}
  group by 1, 2, 3, 4, 5
),

hours as (
  select
    year,
    semester,
    code,
    type,
    direction,
    json_agg(json_build_object('hour', hour, 'journeys', journeys)) as hours
  from (
    select
      extract('year' from start_date) as year,
      case
        when extract('quarter' from start_date)::int > 3 then 2 else 1
      end                             as semester,
      code,
      type,
      direction,
      hour,
      sum(journeys)                   as journeys
    from {{ ref('distribution_hours_by_day') }}
    group by 1, 2, 3, 4, 5, 6
    order by 1, 2, 3, 4, 5, 6
  ) as t
  {% if is_incremental() %}
    where
      (year * 10 + semester)
      >= (SELECT max(year * 10 + semester) FROM {{ this }})
  {% endif %}
  group by 1, 2, 3, 4, 5
)

select
  a.year,
  a.semester,
  a.code,
  c.l_territory as libelle,
  a.type,
  a.direction,
  a.hours,
  b.distances
from hours as a
left join
  distances as b
  on
    a.year = b.year
    and a.semester = b.semester
    and a.code = b.code
    and a.direction = b.direction
    and a.type = b.type
left join
  (
    select
      territory,
      l_territory,
      type
    from {{ source('geo','perimeters_centroid') }}
    where year = geo.get_latest_millesime()
  ) as c
  on a.code = c.territory and a.type = c.type
order by 1, 2, 3, 4, 5
