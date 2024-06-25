{{ config(materialized='incremental') }}
WITH occupation as (
  SELECT
    code,
    one_way,
    extract('year' from start_date)::int as year,
    extract('month' from start_date)::int as month,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance
  FROM {{ ref('occupation_by_day') }}
    {% if is_incremental() %}
      where concat(extract('year' from start_date),extract('month' from start_date))::int >= (SELECT MAX(concat(year,month)::int) FROM {{ this }})
    {% endif %}
  GROUP BY 1, 2, 3, 4
  UNION
  SELECT
    code,
    'both' as one_way,
    extract('year' from start_date)::int as year,
    extract('month' from start_date)::int as month,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance
  FROM {{ ref('occupation_by_day') }}
    {% if is_incremental() %}
      where concat(extract('year' from start_date),extract('month' from start_date))::int >= (SELECT MAX(concat(year,month)::int) FROM {{ this }})
    {% endif %}
  GROUP BY 1, 3, 4
),
occupation_agg as (
  SELECT
    year,
    month,
    code,
    'com' as type,
    one_way,
    sum(journeys) as journeys,
    round(sum(distance)/sum(journeys))*sum(passenger_seats) as passengers_distance,
    round(sum(distance)/sum(journeys))*sum(drivers) as drivers_distance
  FROM occupation
  GROUP BY 1, 2, 3, 5
  UNION
  SELECT
    a.year,
    a.month,
    b.epci as code,
    'epci' as type,
    a.one_way,
    sum(a.journeys) as journeys,
    round(sum(a.distance)/sum(a.journeys))*sum(a.passenger_seats) as passengers_distance,
    round(sum(a.distance)/sum(a.journeys))*sum(a.drivers) as drivers_distance
  FROM occupation a
  LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year =  geo.get_latest_millesime()) b ON a.code=b.arr
  GROUP BY 1, 2, 3, 5
  UNION
  SELECT
    a.year,
    a.month,
    b.aom as code,
    'aom' as type,
    a.one_way,
    sum(a.journeys) as journeys,
    round(sum(a.distance)/sum(a.journeys))*sum(a.passenger_seats) as passengers_distance,
    round(sum(a.distance)/sum(a.journeys))*sum(a.drivers) as drivers_distance
  FROM occupation a
  LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year =  geo.get_latest_millesime()) b ON a.code=b.arr
  GROUP BY 1, 2, 3, 5
  UNION
  SELECT
    a.year,
    a.month,
    b.dep as code,
    'dep' as type,
    a.one_way,
    sum(a.journeys) as journeys,
    round(sum(a.distance)/sum(a.journeys))*sum(a.passenger_seats) as passengers_distance,
    round(sum(a.distance)/sum(a.journeys))*sum(a.drivers) as drivers_distance
  FROM occupation a
  LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year =  geo.get_latest_millesime()) b ON a.code=b.arr
  GROUP BY 1, 2, 3, 5
  UNION
  SELECT
    a.year,
    a.month,
    b.reg as code,
    'reg' as type,
    a.one_way,
    sum(a.journeys) as journeys,
    round(sum(a.distance)/sum(a.journeys))*sum(a.passenger_seats) as passengers_distance,
    round(sum(a.distance)/sum(a.journeys))*sum(a.drivers) as drivers_distance
  FROM occupation a
  LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year =  geo.get_latest_millesime()) b ON a.code=b.arr
  GROUP BY 1, 2, 3, 5
  UNION
  SELECT
    a.year,
    a.month,
    b.country as code,
    'country' as type,
    a.one_way,
    sum(a.journeys) as journeys,
    round(sum(a.distance)/sum(a.journeys))*sum(a.passenger_seats) as passengers_distance,
    round(sum(a.distance)/sum(a.journeys))*sum(a.drivers) as drivers_distance
  FROM occupation a
  LEFT JOIN  (SELECT * from {{ source('geo','perimeters') }} WHERE year =  geo.get_latest_millesime()) b ON a.code=b.arr
  GROUP BY 1, 2, 3, 5
)
SELECT
  year,
  month,
  code,
  type,
  one_way,
  journeys,
  round((drivers_distance+ passengers_distance)/drivers_distance, 2) as occupation_rate
FROM occupation_agg
WHERE code is not null
AND drivers_distance > 0
AND passengers_distance > 0
ORDER BY 1, 2, 3, 4, 5