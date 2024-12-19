{{ config(
    materialized='incremental',
    unique_key=['code', 'type', 'direction', 'start_date'],
    post_hook=[
      'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '"'directions_newcomer_by_day_pkey'"') THEN ALTER TABLE {{ this }} ADD CONSTRAINT directions_newcomer_by_day_pkey PRIMARY KEY (code, type, direction, start_date); END IF; END $$;'
      'CREATE INDEX IF NOT EXISTS directions_newcomer_by_day_idx ON {{ this }} using btree(code, type, direction, start_date)',
    ]
  )
}}

with directions as (
  select
    "from"              as code,
    'com'               as type,
    'from'              as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    coalesce(
      sum(new_drivers) filter (where "from" = "to"), 0
    )                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    coalesce(
      sum(new_passengers) filter (where "from" = "to"), 0
    )                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    "to"                as code,
    'com'               as type,
    'to'                as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    coalesce(
      sum(new_drivers) filter (where "from" = "to"), 0
    )                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    coalesce(
      sum(new_passengers) filter (where "from" = "to"), 0
    )                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.epci              as code,
    'epci'              as type,
    'from'              as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    coalesce(
      sum(new_drivers) filter (where b.epci = c.epci), 0
    )                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    coalesce(
      sum(new_passengers) filter (where b.epci = c.epci), 0
    )                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        epci
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.from = b.arr
  left join
    (
      select
        arr,
        epci
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.to = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.epci              as code,
    'epci'              as type,
    'to'                as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    0                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    0                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        epci
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.to = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.aom               as code,
    'aom'               as type,
    'from'              as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    coalesce(
      sum(new_drivers) filter (where b.aom = c.aom), 0
    )                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    coalesce(
      sum(new_passengers) filter (where b.aom = c.aom), 0
    )                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        aom
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.from = b.arr
  left join
    (
      select
        arr,
        aom
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.to = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.aom               as code,
    'aom'               as type,
    'to'                as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    0                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    0                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        aom
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.to = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.dep               as code,
    'dep'               as type,
    'from'              as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    coalesce(
      sum(new_drivers) filter (where b.dep = c.dep), 0
    )                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    coalesce(
      sum(new_passengers) filter (where b.dep = c.dep), 0
    )                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        dep
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.from = b.arr
  left join
    (
      select
        arr,
        dep
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.to = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.dep               as code,
    'dep'               as type,
    'to'                as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    0                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    0                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        dep
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.to = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.reg               as code,
    'reg'               as type,
    'from'              as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    coalesce(
      sum(new_drivers) filter (where b.reg = c.reg), 0
    )                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    coalesce(
      sum(new_passengers) filter (where b.reg = c.reg), 0
    )                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        reg
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.from = b.arr
  left join
    (
      select
        arr,
        reg
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.to = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.reg               as code,
    'reg'               as type,
    'to'                as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    0                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    0                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        reg
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.to = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.country           as code,
    'country'           as type,
    'from'              as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    coalesce(
      sum(new_drivers) filter (where b.country = c.country), 0
    )                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    coalesce(
      sum(new_passengers) filter (where b.country = c.country), 0
    )                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        country
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.from = b.arr
  left join
    (
      select
        arr,
        country
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.to = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.country           as code,
    'country'           as type,
    'to'                as direction,
    start_date,
    sum(new_drivers)    as new_drivers,
    0                   as intra_new_drivers,
    sum(new_passengers) as new_passengers,
    0                   as intra_new_passengers
  from {{ ref('carpool_newcomer_by_day') }} as a
  left join
    (
      select
        arr,
        country
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.to = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
)

select
  code,
  type,
  start_date,
  direction,
  sum(new_drivers)    as new_drivers,
  sum(new_passengers) as new_passengers
from directions
where code is not null
group by 1, 2, 3, 4
union
select
  code,
  type,
  start_date,
  'both'                                          as direction,
  sum(new_drivers) - sum(intra_new_drivers)       as new_drivers,
  sum(new_passengers) - sum(intra_new_passengers) as new_passengers
from directions
where code is not null
group by 1, 2, 3
