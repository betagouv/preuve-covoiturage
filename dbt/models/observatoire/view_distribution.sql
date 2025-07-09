{{ config(materialized='view') }}

select 
  coalesce(
    b.new_com,
    a.start_geo_code
  )                              AS start,
  coalesce(
    c.new_com,
    a.end_geo_code
  )                              AS end,
  a.start_datetime::date         AS start_date,
  extract('hour' from  a.start_datetime) as hour,
  CASE WHEN a.distance < 10000 then '0-10'
    WHEN (a.distance >= 10000 AND a.distance < 20000) THEN '10-20'
    WHEN (a.distance >= 20000 AND a.distance < 30000) THEN '20-30'
    WHEN (a.distance >= 30000 AND a.distance < 40000) THEN '30-40'
    WHEN (a.distance >= 40000 AND a.distance < 50000) THEN '40-50'
  ELSE '>50' END as dist_classes
  FROM {{ ref('view_carpool') }} AS a
  LEFT JOIN
    (SELECT * FROM {{ source('geo','com_evolution') }} WHERE year >= 2020) AS b
    ON a.start_geo_code = b.old_com
  LEFT JOIN
    (SELECT * FROM {{ source('geo','com_evolution') }} WHERE year >= 2020) AS c
    ON a.end_geo_code = c.old_com
  WHERE
    a.acquisition_status = 'processed'
    AND a.fraud_status = 'passed'
    AND a.anomaly_status = 'passed'