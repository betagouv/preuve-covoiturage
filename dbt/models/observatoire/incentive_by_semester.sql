{{ config(materialized='incremental',unique_key=['code', 'type', 'direction', 'year', 'semester']) }}

SELECT
  extract('year' FROM start_date)::int  AS year,
  case
    when extract('quarter' from start_date)::int > 3 then 2 else 1
  end                             as semester,
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
      (extract('year' FROM start_date) * 10 + CASE WHEN extract('quarter' FROM start_date)::int > 3 THEN 2 ELSE 1 END)
      >= (SELECT max(year * 10 + semester) FROM {{ this }})
  {% endif %}
GROUP BY 1, 2, 3, 4, 5, 6
