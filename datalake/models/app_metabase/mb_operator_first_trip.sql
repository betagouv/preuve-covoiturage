{{ config(
  materialized='view',
  tags=['app_metabase', 'operator_first_trip']
) }}

select
  operator_id,
  operator_name as name,
  first_date    as min,
  last_date     as max,
  carpools      as trips
from {{ ref('operators') }}
