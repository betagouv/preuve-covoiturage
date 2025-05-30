{{ config(
  materialized='incremental',
  incremental_strategy='delete+insert',
  unique_key=['year', 'type', 'territory_1', 'territory_2'],
  indexes = [
      {
        'columns':[
          'year',
          'type',
          'territory_1',
          'territory_2'
        ],
        'unique':true
      }
    ] 
) }}

WITH flux AS (
  SELECT
    "from",
    "to",
    extract('year' FROM start_date)::int AS year,
    sum(journeys)                        AS journeys,
    sum(drivers)                         AS drivers,
    sum(passengers)                      AS passengers,
    sum(passenger_seats)                 AS passenger_seats,
    sum(distance)                        AS distance,
    sum(duration)                        AS duration
  FROM {{ ref('carpool_by_day') }}
  {% if is_incremental() %}
    WHERE
      extract('year' FROM start_date)::int
      >= (SELECT max(year) FROM {{ this }})
  {% endif %}
  GROUP BY
    1, 2, 3
),

flux_agg AS (
  SELECT
    year,
    'com'                                    AS type,
    least("from", "to")                      AS territory_1,
    greatest("from", "to")                   AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux
  GROUP BY 1, 3, 4
  HAVING least("from", "to") IS NOT NULL OR greatest("from", "to") IS NOT NULL
  UNION
  SELECT
    a.year,
    'epci'                                   AS type,
    least(b.epci, c.epci)                    AS territory_1,
    greatest(b.epci, c.epci)                 AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux AS a
  LEFT JOIN
    (
      SELECT
        arr,
        epci
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT
        arr,
        epci
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 3, 4
  HAVING
    least(b.epci, c.epci) IS NOT NULL
    OR greatest(b.epci, c.epci) IS NOT NULL
  UNION
  SELECT
    a.year,
    'aom'                                    AS type,
    least(b.aom, c.aom)                      AS territory_1,
    greatest(b.aom, c.aom)                   AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux AS a
  LEFT JOIN
    (
      SELECT
        arr,
        aom
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT
        arr,
        aom
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 3, 4
  HAVING least(b.aom, c.aom) IS NOT NULL OR least(b.aom, c.aom) IS NOT NULL
  UNION
  SELECT
    a.year,
    'dep'                                    AS type,
    least(b.dep, c.dep)                      AS territory_1,
    greatest(b.dep, c.dep)                   AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux AS a
  LEFT JOIN
    (
      SELECT
        arr,
        dep
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT
        arr,
        dep
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 3, 4
  HAVING least(b.dep, c.dep) IS NOT NULL OR greatest(b.dep, c.dep) IS NOT NULL
  UNION
  SELECT
    a.year,
    'reg'                                    AS type,
    least(b.reg, c.reg)                      AS territory_1,
    greatest(b.reg, c.reg)                   AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux AS a
  LEFT JOIN
    (
      SELECT
        arr,
        reg
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT
        arr,
        reg
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 3, 4
  HAVING least(b.reg, c.reg) IS NOT NULL OR greatest(b.reg, c.reg) IS NOT NULL
  UNION
  SELECT
    a.year,
    'country'                                AS type,
    least(b.country, c.country)              AS territory_1,
    greatest(b.country, c.country)           AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux AS a
  LEFT JOIN
    (
      SELECT
        arr,
        country
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT
        arr,
        country
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 3, 4
  HAVING
    least(b.country, c.country) IS NOT NULL
    OR greatest(b.country, c.country) IS NOT NULL
)

SELECT
  a.year,
  a.type,
  a.territory_1,
  b.l_territory AS l_territory_1,
  a.territory_2,
  c.l_territory AS l_territory_2,
  a.journeys,
  a.passengers,
  a.distance,
  a.duration,
  st_x(b.geom)  AS lng_1,
  st_y(b.geom)  AS lat_1,
  st_x(c.geom)  AS lng_2,
  st_y(c.geom)  AS lat_2
FROM flux_agg AS a
LEFT JOIN
  (
    SELECT
      territory,
      type,
      l_territory,
      geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
    UNION
    SELECT
      territory,
      'com',
      l_territory,
      geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE
      year = geo.get_latest_millesime()
      AND type = 'country'
  ) AS b
  ON concat(a.territory_1, a.type) = concat(b.territory, b.type)
LEFT JOIN
  (
    SELECT
      territory,
      type,
      l_territory,
      geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
    UNION
    SELECT
      territory,
      'com',
      l_territory,
      geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE
      year = geo.get_latest_millesime()
      AND type = 'country'
  ) AS c
  ON concat(a.territory_2, a.type) = concat(c.territory, c.type)
ORDER BY a.territory_1, a.territory_2
