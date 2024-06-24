{{ config(materialized='incremental') }}

WITH flux AS (
  SELECT
    origin,
    destination,
    extract('year' from start_date)::int as year,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance,
    sum(duration) as duration
  FROM {{ ref('flux_by_day') }}
  {% if is_incremental() %}
    where extract('year' from start_date)::int >= (SELECT MAX(year) FROM {{ this }})
  {% endif %}
  GROUP BY
  1, 2, 3
),
flux_agg as (
  SELECT 
    a.year,
    'com' AS type,
    LEAST(b.arr, c.arr) as territory_1,
    GREATEST(b.arr, c.arr) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    extract( 'epoch' from sum(duration))/60 as duration
    FROM flux a
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year =  geo.get_latest_millesime()) b ON a.origin=b.arr
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year =  geo.get_latest_millesime()) c ON a.destination=c.arr
    GROUP BY 1, 3, 4
    HAVING  LEAST(b.arr, c.arr) IS NOT NULL OR GREATEST(b.arr, c.arr) IS NOT NULL
  UNION
  SELECT 
    a.year,
    'epci' AS type,
    LEAST(b.epci, c.epci) as territory_1,
    GREATEST(b.epci, c.epci) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    extract( 'epoch' from sum(duration))/60 as duration
    FROM flux a
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) b ON a.origin=b.arr
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) c ON a.destination=c.arr
    GROUP BY 1, 3, 4
    HAVING LEAST(b.epci, c.epci) IS NOT NULL OR GREATEST(b.epci, c.epci) IS NOT NULL
  UNION
  SELECT 
    a.year,
    'aom' AS type,
    LEAST(b.aom, c.aom) as territory_1,
    GREATEST(b.aom, c.aom) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    extract( 'epoch' from sum(duration))/60 as duration
    FROM flux a
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) b ON a.origin=b.arr
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) c ON a.destination=c.arr
    GROUP BY 1, 3, 4
    HAVING LEAST(b.aom, c.aom) IS NOT NULL OR LEAST(b.aom, c.aom) IS NOT NULL
  UNION
  SELECT 
    a.year,
    'dep' AS type,
    LEAST(b.dep, c.dep) as territory_1,
    GREATEST(b.dep, c.dep) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    extract( 'epoch' from sum(duration))/60 as duration
    FROM flux a
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) b ON a.origin=b.arr
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) c ON a.destination=c.arr
    GROUP BY 1, 3, 4
    HAVING LEAST(b.dep, c.dep) IS NOT NULL OR GREATEST(b.dep, c.dep) IS NOT NULL
  UNION
  SELECT 
    a.year,
    'reg' AS type,
    LEAST(b.reg, c.reg) as territory_1,
    GREATEST(b.reg, c.reg) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    extract( 'epoch' from sum(duration))/60 as duration
    FROM flux a
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) b ON a.origin=b.arr
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) c ON a.destination=c.arr
    GROUP BY 1, 3, 4
    HAVING LEAST(b.reg, c.reg) IS NOT NULL OR GREATEST(b.reg, c.reg) IS NOT NULL
  UNION
  SELECT 
    a.year,
    'country' AS type,
    LEAST(b.country, c.country) as territory_1,
    GREATEST(b.country, c.country) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    extract( 'epoch' from sum(duration))/60 as duration
    FROM flux a
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) b ON a.origin=b.arr
    LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year = geo.get_latest_millesime()) c ON a.destination=c.arr
    GROUP BY 1, 3, 4
    HAVING LEAST(b.country, c.country) IS NOT NULL OR GREATEST(b.country, c.country) IS NOT NULL
)

SELECT 
  a.year, 
  a.type,
  a.territory_1,
  b.l_territory as l_territory_1,
  st_x(b.geom) as lng_1,
  st_y(b.geom) as lat_1, 
  a.territory_2, 
  c.l_territory as l_territory_2,
  st_x(c.geom) as lng_2,
  st_y(c.geom) as lat_2,
  a.journeys,
  a.passengers,
  a.distance,
  a.duration 
FROM flux_agg a
LEFT JOIN (SELECT * from {{ source('geo','perimeters_centroid') }} WHERE year = geo.get_latest_millesime()) b on concat(a.territory_1,a.type) = concat(b.territory,b.type)
LEFT JOIN (SELECT * from {{ source('geo','perimeters_centroid') }} WHERE year = geo.get_latest_millesime()) c on concat(a.territory_2,a.type) = concat(c.territory,c.type)
ORDER BY a.territory_1,a.territory_2