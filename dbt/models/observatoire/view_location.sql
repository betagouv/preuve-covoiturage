{{ config(materialized='view') }}

SELECT
  a._id              AS carpool_id,
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
  st_y(start_position::geometry) as start_lat, 
  st_x(start_position::geometry) as start_lon,
  st_y(end_position::geometry) as end_lat, 
  st_x(end_position::geometry) as end_lon
FROM {{ source('carpool', 'carpools') }} AS a
LEFT JOIN {{ source('carpool', 'status') }} AS b ON a._id = b.carpool_id
LEFT JOIN {{ source('carpool','geo') }} AS c ON a._id = c.carpool_id
WHERE
  date_part('year', a.start_datetime) >= 2020
  AND a.start_datetime < now() - interval '8' day
  AND b.acquisition_status = 'processed'
  AND b.fraud_status = 'passed'
