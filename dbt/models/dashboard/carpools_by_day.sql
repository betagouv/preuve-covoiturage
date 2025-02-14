{{ config(
    materialized='incremental',
    unique_key=['from', 'to', 'start_date', 'operator_id'],
    post_hook=[
      'CREATE INDEX IF NOT EXISTS carpools_by_day_idx ON {{ this }} using btree("from", "to", start_date, operator_id)',
    ]
  )
}}

SELECT
  b.territory_id AS from,
  c.territory_id AS to,
  start_datetime::date AS start_date,
  operator_id,
  operator_name,
  count(*) AS journeys,
  count(*) filter (where coalesce(incentive_amount,0) > 0) AS incented_journeys,
  sum(incentive_amount) as incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ ref('view_perimeters_territories') }} b ON a.start_geo_code = b.arr
LEFT JOIN {{ ref('view_perimeters_territories') }} c ON a.end_geo_code = c.arr
WHERE
b.territory_id IS NOT NULL 
OR c.territory_id IS NOT NULL
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3, 4, 5
