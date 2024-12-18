{{ config(
    materialized='incremental',
    unique_key=['year', 'code', 'type', 'direction'],
    post_hook=[
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'occupation_by_year_pkey') THEN ALTER TABLE {{ this }} ADD CONSTRAINT occupation_by_year_pkey PRIMARY KEY (year, code, type, direction); END IF; END $$;"
      "CREATE INDEX IF NOT EXISTS occupation_by_year_idx ON {{ this }} using btree(year, code, type, direction)",
    ]
  )
}}

WITH sum_distance AS (
  SELECT
    code,
    type,
    direction,
    extract('year' FROM start_date)::int AS year,
    sum(journeys)                        AS journeys,
    round(sum(distance) / sum(journeys))
    * sum(passenger_seats)               AS passengers_distance,
    round(sum(distance) / sum(journeys))
    * sum(drivers)                       AS drivers_distance
  FROM {{ ref('directions_by_day') }}
  {% if is_incremental() %}
    WHERE
      extract('year' FROM start_date)::int
      >= (SELECT max(year) FROM {{ this }})
  {% endif %}
  GROUP BY 1, 2, 3, 4
  HAVING sum(journeys) > 0
)

SELECT
  a.year,
  a.code,
  b.l_territory                 AS libelle,
  a.type,
  a.direction,
  a.journeys::int,
  round(
    (drivers_distance + passengers_distance) / drivers_distance, 2
  )::float                      AS occupation_rate,
  st_asgeojson(b.geom, 6)::json AS geom
FROM sum_distance AS a
LEFT JOIN
  (
    SELECT
      territory,
      l_territory,
      type,
      geom
    FROM {{ source('geo', 'perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
  ) AS b
  ON a.code = b.territory AND a.type = b.type
WHERE
  a.code IS NOT null
  AND a.drivers_distance > 0
  AND a.passengers_distance > 0
ORDER BY 1, 2, 4, 5
