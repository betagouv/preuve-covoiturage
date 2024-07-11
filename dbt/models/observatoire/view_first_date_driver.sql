{{ config(materialized='view') }}

select distinct on (driver_id) driver_id, min(start_datetime)::date as first_date
	from {{ ref('view_carpool') }}
  WHERE
  acquisition_status = 'processed'
  AND fraud_status = 'passed'
	group by driver_id
