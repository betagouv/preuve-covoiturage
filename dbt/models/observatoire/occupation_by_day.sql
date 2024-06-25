{{ config(materialized='incremental') }}
SELECT
    origin as code,
    'origin' as one_way,
    start_date,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance
  FROM {{ ref('flux_by_day') }}
  {% if is_incremental() %}
    where start_date >= (SELECT MAX(start_date) FROM {{ this }})
  {% endif %}
  GROUP BY 1, 3
UNION
SELECT
    destination as code,
    'destination' as one_way,
    start_date,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance
  FROM {{ ref('flux_by_day') }}
  {% if is_incremental() %}
    where start_date >= (SELECT MAX(start_date) FROM {{ this }})
  {% endif %}
  GROUP BY 1, 3