{{ config(materialized='view') }}

SELECT DISTINCT
   c.arr,
  c.l_arr,
  a._id  AS territory_id,
  a.name AS l_territory
FROM {{ source('territory','territory_group') }} AS a
INNER JOIN
  {{ source('territory','territory_group_selector') }} AS b
  ON a._id = b.territory_group_id
INNER JOIN
  {{ source('geo','perimeters') }} AS c
  ON
    (
      b.selector_value = c.arr
      OR b.selector_value = c.epci
      OR b.selector_value = c.aom
      OR b.selector_value = c.dep
      OR b.selector_value = c.reg
    )
    AND c.year = 2024
ORDER BY c.arr
