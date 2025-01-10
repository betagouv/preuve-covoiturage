{{ config(materialized='view') }}

SELECT DISTINCT
  d.arr,
  d.l_arr,
  a._id  AS territory_id,
  a.name AS l_territory
FROM territory.territories AS a
INNER JOIN territory.territory_group AS b ON a.company_id = b.company_id
INNER JOIN
  territory.territory_group_selector AS c
  ON b._id = c.territory_group_id
INNER JOIN
  geo.perimeters AS d
  ON
    (
      c.selector_value = d.arr
      OR c.selector_value = d.epci
      OR c.selector_value = d.aom
      OR c.selector_value = d.dep
      OR c.selector_value = d.reg
    )
    AND d.year = 2023
ORDER BY d.arr
