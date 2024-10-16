{{ config(
    materialized='incremental',
    unique_key=['from', 'to', 'start_date'],
    post_hook=[
      'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '"'carpool_by_day_pkey'"') THEN ALTER TABLE {{ this }} ADD CONSTRAINT carpool_by_day_pkey PRIMARY KEY ("from", "to", start_date); END IF; END $$;'
      'CREATE INDEX IF NOT EXISTS carpool_by_day_idx ON {{ this }} using btree("from", "to", start_date)',
    ]
  )
}}

WITH com_evol AS (
  SELECT * FROM {{ source('geo','com_evolution') }} WHERE year >= 2020
)

SELECT
  coalesce(
    b.new_com,
    a.start_geo_code
  )                              AS from,
  coalesce(
    c.new_com,
    a.end_geo_code
  )                              AS to,
  a.start_datetime::date         AS start_date,
  count(
    *
  )                              AS journeys,
  count(DISTINCT a.driver_id)    AS drivers,
  count(DISTINCT a.passenger_id) AS passengers,
  sum(
    a.passenger_seats
  )                              AS passenger_seats,
  sum(
    a.distance
  )                              AS distance,
  sum(
    a.duration
  )                              AS duration
FROM {{ ref('view_carpool') }} AS a
LEFT JOIN
  com_evol AS b
  ON a.start_geo_code = b.old_com
LEFT JOIN
  com_evol AS c
  ON a.end_geo_code = c.old_com
WHERE
  a.acquisition_status = 'processed'
  AND a.fraud_status = 'passed'
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3