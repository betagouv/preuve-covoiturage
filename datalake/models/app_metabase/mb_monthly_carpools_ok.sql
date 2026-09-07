{{ config(
  materialized='view',
  tags=['app_metabase', 'monthly_carpools_ok']
) }}

SELECT
  to_char(incremental_date, 'YYYY-MM') AS time,
  SUM(carpools_valid)                  AS count
FROM {{ ref('fraud_month_country_from') }}
GROUP BY incremental_date
ORDER BY time
