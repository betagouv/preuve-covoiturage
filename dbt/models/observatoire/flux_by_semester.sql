{{ config(materialized='incremental') }}

WITH flux AS (
  SELECT
    from,
    to,
    extract(
      'year' FROM start_date
    )::int AS year,
    CASE
      WHEN extract('quarter' FROM start_date)::int > 3 THEN 2 ELSE 1
    END    AS semester,
    sum(
      journeys
    )      AS journeys,
    sum(
      drivers
    )      AS drivers,
    sum(
      passengers
    )      AS passengers,
    sum(
      passenger_seats
    )      AS passenger_seats,
    sum(
      distance
    )      AS distance,
    sum(
      duration
    )      AS duration
  FROM {{ ref('carpool_by_day') }}
  {% if is_incremental() %}
    WHERE
      concat(
        extract('year' FROM start_date),
        CASE
          WHEN
            extract('quarter' FROM start_date)::int > 3
            THEN 2
          ELSE 1
        END
      )::int
      >= (SELECT max(concat(year, semester)::int) FROM {{ this }})
  {% endif %}
  GROUP BY
    1, 2, 3, 4
),

flux_agg AS (
  SELECT
    a.year,
    a.semester,
    'com'                                    AS type,
    least(b.arr, c.arr)                      AS territory_1,
    greatest(b.arr, c.arr)                   AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux AS a
  LEFT JOIN
    (
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING least(b.arr, c.arr) IS NOT NULL OR greatest(b.arr, c.arr) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.semester,
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
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING
    least(b.epci, c.epci) IS NOT NULL
    OR greatest(b.epci, c.epci) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.semester,
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
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING least(b.aom, c.aom) IS NOT NULL OR least(b.aom, c.aom) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.semester,
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
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING least(b.dep, c.dep) IS NOT NULL OR greatest(b.dep, c.dep) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.semester,
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
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING least(b.reg, c.reg) IS NOT NULL OR greatest(b.reg, c.reg) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.semester,
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
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT *
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING
    least(b.country, c.country) IS NOT NULL
    OR greatest(b.country, c.country) IS NOT NULL
)

SELECT
  a.year,
  a.semester,
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
    SELECT *
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
  ) AS b
  ON concat(a.territory_1, a.type) = concat(b.territory, b.type)
LEFT JOIN
  (
    SELECT *
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
  ) AS c
  ON concat(a.territory_2, a.type) = concat(c.territory, c.type)
ORDER BY a.territory_1, a.territory_2
