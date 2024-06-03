{{ config(materialized='incremental') }}

WITH flux AS (
  SELECT
    origin,
    destination,
    extract('year' from start_date)::int as year,
    extract('month' from start_date)::int as month,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance,
    sum(duration) as duration
  FROM {{ ref('flux_by_day') }}
  {% if is_incremental() %}
    where concat(extract('year' from start_date),extract('month' from start_date))::int >= SELECT MAX(concat(year,month)::int) FROM {{ this }}
  {% endif %}
  GROUP BY
  1, 2, 3, 4
),
flux_agg as (
  SELECT 
    year,
    month,
    'com' AS type,
    LEAST(b.arr, c.arr) as territory_1,
    GREATEST(b.arr, c.arr) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    round(sum(duration)::numeric/60,2) as duration
    FROM flux a
    LEFT JOIN ref('perim_centroid') b ON a.origin=b.arr and a.year = b.year
    LEFT JOIN ref('perim_centroid') c ON a.destination=c.arr and a.year = c.year
    GROUP BY 1, 2, 4, 5
    HAVING 4 IS NOT NULL OR 5 IS NOT NULL
  UNION
  SELECT 
    year,
    month,
    'epci' AS type,
    LEAST(b.epci, c.epci) as territory_1,
    GREATEST(b.epci, c.epci) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    round(sum(duration)::numeric/60,2) as duration
    FROM flux a
    LEFT JOIN ref('perim_centroid') b ON a.origin=b.arr and a.year = b.year
    LEFT JOIN ref('perim_centroid') c ON a.destination=c.arr and a.year = c.year
    GROUP BY 1, 2, 4, 5
    HAVING 4 IS NOT NULL OR 5 IS NOT NULL
  UNION
  SELECT 
    year,
    month,
    'aom' AS type,
    LEAST(b.aom, c.aom) as territory_1,
    GREATEST(b.aom, c.aom) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    round(sum(duration)::numeric/60,2) as duration
    FROM flux a
    LEFT JOIN ref('perim_centroid') b ON a.origin=b.arr and a.year = b.year
    LEFT JOIN ref('perim_centroid') c ON a.destination=c.arr and a.year = c.year
    GROUP BY 1, 2, 4, 5
    HAVING 4 IS NOT NULL OR 5 IS NOT NULL
  UNION
  SELECT 
    year,
    month,
    'dep' AS type,
    LEAST(b.dep, c.dep) as territory_1,
    GREATEST(b.dep, c.dep) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    round(sum(duration)::numeric/60,2) as duration
    FROM flux a
    LEFT JOIN ref('perim_centroid') b ON a.origin=b.arr and a.year = b.year
    LEFT JOIN ref('perim_centroid') c ON a.destination=c.arr and a.year = c.year
    GROUP BY 1, 2, 4, 5
    HAVING 4 IS NOT NULL OR 5 IS NOT NULL
  UNION
  SELECT 
    year,
    month,
    'reg' AS type,
    LEAST(b.reg, c.reg) as territory_1,
    GREATEST(b.reg, c.reg) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    round(sum(duration)::numeric/60,2) as duration
    FROM flux a
    LEFT JOIN ref('perim_centroid') b ON a.origin=b.arr and a.year = b.year
    LEFT JOIN ref('perim_centroid') c ON a.destination=c.arr and a.year = c.year
    GROUP BY 1, 2, 4, 5
    HAVING 4 IS NOT NULL OR 5 IS NOT NULL
  UNION
  SELECT 
    year,
    month,
    'country' AS type,
    LEAST(b.country, c.country) as territory_1,
    GREATEST(b.country, c.country) as territory_2,
    sum(journeys) as journeys,
    sum(passenger_seats) as passengers,
    round(sum(distance)::numeric/1000,2) as distance,
    round(sum(duration)::numeric/60,2) as duration
    FROM flux a
    LEFT JOIN ref('perim_centroid') b ON a.origin=b.arr and a.year = b.year
    LEFT JOIN ref('perim_centroid') c ON a.destination=c.arr and a.year = c.year
    GROUP BY 1, 2, 4, 5
    HAVING 4 IS NOT NULL OR 5 IS NOT NULL
)

SELECT 
  a.year, 
  a.month, 
  a.type,
  a.territory_1,
  b.l_territory as l_territory_1,
  st_x(b.geom) as lng_1,
  st_y(b.geom) as lat_1, 
  a.territory_2, 
  st_x(c.geom) as lng_2,
  st_y(c.geom) as lat_2,
  a.journeys
  a.passengers,
  a.distance,
  a.duration 
FROM flux_agg a
LEFT JOIN ref('perim_centroid') b on concat(a.territory_1,a.type) = concat(b.territory,b.type) 
LEFT JOIN ref('perim_centroid') c on concat(a.territory_2,a.type) = concat(c.territory,c.type)
ORDER BY a.territory_1,a.territory_2