{{ config(materialized='view') }}

SELECT
  a._id as carpool_id,
  c.start_geo_code,
  c.end_geo_code,
  a.operator_id,
  CASE WHEN c.start_geo_code ~ '^97[1-2]' THEN a.start_datetime::timestamptz AT TIME ZONE 'America/Guadeloupe'
    WHEN c.start_geo_code ~ '^973' THEN a.start_datetime::timestamptz AT TIME ZONE 'America/Guyana'
    WHEN c.start_geo_code ~ '^974' THEN a.start_datetime::timestamptz AT TIME ZONE 'Indian/Reunion'
    WHEN c.start_geo_code ~ '^976' THEN a.start_datetime::timestamptz AT TIME ZONE 'Indian/Mayotte'
    ELSE a.start_datetime::timestamptz AT TIME ZONE 'Europe/Paris'
  END AS start_datetime,
  CASE WHEN c.end_geo_code ~ '^97[1-2]' THEN a.end_datetime::timestamptz AT TIME ZONE 'America/Guadeloupe'
    WHEN c.end_geo_code ~ '^973' THEN a.end_datetime::timestamptz AT TIME ZONE 'America/Guyana'
    WHEN c.end_geo_code ~ '^974' THEN a.end_datetime::timestamptz AT TIME ZONE 'Indian/Reunion'
    WHEN c.end_geo_code ~ '^976' THEN a.end_datetime::timestamptz AT TIME ZONE 'Indian/Mayotte'
    ELSE a.end_datetime::timestamptz AT TIME ZONE 'Europe/Paris'
  END AS end_datetime,
  (a.end_datetime - a.start_datetime) as duration,
  a.distance,
  a.driver_identity_key,
  a.driver_revenue,
  a.passenger_identity_key,
  a.passenger_seats,
  a.passenger_contribution,
  a.passenger_payments
FROM {{ source('carpool', 'carpools') }} AS a
LEFT JOIN {{ source('carpool', 'status') }} AS b ON a._id = b.carpool_id
LEFT JOIN {{ source('carpool','geo') }} AS c ON a._id = c.carpool_id
WHERE
  c.start_geo_code IS NOT null AND c.end_geo_code IS NOT null
