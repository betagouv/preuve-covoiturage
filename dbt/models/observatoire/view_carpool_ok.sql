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
  a.driver_id,
  a.passenger_id,
  a.passenger_seats,
  a.distance,
  a.duration
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