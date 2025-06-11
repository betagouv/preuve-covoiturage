{{
  config(
    materialized = 'incremental',
    unique_key = ['month',"siret"],
    incremental_strategy = "delete+insert",
    indexes = [{"columns":['month',"siret"],"unique":True}]
    )
}}
with trips as (
  select
    c._id,
    oi.siret,
    max(c.start_datetime)         as start_datetime,
    max(c.distance)               as distance,
    max(c.driver_revenue)         as driver_revenue,
    max(c.passenger_contribution) as passenger_contribution,
    sum(oi.amount)                as amount
  from carpool_v2.carpools as c
  left join carpool_v2.operator_incentives as oi
    on
      c._id = oi.carpool_id
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
      where amount > 0
    )
    as journeys_count_filtered,
    count(
      distinct _id
    ) filter (
      where (distance between 18000 and 30000) and amount > 0
    )
    as journeys_count_filtered_18_30,
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
      where amount > 0
    ) as avg_driver_revenue_per_km_filtered,
    10
    * avg(driver_revenue::numeric / distance) filter (
      where (distance between 18000 and 30000) and amount > 0
    ) as avg_driver_revenue_per_km_filtered_18_30,
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
      where amount > 0
    ) as avg_passenger_contribution_per_km_filtered,
    10
    * avg(passenger_contribution::numeric / distance) filter (
      where (distance between 18000 and 30000) and amount > 0
    ) as avg_passenger_contribution_per_km_filtered_18_30,
    10
    * avg(
      amount::numeric / distance
    ) as avg_incentive_per_km,
    10
    * avg(amount::numeric / distance) filter (
      where distance between 18000 and 30000
    ) as avg_incentive_per_km_18_30,
    10
    * avg(amount::numeric / distance) filter (
      where amount > 0
    ) as avg_incentive_per_km_filtered,
    10
    * avg(amount::numeric / distance) filter (
      where (distance between 18000 and 30000) and amount > 0
    ) as avg_incentive_per_km_filtered_18_30
  from trips
  where distance > 0
  group by 1, 2
  order by 1
)

select
  a.month,
  a.siret,
  c.legal_name,
  a.journeys_count,
  a.journeys_count_18_30,
  a.journeys_count_filtered,
  a.journeys_count_filtered_18_30,
  a.avg_driver_revenue,
  a.avg_distance,
  a.min_revenue,
  a.avg_driver_revenue_per_km,
  a.avg_driver_revenue_per_km_18_30,
  a.avg_driver_revenue_per_km_filtered,
  a.avg_driver_revenue_per_km_filtered_18_30,
  a.avg_passenger_contribution_per_km,
  a.avg_passenger_contribution_per_km_18_30,
  a.avg_passenger_contribution_per_km_filtered,
  a.avg_passenger_contribution_per_km_filtered_18_30,
  a.avg_incentive_per_km,
  a.avg_incentive_per_km_18_30,
  a.avg_incentive_per_km_filtered,
  a.avg_incentive_per_km_filtered_18_30
from agg_data as a
left join company.companies as c on a.siret = c.siret
