{{ 
  config(
    materialized='incremental',
    unique_key=['territory_id', 'start_date', 'operator_id'],
    indexes = [
      {
        'columns':[
          'territory_id',
          'start_date',
          'operator_id',
        ],
        'unique':true
      }
    ]
  )
}}

SELECT 
  b.territory_id,
  a.start_datetime::date as start_date,
  a.operator_id,
  COUNT(distinct a.carpool_id) AS journeys,
  COUNT(distinct a.carpool_id) FILTER (WHERE a.incentive_amount > 0 AND a.policy_status = 'validated') AS incented_journeys,
  SUM(a.incentive_amount) FILTER (WHERE a.policy_status = 'validated') AS incentive_amount
FROM {{ ref('view_dashboard_carpools') }} a
LEFT JOIN {{ source('policy', 'policies') }} b ON a.policy_id = b._id
{% if is_incremental() %}
  WHERE a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY 1, 2, 3
  