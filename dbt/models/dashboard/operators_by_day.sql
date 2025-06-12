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
  c.territory_id AS territory_id,
  'from' AS direction,
  a.start_datetime::date AS start_date,
  a.operator_id,
  a.operator_name,
  count(distinct a.carpool_id) filter (where b.territory_id = c.territory_id) AS journeys,
  count(distinct a.carpool_id) filter (where a.incentive_amount > 0 AND b.territory_id = c.territory_id) AS incented_journeys,
  sum(a.incentive_amount) filter (where b.territory_id = c.territory_id) as incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ ref('view_perimeters_territories') }} b ON a.start_geo_code = b.arr
LEFT JOIN {{ source('policy', 'policies') }} c ON a.policy_id = c._id
WHERE
c.territory_id IS NOT NULL 
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3, 4, 5
UNION
SELECT
  c.territory_id AS territory_id,
  'to' AS direction,
  a.start_datetime::date AS start_date,
  a.operator_id,
  a.operator_name,
  count(distinct a.carpool_id) filter (where b.territory_id = c.territory_id) AS journeys,
  count(distinct a.carpool_id) filter (where a.incentive_amount > 0 AND b.territory_id = c.territory_id) AS incented_journeys,
  sum(a.incentive_amount) filter (where b.territory_id = c.territory_id) as incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ ref('view_perimeters_territories') }} b ON a.end_geo_code = b.arr
LEFT JOIN {{ source('policy', 'policies') }} c ON a.policy_id = c._id
WHERE
c.territory_id IS NOT NULL 
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3, 4, 5
UNION
SELECT
  c.territory_id AS territory_id,
  'intra' AS direction,
  a.start_datetime::date AS start_date,
  a.operator_id,
  a.operator_name,
  count(distinct a.carpool_id) filter (where b.territory_id = c.territory_id) AS journeys,
  count(distinct a.carpool_id) filter (where a.incentive_amount > 0 AND b.territory_id = c.territory_id) AS incented_journeys,
  sum(a.incentive_amount) filter (where b.territory_id = c.territory_id) as incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ ref('view_perimeters_territories') }} b ON a.start_geo_code = b.arr and a.end_geo_code = b.arr
LEFT JOIN {{ source('policy', 'policies') }} c ON a.policy_id = c._id
WHERE
c.territory_id IS NOT NULL 
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
  sum(journeys) filter (where direction <> 'intra') - sum(journeys) filter (where direction = 'intra') as journeys,
  sum(incented_journeys) filter (where direction <> 'intra') - sum(incented_journeys) filter (where direction = 'intra') as incented_journeys,
  sum(incentive_amount) filter (where direction <> 'intra') - sum(incentive_amount) filter (where direction = 'intra') as incentive_amount
from directions
group by 1, 2, 3, 4, 5
