{{ config(
  materialized='table',
  unique_key=['_id'],
) }}

SELECT *
FROM {{ ref('dbt_trips_raw') }}
ORDER BY _start_at
