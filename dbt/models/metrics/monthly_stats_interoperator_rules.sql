{{
  config(
    materialized = 'incremental',
    unique_key = ['month'],
    incremental_strategy = "delete+insert",
    )
}}

with filtered_carpools as (
  select
    c._id,
    c.start_datetime
  from
    {{ source('carpool', 'carpools') }} as c
  {% if is_incremental() %}
    where
      c.start_datetime between (select max(month) from {{ this }}) and now()
  {% else %}
  where c.start_datetime between '2023-07-01' and now()
{% endif %}
),

incentives as (
  select
    oi.carpool_id,
    sum(oi.amount) as incentives_amount
  from {{ source('carpool', 'operator_incentives') }} as oi
  where oi.carpool_id in (select _id from filtered_carpools)
  group by 1
),

carpools_with_incentives as (
  select *
  from filtered_carpools as fc
  left join incentives as i on fc._id = i.carpool_id
)

select
  date_trunc('month', c.start_datetime)   as month,
  (count(*) * 0.07)                       as journeys_count,
  (sum(c.incentives_amount) * 0.07) / 100 as incentives_amount_sum
from
  carpools_with_incentives as c
group by
  1
order by
  1
