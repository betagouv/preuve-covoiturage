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
  where c.start_datetime between '2024-07-01' and now()
{% endif %}
)

select
  date_trunc('month', c.start_datetime) as month,
  (count(*) * 0.04)                     as journeys_count,
  (count(*) * 0.04 * 1.045)             as incentives_amount_sum
from
  filtered_carpools as c
group by
  1
order by
  1
