{{ 
    config(
    materialized = 'table' if target.name == 'dev' else 'incremental',
    unique_key=[ 'cc_operator_journey_id', 'cc__id'],
    indexes = [
      {
        'columns':[
          'cc_operator_journey_id'
        ],
      },
       {
        'columns':[
          'cc__id'
        ],
      }
    ]
  )
}}

SELECT
    r.cc_operator_journey_id as cc_operator_journey_id,
    r.cc__id as cc__id,
    ARRAY_AGG(fl.label) AS fraud_labels,
    ARRAY_AGG(al.label) AS anomaly_labels,
    SUM(pi.amount) as sum_incentives_amount
FROM {{ ref('0_raw_trips') }} r
LEFT JOIN  {{ source('fraudcheck', 'labels') }} fl ON fl.carpool_id = r.cc__id
LEFT JOIN  {{ source('anomaly', 'labels') }} al    ON al.carpool_id = r.cc__id
LEFT JOIN  {{ source('policy', 'incentives') }} pi    ON pi.operator_journey_id = r.cc_operator_journey_id
GROUP BY {{ dbt_utils.star(from=ref('0_raw_trips')) }}