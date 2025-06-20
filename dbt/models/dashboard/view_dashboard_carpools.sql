{{ config(materialized='view') }}

SELECT
  a.uuid                 AS carpool_id,
  a.operator_id,
  d.policy_id,
  d.status AS policy_status,
  coalesce(d.amount, 0) AS incentive_amount,
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
  END                   AS start_datetime
FROM {{ source('carpool', 'carpools') }} AS a
LEFT JOIN {{ source('carpool', 'status') }} AS b ON a._id = b.carpool_id
LEFT JOIN {{ source('carpool','geo') }} AS c ON a._id = c.carpool_id
LEFT JOIN {{ source('policy','incentives') }} AS d ON a.operator_id = d.operator_id AND a.operator_journey_id = d.operator_journey_id
WHERE
  date_part('year', a.start_datetime) >= 2020
  AND a.start_datetime < now() - INTERVAL '2' DAY
  AND b.acquisition_status = 'processed'
  AND b.fraud_status = 'passed'
  AND b.anomaly_status = 'passed'
  AND d.policy_id IS NOT NULL
