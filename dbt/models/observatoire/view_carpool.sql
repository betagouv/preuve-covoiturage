{{ config(materialized='view') }}

SELECT
  a._id              AS carpool_id,
  c.start_geo_code,
  c.end_geo_code,
  a.operator_id,
  a.distance,
  a.driver_revenue,
  a.passenger_seats,
  a.passenger_contribution,
  a.passenger_payments,
  b.acquisition_status,
  b.fraud_status,
  CASE
    WHEN
      c.start_geo_code::text ~ '^97[1-2]'::text
      THEN (a.start_datetime AT TIME ZONE 'America/Guadeloupe'::text)
    WHEN
      c.start_geo_code::text ~ '^973'::text
      THEN (a.start_datetime AT TIME ZONE 'America/Guyana'::text)
    WHEN
      c.start_geo_code::text ~ '^974'::text
      THEN (a.start_datetime AT TIME ZONE 'Indian/Reunion'::text)
    WHEN
      c.start_geo_code::text ~ '^976'::text
      THEN (a.start_datetime AT TIME ZONE 'Indian/Mayotte'::text)
    ELSE (a.start_datetime AT TIME ZONE 'Europe/Paris'::text)
  END                AS start_datetime,
  CASE
    WHEN
      c.end_geo_code::text ~ '^97[1-2]'::text
      THEN (a.end_datetime AT TIME ZONE 'America/Guadeloupe'::text)
    WHEN
      c.end_geo_code::text ~ '^973'::text
      THEN (a.end_datetime AT TIME ZONE 'America/Guyana'::text)
    WHEN
      c.end_geo_code::text ~ '^974'::text
      THEN (a.end_datetime AT TIME ZONE 'Indian/Reunion'::text)
    WHEN
      c.end_geo_code::text ~ '^976'::text
      THEN (a.end_datetime AT TIME ZONE 'Indian/Mayotte'::text)
    ELSE (a.end_datetime AT TIME ZONE 'Europe/Paris'::text)
  END                AS end_datetime,
  a.end_datetime
  - a.start_datetime AS duration,
  coalesce(
    a.driver_identity_key,
    a.driver_operator_user_id,
    a.driver_phone,
    a.driver_phone_trunc
  )                  AS driver_id,
  coalesce(
    a.passenger_identity_key,
    a.passenger_operator_user_id,
    a.passenger_phone,
    a.passenger_phone_trunc
  )                  AS passenger_id
FROM {{ source('carpool', 'carpools') }} AS a
LEFT JOIN {{ source('carpool', 'status') }} AS b ON a._id = b.carpool_id
LEFT JOIN {{ source('carpool','geo') }} AS c ON a._id = c.carpool_id
WHERE
  c.start_geo_code IS NOT NULL
  AND c.end_geo_code IS NOT NULL
  AND date_part('year', a.start_datetime) >= 2020
  AND a.start_datetime < now() - interval '8' day
