{{ config(materialized='incremental') }}

SELECT
  CASE WHEN b.new_com IS null then a.start_geo_code else b.new_com end as origin,
  CASE WHEN c.new_com IS null then a.end_geo_code else c.new_com end as destination,
  a.start_datetime::date AS start_date,
  COUNT(*) AS journeys,
  count(distinct a.driver_id) as drivers,
  count(distinct a.passenger_id) as passengers,
  sum(a.passenger_seats) as passenger_seats,
  sum(a.distance) as distance,
  sum(a.duration) as duration
FROM {{ ref('view_carpool') }} a
LEFT JOIN (SELECT * FROM {{ source('geo','com_evolution') }} where year >= 2020) b on a.start_geo_code = b.old_com
LEFT JOIN (SELECT * FROM {{ source('geo','com_evolution') }} where year >= 2020) c on a.end_geo_code = c.old_com
WHERE a.acquisition_status = 'processed'
AND a.fraud_status = 'passed'
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
 1, 2, 3
