{{ config(materialized='view') }}

select distinct on (driver_id)
  driver_id,
  min(start_datetime)::date as first_date
from {{ ref('view_carpool') }}
where
  acquisition_status = 'processed'
  and fraud_status = 'passed'
group by driver_id
