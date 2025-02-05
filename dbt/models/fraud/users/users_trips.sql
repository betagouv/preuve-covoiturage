{{
  config(
    materialized = 'ephemeral',
    )
}}



select
  *,
  driver_identity_key as user_identity_key,
  'driver'            as role
from
  {{ source('carpool', 'carpools') }}
union all
select
  *,
  passenger_identity_key as user_identity_key,
  'passenger'            as role
from
  {{ source('carpool', 'carpools') }}
