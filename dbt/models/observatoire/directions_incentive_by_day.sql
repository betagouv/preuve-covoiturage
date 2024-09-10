{{ config(
    materialized='incremental',
    unique_key=['code', 'type', 'direction', 'start_date'],
    post_hook=[
      'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '"'directions_incentive_by_day_pkey'"') THEN ALTER TABLE {{ this }} ADD CONSTRAINT directions_incentive_by_day_pkey PRIMARY KEY (code, type, direction, start_date); END IF; END $$;'
      'CREATE INDEX IF NOT EXISTS directions_incentive_by_day_idx ON {{ this }} using btree(code, type, direction, start_date)',
    ]
  )
}}

with directions as (
  select
    "from"          as code,
    'com'           as type,
    'from'          as direction,
    start_date,
    sum(collectivite) as collectivite,
    coalesce(
     sum(collectivite) filter (where "from" = "to"), 0
    )               as intra_collectivite,
    sum(operateur)    as operateur,
    coalesce(
      sum(operateur) filter (where "from" = "to"), 0
    )               as intra_operateur,
    sum(autres) as autres,
    coalesce(
      sum(autres) filter (where "from" = "to"), 0
    )               as intra_autres
  from {{ ref('carpool_incentive_by_day') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    "to"                 as code,
    'com'                as type,
    'to'                 as direction,
    start_date,
   sum(collectivite)        as collectivite,
    0                    as intra_collectivite,
    sum(operateur)         as operateur,
    0                    as intra_operateur,
    sum(autres)      as autres,
    0                    as intra_autres
  from {{ ref('carpool_incentive_by_day') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 4
  union
  select
    b.epci        as code,
    'epci'        as type,
    'from'        as direction,
    start_date,
   sum(collectivite) as collectivite,
    coalesce(
     sum(collectivite) filter (where b.epci = c.epci), 0
    )             as intra_collectivite,
    sum(operateur)  as operateur,
    coalesce(
      sum(operateur) filter (where b.epci = c.epci), 0
    )             as intra_operateur,
    sum(
      autres
    )             as autres,
    coalesce(
      sum(autres) filter (where b.epci = c.epci), 0
    )             as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.epci               as code,
    'epci'               as type,
    'to'                 as direction,
    start_date,
   sum(collectivite)     as collectivite,
    0                    as intra_collectivite,
    sum(operateur)         as operateur,
    0                    as intra_operateur,
    sum(autres)      as autres,
    0                    as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.aom           as code,
    'aom'           as type,
    'from'          as direction,
    start_date,
    sum(collectivite) as collectivite,
    coalesce(
     sum(collectivite) filter (where b.aom = c.aom), 0
    )               as intra_collectivite,
    sum(operateur)    as operateur,
    coalesce(
      sum(operateur) filter (where b.aom = c.aom), 0
    )               as intra_operateur,
    sum(autres) as autres,
    coalesce(
      sum(autres) filter (where b.aom = c.aom), 0
    )               as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.aom                as code,
    'aom'                as type,
    'to'                 as direction,
    start_date,
   sum(collectivite)        as collectivite,
    0                    as intra_collectivite,
    sum(operateur)         as operateur,
    0                    as intra_operateur,
    sum(autres)      as autres,
    0                    as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.dep           as code,
    'dep'           as type,
    'from'          as direction,
    start_date,
    sum(collectivite) as collectivite,
    coalesce(
     sum(collectivite) filter (where b.dep = c.dep), 0
    )               as intra_collectivite,
    sum(operateur)    as operateur,
    coalesce(
      sum(operateur) filter (where b.dep = c.dep), 0
    )               as intra_operateur,
    sum(autres) as autres,
    coalesce(
      sum(autres) filter (where b.dep = c.dep), 0
    )               as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.dep                as code,
    'dep'                as type,
    'to'                 as direction,
    start_date,
   sum(collectivite)        as collectivite,
    0                    as intra_collectivite,
    sum(operateur)         as operateur,
    0                    as intra_operateur,
    sum(autres)      as autres,
    0                    as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.reg           as code,
    'reg'           as type,
    'from'          as direction,
    start_date,
    sum(collectivite) as collectivite,
    coalesce(
     sum(collectivite) filter (where b.reg = c.reg), 0
    )               as intra_collectivite,
    sum(operateur)    as operateur,
    coalesce(
      sum(operateur) filter (where b.reg = c.reg), 0
    )               as intra_operateur,
    sum(autres) as autres,
    coalesce(
      sum(autres) filter (where b.reg = c.reg), 0
    )               as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.reg                as code,
    'reg'                as type,
    'to'                 as direction,
    start_date,
   sum(collectivite)        as collectivite,
    0                    as intra_collectivite,
    sum(operateur)         as operateur,
    0                    as intra_operateur,
    sum(autres)      as autres,
    0                    as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.country as code,
    'country' as type,
    'from'    as direction,
    start_date,
    sum(
      collectivite
    )         as collectivite,
    coalesce(
     sum(collectivite) filter (where b.country = c.country), 0
    )         as intra_collectivite,
    sum(
      operateur
    )         as operateur,
    coalesce(
      sum(operateur) filter (where b.country = c.country), 0
    )         as intra_operateur,
    sum(
      autres
    )         as autres,
    coalesce(
      sum(autres) filter (where b.country = c.country), 0
    )         as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
    b.country            as code,
    'country'            as type,
    'to'                 as direction,
    start_date,
   sum(collectivite)        as collectivite,
    0                    as intra_collectivite,
    sum(operateur)         as operateur,
    0                    as intra_operateur,
    sum(autres)      as autres,
    0                    as intra_autres
  from {{ ref('carpool_incentive_by_day') }} as a
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
 sum(collectivite)        as collectivite,
  sum(intra_collectivite)  as intra_collectivite,
  sum(operateur)         as operateur,
  sum(autres)      as autres
from directions
group by 1, 2, 3, 4
union
select
  code,
  type,
  start_date,
  'both'                                            as direction,
 sum(collectivite) - sum(intra_collectivite)               as collectivite,
  sum(intra_collectivite)                               as intra_collectivite,
  sum(operateur) - sum(intra_operateur)                 as operateur,
  sum(autres) - sum(intra_autres)           as autres
from directions
group by 1, 2, 3