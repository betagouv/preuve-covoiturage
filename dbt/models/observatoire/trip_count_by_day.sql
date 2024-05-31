{{ config(materialized='incremental') }}

SELECT
  c.start_geo_code,
  c.end_geo_code,
  CASE WHEN c.start_geo_code ~ '^97[1-2]' THEN a.start_datetime::timestamptz AT TIME ZONE 'America/Guadeloupe'
    WHEN c.start_geo_code ~ '^973' THEN a.start_datetime::timestamptz AT TIME ZONE 'America/Guyana'
    WHEN c.start_geo_code ~ '^974' THEN a.start_datetime::timestamptz AT TIME ZONE 'Indian/Reunion'
    WHEN c.start_geo_code ~ '^976' THEN a.start_datetime::timestamptz AT TIME ZONE 'Indian/Mayotte'
    ELSE a.start_datetime::timestamptz AT TIME ZONE 'Europe/Paris'
  END AS start_datetime,
  COUNT(*) AS journeys
FROM {{ source('carpool', 'carpools') }} AS a
LEFT JOIN {{ source('carpool', 'status') }} AS b ON a._id = b.carpool_id
LEFT JOIN {{ source('carpool','geo') }} AS c ON a._id = c.carpool_id
WHERE
  c.start_geo_code IS NOT null AND c.end_geo_code IS NOT null
{% if is_incremental() %}
  AND start_datetime::date >= (SELECT MAX(start_datetime) FROM {{ this }})::date
{% endif %}
GROUP BY
 1, 2, 3
