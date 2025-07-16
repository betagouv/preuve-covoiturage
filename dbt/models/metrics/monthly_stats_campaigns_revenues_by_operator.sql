{{
  config(
    materialized = 'incremental',
    unique_key = ['month',"operator_id","siret"],
    incremental_strategy = "delete+insert",
    indexes = [{"columns":['month',"operator_id","siret"],"unique":True}]
    )
}}


with trips as (
  select
    c._id,
    oi.siret,
    max(c.start_datetime)         as start_datetime,
    max(c.distance)               as distance,
    max(c.operator_id)            as operator_id,
    max(c.driver_revenue)         as driver_revenue,
    max(c.passenger_contribution) as passenger_contribution,
    sum(oi.amount)                as operator_amount,
    sum(i.amount)                 as policy_amount
  from {{ source('carpool', 'carpools') }} as c
  left join {{ source('carpool', 'operator_incentives') }} as oi
    on
      c._id = oi.carpool_id
      and oi.amount > 0
  left join {{ source('policy', 'incentives') }} as i
    on
      c.operator_journey_id = i.operator_journey_id
      and c.operator_id = i.operator_id
      and i.status = 'validated'
      and i.amount > 0
  {% if is_incremental() %}
    where
      c.start_datetime
      >= coalesce((select max(month) from {{ this }}), '1900-01-01')
  {% else %}
    where c.start_datetime >= '2022-01-01'
  {% endif %}
  -- account for multiple incentives amounts for the same siret on the same trip
  group by 1, 2
),

agg_data as (
  select
    date_trunc(
      'month', start_datetime
    ) as month,
    operator_id,
    siret,
    count(
      distinct _id
    ) as journeys_count,
    count(
      distinct _id
    ) filter (
      where distance between 18000 and 30000
    )
    as journeys_count_18_30,
    count(
      distinct _id
    ) filter (
      where operator_amount > 0
    )
    as journeys_count_with_operator_incentive,
    count(
      distinct _id
    ) filter (
      where policy_amount > 0
    )
    as journeys_count_with_policy_incentive,
    count(
      distinct _id
    ) filter (
      where (distance between 18000 and 30000) and operator_amount > 0
    )
    as journeys_count_with_operator_incentive_18_30,
    count(
      distinct _id
    ) filter (
      where (distance between 18000 and 30000) and policy_amount > 0
    )
    as journeys_count_with_policy_incentive_18_30,
    avg(
      driver_revenue / 100
    ) as avg_driver_revenue,
    avg(
      distance / 1000
    ) as avg_distance,
    min(
      driver_revenue / 100
    ) as min_revenue,
    10
    * avg(
      driver_revenue::numeric / distance
    ) as avg_driver_revenue_per_km,
    10
    * avg(driver_revenue::numeric / distance) filter (
      where distance between 18000 and 30000
    ) as avg_driver_revenue_per_km_18_30,
    10
    * avg(driver_revenue::numeric / distance) filter (
      where operator_amount > 0
    ) as avg_driver_revenue_per_km_journeys_with_operator_incentive,
    10
    * avg(driver_revenue::numeric / distance) filter (
      where policy_amount > 0
    ) as avg_driver_revenue_per_km_journeys_with_policy_incentive,
    10
    * avg(driver_revenue::numeric / distance) filter (
      where (distance between 18000 and 30000) and operator_amount > 0
    ) as avg_driver_revenue_per_km_18_30_journeys_with_operator_incentive,
    10
    * avg(driver_revenue::numeric / distance) filter (
      where (distance between 18000 and 30000) and policy_amount > 0
    ) as avg_driver_revenue_per_km_18_30_journeys_with_policy_incentive,
    10
    * avg(
      passenger_contribution::numeric / distance
    ) as avg_passenger_contribution_per_km,
    10
    * avg(passenger_contribution::numeric / distance) filter (
      where distance between 18000 and 30000
    ) as avg_passenger_contribution_per_km_18_30,
    10
    * avg(passenger_contribution::numeric / distance) filter (
      where operator_amount > 0
    ) as avg_passenger_contribution_per_km_journeys_with_operator_incentive,
    10
    * avg(passenger_contribution::numeric / distance) filter (
      where policy_amount > 0
    ) as avg_passenger_contribution_per_km_journeys_with_policy_incentive,
    10
    * avg(passenger_contribution::numeric / distance) filter (
      where (distance between 18000 and 30000) and operator_amount > 0
    ) as avg_passenger_contribution_per_km_18_30_journeys_with_operator_incentive,
    10
    * avg(passenger_contribution::numeric / distance) filter (
      where (distance between 18000 and 30000) and policy_amount > 0
    ) as avg_passenger_contribution_per_km_18_30_journeys_with_policy_incentive,
    10
    * avg(
      operator_amount::numeric / distance
    ) as avg_operator_incentive_per_km,
    10
    * avg(
      policy_amount::numeric / distance
    ) as avg_policy_incentive_per_km,
    10
    * avg(operator_amount::numeric / distance) filter (
      where distance between 18000 and 30000
    ) as avg_operator_incentive_per_km_18_30,
    10
    * avg(policy_amount::numeric / distance) filter (
      where distance between 18000 and 30000
    ) as avg_policy_incentive_per_km_18_30
  from trips
  where distance > 0
  group by 1, 2, 3
  order by 1
),

aoms as (
  select
    aom,
    max(l_aom) as aom_name
  from {{ source('geo', 'perimeters') }}
  where year = 2024
  group by 1
)

select
  a.month,
  a.operator_id,
  o.name               as operator_name,
  a.siret,
  c.legal_name         as siret_name,
  aoms.aom_name,
  a.journeys_count,
  a.journeys_count_18_30,
  a.journeys_count_with_operator_incentive,
  a.journeys_count_with_policy_incentive,
  a.journeys_count_with_operator_incentive_18_30,
  a.journeys_count_with_policy_incentive_18_30,
  a.avg_driver_revenue,
  a.avg_distance,
  a.min_revenue,
  a.avg_driver_revenue_per_km,
  a.avg_driver_revenue_per_km_journeys_with_operator_incentive,
  a.avg_driver_revenue_per_km_journeys_with_policy_incentive,
  a.avg_driver_revenue_per_km_18_30,
  a.avg_driver_revenue_per_km_18_30_journeys_with_operator_incentive,
  a.avg_driver_revenue_per_km_18_30_journeys_with_policy_incentive,
  a.avg_passenger_contribution_per_km,
  a.avg_passenger_contribution_per_km_journeys_with_operator_incentive,
  a.avg_passenger_contribution_per_km_journeys_with_policy_incentive,
  a.avg_passenger_contribution_per_km_18_30,
  a.avg_passenger_contribution_per_km_18_30_journeys_with_operator_incentive,
  a.avg_passenger_contribution_per_km_18_30_journeys_with_policy_incentive,
  a.avg_operator_incentive_per_km,
  a.avg_policy_incentive_per_km,
  a.avg_operator_incentive_per_km_18_30,
  a.avg_policy_incentive_per_km_18_30,
  aoms.aom is not null as siret_is_aom
from agg_data as a
left join company.companies as c on a.siret = c.siret
left join operator.operators as o on a.operator_id = o._id
left join aoms on substring(a.siret for 9) = aoms.aom
