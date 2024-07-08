{{ config(materialized='incremental') }}

SELECT
  extract('year' FROM start_date)::int  AS year,
  extract('month' FROM start_date)::int AS month,
  a.code,
  b.l_territory AS libelle,
  a.type,
  a.direction,
  sum(a.collectivite)                         AS collectivite,
  sum(a.operateur)                         AS operateur,
  sum(a.autres)                         AS autres
FROM {{ ref('directions_incentive_by_day') }} AS a
LEFT JOIN
  (
    SELECT
      territory,
      l_territory,
      type,
      geom
    FROM {{ source('geo', 'perimeters_centroid') }}
    WHERE year = geo.get_latest_millesime()
  ) AS b
  ON a.code = b.territory AND a.type = b.type
WHERE
  a.code IS NOT null
  {% if is_incremental() %}
    AND
      concat(
        extract('year' FROM start_date),
        extract('month' FROM start_date)
      )::int
      >= (SELECT max(concat(year, month)::int) FROM {{ this }})
  {% endif %}
GROUP BY 1, 2, 3, 4, 5, 6

