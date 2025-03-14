{{ config(
    materialized='incremental',
    incremental_strategy='delete+insert',
    unique_key=['year', 'semester', 'code', 'type', 'direction'],
    indexes = [
    {
      'columns':[
        'year',
        'semester',
        'code',
        'type',
        'direction'          
      ],
      'unique':true
    }
  ]
  )
}}

SELECT
  extract('year' FROM start_date)::int AS year,
  CASE
    WHEN extract('quarter' FROM start_date)::int > 3 THEN 2 ELSE 1
  END                                  AS semester,
  a.code,
  b.l_territory                        AS libelle,
  a.type,
  a.direction,
  sum(a.new_drivers)                   AS new_drivers,
  sum(a.new_passengers)                AS new_passengers
FROM {{ ref('directions_newcomer_by_day') }} AS a
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
