{{ config(materialized='incremental') }}
with directions as (
  select
    "from"          as code,
    'com'           as type,
    'from'          as direction,
    start_date,
    sum(journeys)   as journeys,
    coalesce(
      sum(journeys) filter (where "from" = "to"), 0
    )               as intra_journeys,
    sum(drivers)    as drivers,
    coalesce(
      sum(drivers) filter (where "from" = "to"), 0
    )               as intra_drivers,
    sum(passengers) as passengers,
    coalesce(
      sum(passengers) filter (where "from" = "to"), 0
    )               as intra_passengers,
    sum(
      passenger_seats
    )               as passenger_seats,
    coalesce(
      sum(passenger_seats) filter (where "from" = "to"), 0
    )               as intra_passenger_seats,
    sum(distance)   as distance,
    coalesce(
      sum(distance) filter (where "from" = "to"), 0
    )               as intra_distance
  from {{ ref('carpool_by_day') }}
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
    sum(journeys)        as journeys,
    0                    as intra_journeys,
    sum(drivers)         as drivers,
    0                    as intra_drivers,
    sum(passengers)      as passengers,
    0                    as intra_passengers,
    sum(passenger_seats) as passenger_seats,
    0                    as intra_passenger_seats,
    sum(distance)        as distance,
    0                    as intra_distance
  from {{ ref('carpool_by_day') }}
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
    sum(journeys) as journeys,
    coalesce(
      sum(journeys) filter (where b.epci = c.epci), 0
    )             as intra_journeys,
    sum(drivers)  as drivers,
    coalesce(
      sum(drivers) filter (where b.epci = c.epci), 0
    )             as intra_drivers,
    sum(
      passengers
    )             as passengers,
    coalesce(
      sum(passengers) filter (where b.epci = c.epci), 0
    )             as intra_passengers,
    sum(
      passenger_seats
    )             as passenger_seats,
    coalesce(
      sum(passenger_seats) filter (where b.epci = c.epci), 0
    )             as intra_passenger_seats,
    sum(distance) as distance,
    coalesce(
      sum(distance) filter (where b.epci = c.epci), 0
    )             as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)        as journeys,
    0                    as intra_journeys,
    sum(drivers)         as drivers,
    0                    as intra_drivers,
    sum(passengers)      as passengers,
    0                    as intra_passengers,
    sum(passenger_seats) as passenger_seats,
    0                    as intra_passenger_seats,
    sum(distance)        as distance,
    0                    as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)   as journeys,
    coalesce(
      sum(journeys) filter (where b.aom = c.aom), 0
    )               as intra_journeys,
    sum(drivers)    as drivers,
    coalesce(
      sum(drivers) filter (where b.aom = c.aom), 0
    )               as intra_drivers,
    sum(passengers) as passengers,
    coalesce(
      sum(passengers) filter (where b.aom = c.aom), 0
    )               as intra_passengers,
    sum(
      passenger_seats
    )               as passenger_seats,
    coalesce(
      sum(passenger_seats) filter (where b.aom = c.aom), 0
    )               as intra_passenger_seats,
    sum(distance)   as distance,
    coalesce(
      sum(distance) filter (where b.aom = c.aom), 0
    )               as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)        as journeys,
    0                    as intra_journeys,
    sum(drivers)         as drivers,
    0                    as intra_drivers,
    sum(passengers)      as passengers,
    0                    as intra_passengers,
    sum(passenger_seats) as passenger_seats,
    0                    as intra_passenger_seats,
    sum(distance)        as distance,
    0                    as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)   as journeys,
    coalesce(
      sum(journeys) filter (where b.dep = c.dep), 0
    )               as intra_journeys,
    sum(drivers)    as drivers,
    coalesce(
      sum(drivers) filter (where b.dep = c.dep), 0
    )               as intra_drivers,
    sum(passengers) as passengers,
    coalesce(
      sum(passengers) filter (where b.dep = c.dep), 0
    )               as intra_passengers,
    sum(
      passenger_seats
    )               as passenger_seats,
    coalesce(
      sum(passenger_seats) filter (where b.dep = c.dep), 0
    )               as intra_passenger_seats,
    sum(distance)   as distance,
    coalesce(
      sum(distance) filter (where b.dep = c.dep), 0
    )               as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)        as journeys,
    0                    as intra_journeys,
    sum(drivers)         as drivers,
    0                    as intra_drivers,
    sum(passengers)      as passengers,
    0                    as intra_passengers,
    sum(passenger_seats) as passenger_seats,
    0                    as intra_passenger_seats,
    sum(distance)        as distance,
    0                    as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)   as journeys,
    coalesce(
      sum(journeys) filter (where b.reg = c.reg), 0
    )               as intra_journeys,
    sum(drivers)    as drivers,
    coalesce(
      sum(drivers) filter (where b.reg = c.reg), 0
    )               as intra_drivers,
    sum(passengers) as passengers,
    coalesce(
      sum(passengers) filter (where b.reg = c.reg), 0
    )               as intra_passengers,
    sum(
      passenger_seats
    )               as passenger_seats,
    coalesce(
      sum(passenger_seats) filter (where b.reg = c.reg), 0
    )               as intra_passenger_seats,
    sum(distance)   as distance,
    coalesce(
      sum(distance) filter (where b.reg = c.reg), 0
    )               as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)        as journeys,
    0                    as intra_journeys,
    sum(drivers)         as drivers,
    0                    as intra_drivers,
    sum(passengers)      as passengers,
    0                    as intra_passengers,
    sum(passenger_seats) as passenger_seats,
    0                    as intra_passenger_seats,
    sum(distance)        as distance,
    0                    as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
      journeys
    )         as journeys,
    coalesce(
      sum(journeys) filter (where b.country = c.country), 0
    )         as intra_journeys,
    sum(
      drivers
    )         as drivers,
    coalesce(
      sum(drivers) filter (where b.country = c.country), 0
    )         as intra_drivers,
    sum(
      passengers
    )         as passengers,
    coalesce(
      sum(passengers) filter (where b.country = c.country), 0
    )         as intra_passengers,
    sum(
      passenger_seats
    )         as passenger_seats,
    coalesce(
      sum(passenger_seats) filter (where b.country = c.country), 0
    )         as intra_passenger_seats,
    sum(
      distance
    )         as distance,
    coalesce(
      sum(distance) filter (where b.country = c.country), 0
    )         as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
    sum(journeys)        as journeys,
    0                    as intra_journeys,
    sum(drivers)         as drivers,
    0                    as intra_drivers,
    sum(passengers)      as passengers,
    0                    as intra_passengers,
    sum(passenger_seats) as passenger_seats,
    0                    as intra_passenger_seats,
    sum(distance)        as distance,
    0                    as intra_distance
  from {{ ref('carpool_by_day') }} as a
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
  sum(journeys)        as journeys,
  sum(intra_journeys)  as intra_journeys,
  sum(drivers)         as drivers,
  sum(passengers)      as passengers,
  sum(passenger_seats) as passenger_seats,
  sum(distance)        as distance
from directions
group by 1, 2, 3, 4
union
select
  code,
  type,
  start_date,
  'both'                                            as direction,
  sum(journeys) - sum(intra_journeys)               as journeys,
  sum(intra_journeys)                               as intra_journeys,
  sum(drivers) - sum(intra_drivers)                 as drivers,
  sum(passengers) - sum(intra_passengers)           as passengers,
  sum(passenger_seats) - sum(intra_passenger_seats) as passenger_seats,
  sum(distance) - sum(intra_distance)               as distance
from directions
group by 1, 2, 3