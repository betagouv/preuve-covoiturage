{{ 
  config(
    materialized='incremental',
    unique_key=['territory_id', 'direction', 'start_date', 'operator_id'],
    indexes = [
      {
        'columns':[
          'territory_id',
          'direction',
          'start_date',
          'operator_id',
        ],
        'unique':true
      }
    ]
  )
}}
with directions as (
SELECT
  b.territory_id AS territory_id,
  'from' AS direction,
  a.start_datetime::date AS start_date,
  a.operator_id,
  a.operator_name,
  count(distinct a.carpool_id) filter (where a.start_geo_code <> a.end_geo_code) AS journeys,
  count(distinct a.carpool_id) filter (where coalesce(a.incentive_amount,0) > 0 AND a.start_geo_code <> a.end_geo_code) AS incented_journeys,
  sum(coalesce(a.incentive_amount,0)) filter (where a.start_geo_code <> a.end_geo_code) as incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ ref('view_perimeters_territories') }} b ON a.start_geo_code = b.arr
WHERE
b.territory_id IS NOT NULL 
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3, 4, 5
UNION
SELECT
  b.territory_id AS territory_id,
  'to' AS direction,
  a.start_datetime::date AS start_date,
  a.operator_id,
  a.operator_name,
  count(distinct a.carpool_id) filter (where a.start_geo_code <> a.end_geo_code) AS journeys,
  count(distinct a.carpool_id) filter (where coalesce(a.incentive_amount,0) > 0 AND a.start_geo_code <> a.end_geo_code) AS incented_journeys,
  sum(coalesce(a.incentive_amount,0)) filter (where a.start_geo_code <> a.end_geo_code) as incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ ref('view_perimeters_territories') }} b ON a.start_geo_code = b.arr
WHERE
b.territory_id IS NOT NULL 
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3, 4, 5
UNION
SELECT
  b.territory_id AS territory_id,
  'intra' AS direction,
  a.start_datetime::date AS start_date,
  a.operator_id,
  a.operator_name,
  count(distinct a.carpool_id) filter (where a.start_geo_code = a.end_geo_code) AS journeys,
  count(distinct a.carpool_id) filter (where coalesce(a.incentive_amount,0) > 0 AND a.start_geo_code = a.end_geo_code) AS incented_journeys,
  sum(coalesce(a.incentive_amount,0)) filter (where a.start_geo_code = a.end_geo_code) as incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ ref('view_perimeters_territories') }} b ON a.start_geo_code = b.arr
WHERE
b.territory_id IS NOT NULL 
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3, 4, 5
)
select
  territory_id,
  start_date,
  direction,
  operator_id,
  operator_name,
  sum(journeys)          as journeys,
  sum(incented_journeys) as incented_journeys,
  sum(incentive_amount)  as incentive_amount
from directions
where territory_id is not null
group by 1, 2, 3, 4, 5
UNION
select 
territory_id,
  start_date,
  'both' AS direction,
  operator_id,
  operator_name,
  sum(journeys)          as journeys,
  sum(incented_journeys) as incented_journeys,
  sum(incentive_amount)  as incentive_amount
from directions
group by 1, 2, 3, 4, 5
