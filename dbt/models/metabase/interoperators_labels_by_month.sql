{{
  config(
    materialized = 'incremental',
    unique_key = [
      'month',
      'label',
      'operator_name',
    ],
    schema = 'metabase'
    )
}}

SELECT
  DATE_TRUNC(
    'month'::TEXT,
    (CC.START_DATETIME AT TIME ZONE 'EUROPE/PARIS'::TEXT)
  ) AS MONTH,
  FL.LABEL,
  oo.name as operator_name,
  COUNT(CC._ID) AS count
FROM
  {{ source('fraudcheck', 'labels') }} FL
  JOIN {{ source('carpool', 'carpools') }} CC ON CC._ID = FL.CARPOOL_ID
  JOIN {{ source('operator', 'operators') }} OO ON CC.OPERATOR_ID = OO._ID
GROUP BY 1, 2, 3