{{ config(materialized='view') }}

SELECT
  a._id AS carpool_id,
  c.start_geo_code,
  c.end_geo_code,
  a.operator_id,
  d.name AS operator_name,
  e.amount AS incentive_amount,
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
  END                AS start_datetime
FROM {{ source('carpool', 'carpools') }} AS a
LEFT JOIN {{ source('carpool', 'status') }} AS b ON a._id = b.carpool_id
LEFT JOIN {{ source('carpool','geo') }} AS c ON a._id = c.carpool_id
LEFT JOIN {{ source('operator','operators') }} AS d on a.operator_id = d._id
LEFT JOIN {{ source('policy','incentives') }} e on a._id = e.carpool_id
WHERE
  date_part('year', a.start_datetime) >= 2020
  AND a.start_datetime < now() - interval '2' day
  AND b.acquisition_status = 'processed'
  AND b.fraud_status = 'passed'
  AND b.anomaly_status = 'passed'