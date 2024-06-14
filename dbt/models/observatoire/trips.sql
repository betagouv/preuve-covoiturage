{{ config(materialized='incremental') }}

WITH carpool_intervals AS (
  SELECT 
    carpool_id,
    driver_id,
    start_geo_code,
    end_geo_code,
    start_datetime,
    (start_datetime - LAG(end_datetime) OVER cw) AS interval,
    LAG(start_geo_code) OVER cw AS previous_start_geo_code,
    LAG(end_geo_code) OVER cw AS previous_end_geo_code,
    CASE 
      WHEN (start_datetime - LAG(end_datetime) OVER cw) IS NULL THEN gen_random_uuid()
      WHEN (start_datetime - LAG(end_datetime) OVER cw) > '00:30:00' THEN gen_random_uuid()
      ELSE NULL 
    END AS trip_id
  FROM {{ ref('view_carpool') }} 
  WHERE acquisition_status = 'processed' 
  AND fraud_status = 'passed'
  {% if is_incremental() %}
    AND start_datetime >= (SELECT MAX(start_datetime) FROM {{ this }})
  {% endif %}
  WINDOW cw AS (PARTITION BY driver_id, driver_phone ORDER BY start_datetime)
),
trips as (
	select distinct trip_id, driver_id from carpool_intervals where trip_id is not null and driver_id is not null
)
select distinct on (a.carpool_id)
case when a.trip_id is null and a.interval <= '00:00:00' then b.trip_id 
when a.trip_id is null and a.interval <= '00:10:00' and (a.start_geo_code <> a.previous_end_geo_code and a.end_geo_code <> a.previous_start_geo_code) then b.trip_id
when a.trip_id is not null then a.trip_id
else gen_random_uuid() end as _id,
a.carpool_id,
a.start_datetime
from carpool_intervals a
left join trips b on a.driver_id = b.driver_id and a.trip_id is null
