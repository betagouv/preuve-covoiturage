{{ config(
  materialized='view',
  tags=['app_metabase', 'carpools_per_operator']
) }}

SELECT -- noqa: ST06
  to_char(incremental_date, 'YYYY-MM') AS date,
  operator_id,
  operator_name                        AS name,
  sum(carpools)                        AS carpools,
  sum(carpools_valid)                  AS ok,
  sum(carpools_invalid)                AS error
FROM {{ ref('fraud_month_country_from') }}
GROUP BY incremental_date, operator_id, operator_name
ORDER BY incremental_date, operator_id, operator_name
