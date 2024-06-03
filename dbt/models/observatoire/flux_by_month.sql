{{ config(materialized='incremental') }}

SELECT
  origin,
  destination,
  extract('year' from start_date)::int as year,
  extract('month' from start_date)::int as month,
  sum(journeys) as journeys,
  sum(drivers) as drivers,
  sum(passengers) as passengers,
  sum(passenger_seats) as passenger_seats,
  sum(distance) as distance
FROM {{ ref('flux_by_day') }}
{% if is_incremental() %}
  where concat(extract('year' from start_date),extract('month' from start_date))::int >= SELECT MAX(concat(year,month)::int) FROM {{ this }}
{% endif %}
GROUP BY
 1, 2, 3, 4