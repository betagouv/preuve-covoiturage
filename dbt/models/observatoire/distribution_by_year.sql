{{ config(
    materialized='incremental',
    unique_key=['year', 'code', 'type', 'direction'],
    post_hook=[
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'distribution_by_year_pkey') THEN ALTER TABLE {{ this }} ADD CONSTRAINT distribution_by_year_pkey PRIMARY KEY (year, code, type, direction); END IF; END $$;"
      "CREATE INDEX IF NOT EXISTS distribution_by_year_idx ON {{ this }} using btree(year, code, type, direction)",
    ]
  )
}}

with distances as (
  select
    year,
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
      code,
      type,
      direction,
      dist_classes,
      sum(journeys)                   as journeys
    from {{ ref('distribution_distances_by_day') }}
    group by 1, 2, 3, 4, 5
    order by 1, 2, 3, 4, 5
  ) as t
  {% if is_incremental() %}
    where
      year
      >= (select max(year) from {{ this }})
  {% endif %}
  group by 1, 2, 3, 4
),

hours as (
  select
    year,
    code,
    type,
    direction,
    json_agg(json_build_object('hour', hour, 'journeys', journeys)) as hours
  from (
    select
      extract('year' from start_date) as year,
      code,
      type,
      direction,
      hour,
      sum(journeys)                   as journeys
    from {{ ref('distribution_hours_by_day') }}
    group by 1, 2, 3, 4, 5
    order by 1, 2, 3, 4, 5
  ) as t
  {% if is_incremental() %}
    where
      year
      >= (select max(year) from {{ this }})
  {% endif %}
  group by 1, 2, 3, 4
)

select
  a.year,
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
order by 1, 2, 3, 4
