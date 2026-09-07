{{ config(
  materialized='view',
  tags=['app_metabase', 'carpools_per_operator']
) }}

SELECT
  to_char(incremental_date, 'YYYY-MM') AS date,
  operator_id,
  operator_name                        AS name,
  SUM(carpools)                        AS trips,
  SUM(carpools_valid)                  AS ok,
  SUM(carpools_invalid)                AS error
FROM {{ ref('fraud_month_country_from') }}
GROUP BY incremental_date, operator_id, operator_name
ORDER BY incremental_date, operator_id, operator_name
