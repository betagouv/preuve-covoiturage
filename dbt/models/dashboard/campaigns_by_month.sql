{{ 
  config(
    materialized='incremental',
    unique_key=['year', 'month','campaign_id', 'operator_id'],
    indexes = [
      {
        'columns':[
          'year',
          'month',
          'campaign_id',
          'operator_id',
        ],
        'unique':true
      }
    ]
  )
}}

SELECT
  extract('year' FROM start_date)::int  AS year,
  extract('month' FROM start_date)::int AS month,
  campaign_id,
  operator_id,
  sum(journeys)                         AS journeys,
  sum(incented_journeys)                AS incented_journeys,
  sum(incentive_amount)                 AS incentive_amount
FROM {{ ref('campaigns_by_day') }}
{% if is_incremental() %}
  WHERE
    (extract('year' FROM start_date) * 100 + extract('month' FROM start_date))
    >= (SELECT max(year * 100 + month) FROM {{ this }})
{% endif %}
GROUP BY 1, 2, 3, 4
  