{{ config(materialized='incremental', unique_key='created_at') }}

SELECT
  TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at,
  COUNT(*) AS count
FROM {{ source('carpool', 'carpools') }}

{% if is_incremental() %}
  WHERE created_at::date >= (SELECT MAX(created_at) FROM {{ this }})::date
{% endif %}

GROUP BY 1
