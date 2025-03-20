{{
  config(
    materialized = 'incremental',
    unique_key = [
      'start_geo_code',
      'end_geo_code',
      'start_datetime',
      'distance_50m'
    ],
    indexes = [
      {
        'columns':[
          'start_geo_code',
          'end_geo_code',
          'start_datetime',
          'distance_50m'
        ],
        'unique':true

      }
    ]
    )
}}

with incentives as (
  select
    carpool_id,
    sum(i.amount)         as total_amount,
    count(distinct i._id) as num_incitations
  from {{ source('carpool', 'operator_incentives') }} as i
  inner join
    {{ source('carpool', 'carpools') }} as c
    on
      i.carpool_id = c._id
      {% if is_incremental() %}
        and c.start_datetime
        >= (
          select date_trunc('week', max(start_datetime))
          from {{ this }}
        )
      {% else %}
        and c.start_datetime >= now() - interval '1 year'
      {% endif %}
  group by 1
),

groups as (
  select
    g.start_geo_code,
    g.end_geo_code,
    c.start_datetime,
    ROUND(
      c.distance / 50
    )::int as distance_50m,
    count(
      *
    )      as num_journeys,
    sum(
      driver_revenue
    )      as total_driver_revenue,
    sum(
      passenger_contribution
    )      as total_passengers_contributions,
    sum(
      i.total_amount
    )      as total_incentives,
    sum(
      i.num_incitations
    )      as num_incitations,
    array_agg(
      distinct c.operator_id
    )      as operators,
    sum(
      (s.fraud_status = 'failed')::int
    )      as num_fraud_journeys,
    sum(
      (s.anomaly_status = 'failed')::int
    )      as num_anomaly_journeys,
    max(
      case when tvel._id is not null then 'yes' else 'no' end
    )      as has_fraud_labels,
    json_agg(tvel.labels) filter (
      where tvel.labels is not null
    )      as fraud_labels,
    1      as link
  from
    {{ source('carpool', 'carpools') }} as c
  inner join {{ source('carpool', 'geo') }} as g
    on
      c._id = g.carpool_id
  left join incentives as i
    on
      c._id = i.carpool_id
  left join
    {{ source('carpool', 'status') }} as s
    on
      c._id = s.carpool_id
  left join
    {{ source('carpool', 'terms_violation_error_labels') }} as tvel
    on c._id = tvel.carpool_id
  {% if is_incremental() %}
    where
      c.start_datetime
      >= (select date_trunc('week', max(start_datetime)) from {{ this }})
  {% else %}
    where c.start_datetime >= now() - interval '1 year'
  {% endif %}
  group by
    1,
    2,
    3,
    4
  having
    count(*) >= 3
)

select
  start_geo_code,
  end_geo_code,
  start_datetime,
  distance_50m,
  num_journeys,
  total_driver_revenue,
  total_passengers_contributions,
  total_incentives,
  num_incitations,
  operators,
  num_fraud_journeys,
  num_anomaly_journeys,
  has_fraud_labels
from groups
order by date_trunc('week', start_datetime) desc, total_driver_revenue desc
