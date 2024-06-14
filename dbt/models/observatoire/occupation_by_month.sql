{{ config(materialized='incremental') }}
SELECT
    origin as code,
    'origin' as one_way,
    extract('year' from start_date)::int as year,
    extract('month' from start_date)::int as month,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance,
    sum(duration) as duration
  FROM {{ ref('flux_by_day') }}
  {% if is_incremental() %}
    where concat(extract('year' from start_date),extract('month' from start_date))::int >= (SELECT MAX(concat(year,month)::int) FROM {{ this }})
  {% endif %}
  GROUP BY 1, 3, 4
UNION
SELECT
    destination as code,
    'destination' as one_way,
    extract('year' from start_date)::int as year,
    extract('month' from start_date)::int as month,
    sum(journeys) as journeys,
    sum(drivers) as drivers,
    sum(passengers) as passengers,
    sum(passenger_seats) as passenger_seats,
    sum(distance) as distance,
    sum(duration) as duration
  FROM {{ ref('flux_by_day') }}
  {% if is_incremental() %}
    where concat(extract('year' from start_date),extract('month' from start_date))::int >= (SELECT MAX(concat(year,month)::int) FROM {{ this }})
  {% endif %}
  GROUP BY 1, 3, 4