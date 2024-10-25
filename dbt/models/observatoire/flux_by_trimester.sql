{{ config(materialized='incremental',
  unique_key=['year', 'trimester', 'type', 'territory_1', 'territory_2'],
  post_hook=[
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'flux_by_trimester_pkey') THEN ALTER TABLE {{ this }} ADD CONSTRAINT flux_by_trimester_pkey PRIMARY KEY (type, year, trimester, territory_1, territory_2); END IF; END $$;"
    "CREATE INDEX IF NOT EXISTS flux_by_trimester_idx ON {{ this }} using btree(year, trimester, type, territory_1, territory_2)",
  ]
) }}

WITH flux AS (
  SELECT
    "from",
    "to",
    extract('year' FROM start_date)::int    AS year,
    extract('quarter' FROM start_date)::int AS trimester,
    sum(journeys)                           AS journeys,
    sum(drivers)                            AS drivers,
    sum(passengers)                         AS passengers,
    sum(passenger_seats)                    AS passenger_seats,
    sum(distance)                           AS distance,
    sum(duration)                           AS duration
  FROM {{ ref('carpool_by_day') }}
  {% if is_incremental() %}
    WHERE
      (extract('year' FROM start_date) * 10 + extract('quarter' FROM start_date))
      >= (SELECT max(year * 10 + trimester) FROM {{ this }})
  {% endif %}
  GROUP BY
    1, 2, 3, 4
),

flux_agg AS (
  SELECT
    year,
    trimester,
    'com'                                    AS type,
    least("from", "to")                      AS territory_1,
    greatest("from", "to")                   AS territory_2,
    sum(journeys)                            AS journeys,
    sum(passenger_seats)                     AS passengers,
    round(sum(distance)::numeric / 1000, 2)  AS distance,
    extract('epoch' FROM sum(duration)) / 60 AS duration
  FROM flux
  GROUP BY 1, 2, 4, 5
  HAVING least("from", "to") IS NOT NULL OR greatest("from", "to") IS NOT NULL
  UNION
  SELECT
    a.year,
    a.trimester,
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
      SELECT arr,epci
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT arr,epci
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
    a.trimester,
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
      SELECT arr,aom
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT arr,aom
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING least(b.aom, c.aom) IS NOT NULL OR least(b.aom, c.aom) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.trimester,
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
      SELECT arr,dep
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT arr,dep
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING least(b.dep, c.dep) IS NOT NULL OR greatest(b.dep, c.dep) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.trimester,
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
      SELECT arr,reg
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT arr,reg
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS c
    ON a.to = c.arr
  GROUP BY 1, 2, 4, 5
  HAVING least(b.reg, c.reg) IS NOT NULL OR greatest(b.reg, c.reg) IS NOT NULL
  UNION
  SELECT
    a.year,
    a.trimester,
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
      SELECT arr,country
      FROM {{ source('geo','perimeters') }}
      WHERE year = geo.get_latest_millesime()
    ) AS b
    ON a.from = b.arr
  LEFT JOIN
    (
      SELECT arr,country
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
  a.trimester,
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
    SELECT territory, type, l_territory, geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
    UNION
    SELECT territory, 'com', l_territory, geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
    AND type = 'country'
  ) AS b
  ON concat(a.territory_1, a.type) = concat(b.territory, b.type)
LEFT JOIN
  (
    SELECT territory, type, l_territory, geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
    UNION
    SELECT territory, 'com', l_territory, geom
    FROM {{ source('geo','perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
    AND type = 'country'
  ) AS c
  ON concat(a.territory_2, a.type) = concat(c.territory, c.type)
ORDER BY a.territory_1, a.territory_2