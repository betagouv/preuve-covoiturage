{{ 
    config(
    materialized = 'table' if target.name == 'dev' else 'incremental',
    incremental_strategy = 'delete+insert', 
    unique_key=[ 'operator_journey_id', '_id'],
    indexes = [
      {
        'columns':[
          'operator_journey_id'
        ],
      },
       {
        'columns':[
          '_id'
        ],
      }
    ]
  )
}}

SELECT
  r._id,
  r.operator_journey_id,
  ARRAY_AGG(fl.label) AS fraud_labels,
  ARRAY_AGG(al.label) AS anomaly_labels,
  SUM(pi.amount)      AS sum_incentives
FROM {{ ref('0_raw_trips') }} AS r
LEFT JOIN {{ source('fraudcheck', 'labels') }} AS fl ON r._id = fl.carpool_id
LEFT JOIN {{ source('anomaly', 'labels') }} AS al ON r._id = al.carpool_id
LEFT JOIN
  {{ source('policy', 'incentives') }} AS pi
  ON r.operator_journey_id = pi.operator_journey_id
{% if is_incremental() %}
  WHERE r.start_datetime::date >= (SELECT MAX(start_datetime) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2
{% if target.name == 'dev' %}
  LIMIT 5000
{% endif %}
