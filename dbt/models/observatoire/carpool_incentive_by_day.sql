{{ config(materialized='incremental',unique_key=['from', 'to', 'start_date']) }}

SELECT
  coalesce(
    b.new_com,
    a.start_geo_code
  )                              AS from,
  coalesce(
    c.new_com,
    a.end_geo_code
  )                              AS to,
  a.start_datetime::date         AS start_date,
  count(*) filter (where d.establishment_naf_code in('8411Z','8413Z','4931Z','4939A'))  AS collectivite,
  count(*) filter (where d.establishment_naf_code is not null and d.establishment_naf_code not in('8411Z','8413Z','4931Z','4939A'))  AS operateur,
  count(*) filter (where d.establishment_naf_code is null)  AS autres
FROM {{ ref('view_carpool') }} AS a
LEFT JOIN
  (SELECT * FROM {{ source('geo','com_evolution') }} WHERE year >= 2020) AS b
  ON a.start_geo_code = b.old_com
LEFT JOIN
  (SELECT * FROM {{ source('geo','com_evolution') }} WHERE year >= 2020) AS c
  ON a.end_geo_code = c.old_com
JOIN 
(select a.carpool_id, a.siret, b.establishment_naf_code from {{source('carpool','operator_incentives')}} a
  left join {{source('company','companies')}} b on a.siret = b.siret ) AS d on a.carpool_id = d.carpool_id
WHERE
  a.acquisition_status = 'processed'
  AND a.fraud_status = 'passed'
{% if is_incremental() %}
  AND a.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}
GROUP BY
  1, 2, 3