{{ config(materialized='incremental') }}

SELECT
  start_geo_code as origin,
  end_geo_code as destination,
  start_datetime::date AS start_date,
  COUNT(*) AS journeys,
  count(distinct driver_identity_key) as drivers,
  count(distinct passenger_identity_key) as passengers,
  sum(passenger_seats) as passenger_seats,
  sum(distance) as distance,
  sum(duration) as duration
FROM {{ ref('view_carpool') }}
WHERE
  start_geo_code IS NOT null AND end_geo_code IS NOT null
{% if is_incremental() %}
  AND start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
 1, 2, 3
