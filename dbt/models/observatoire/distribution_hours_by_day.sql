{{ config(materialized='incremental') }}
with directions as (
  select
    start    as code,
    'com'    as type,
    'from'   as direction,
    start_date,
    hour,
    count(*) as journeys,
    coalesce(
      count(*) filter (where start = "end"), 0
    )        as intra_journeys
  from {{ ref('view_distribution') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    "end"    as code,
    'com'    as type,
    'to'     as direction,
    start_date,
    hour,
    count(*) as journeys,
    0        as intra_journeys
  from {{ ref('view_distribution') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.epci   as code,
    'epci'   as type,
    'from'   as direction,
    start_date,
    hour,
    count(*) as journeys,
    coalesce(
      count(*) filter (where b.epci = c.epci), 0
    )        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        epci
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.start = b.arr
  left join
    (
      select
        arr,
        epci
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.end = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.epci   as code,
    'epci'   as type,
    'to'     as direction,
    start_date,
    hour,
    count(*) as journeys,
    0        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        epci
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.end = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.aom    as code,
    'aom'    as type,
    'from'   as direction,
    start_date,
    hour,
    count(*) as journeys,
    coalesce(
      count(*) filter (where b.aom = c.aom), 0
    )        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        aom
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.start = b.arr
  left join
    (
      select
        arr,
        aom
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.end = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.aom    as code,
    'aom'    as type,
    'to'     as direction,
    start_date,
    hour,
    count(*) as journeys,
    0        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        aom
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.end = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.dep    as code,
    'dep'    as type,
    'from'   as direction,
    start_date,
    hour,
    count(*) as journeys,
    coalesce(
      count(*) filter (where b.dep = c.dep), 0
    )        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        dep
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.start = b.arr
  left join
    (
      select
        arr,
        dep
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.end = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.dep    as code,
    'dep'    as type,
    'to'     as direction,
    start_date,
    hour,
    count(*) as journeys,
    0        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        dep
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.end = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.reg    as code,
    'reg'    as type,
    'from'   as direction,
    start_date,
    hour,
    count(*) as journeys,
    coalesce(
      count(*) filter (where b.reg = c.reg), 0
    )        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        reg
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.start = b.arr
  left join
    (
      select
        arr,
        reg
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.end = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.reg    as code,
    'reg'    as type,
    'to'     as direction,
    start_date,
    hour,
    count(*) as journeys,
    0        as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        reg
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.end = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.country as code,
    'country' as type,
    'from'    as direction,
    start_date,
    hour,
    count(*)  as journeys,
    coalesce(
      count(*) filter (where b.country = c.country), 0
    )         as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        country
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.start = b.arr
  left join
    (
      select
        arr,
        country
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as c
    on a.end = c.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
  union
  select
    b.country as code,
    'country' as type,
    'to'      as direction,
    start_date,
    hour,
    count(*)  as journeys,
    0         as intra_journeys
  from {{ ref('view_distribution') }} as a
  left join
    (
      select
        arr,
        country
      from {{ source('geo','perimeters') }}
      where year = geo.get_latest_millesime()
    ) as b
    on a.end = b.arr
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4, 5
)

select
  code,
  type,
  start_date,
  hour,
  direction,
  sum(journeys)       as journeys,
  sum(intra_journeys) as intra_journeys
from directions
group by 1, 2, 3, 4, 5
union
select
  code,
  type,
  start_date,
  hour,
  'both'                              as direction,
  sum(journeys) - sum(intra_journeys) as journeys,
  sum(intra_journeys)                 as intra_journeys
from directions
group by 1, 2, 3, 4