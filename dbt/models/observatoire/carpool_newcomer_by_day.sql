{{ config(materialized='incremental',unique_key=['from', 'to', 'start_date']) }}

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
  count(distinct a.driver_id) filter (where d.first_date = a.start_datetime::date)  AS new_drivers,
  count(distinct a.passenger_id) filter (where e.first_date = a.start_datetime::date)  AS new_passengers
FROM {{ ref('view_carpool') }} AS a
LEFT JOIN
  (SELECT * FROM {{ source('geo','com_evolution') }} WHERE year >= 2020) AS b
  ON a.start_geo_code = b.old_com
LEFT JOIN
  (SELECT * FROM {{ source('geo','com_evolution') }} WHERE year >= 2020) AS c
  ON a.end_geo_code = c.old_com
LEFT JOIN 
(select * from {{ref('view_first_date_driver')}}) AS d
  ON a.driver_id = d.driver_id
LEFT JOIN 
(select * from {{ref('view_first_date_passenger')}}) AS e
  ON a.passenger_id = e.passenger_id
WHERE
  a.acquisition_status = 'processed'
  AND a.fraud_status = 'passed'
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3