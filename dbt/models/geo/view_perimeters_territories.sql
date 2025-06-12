{{ config(materialized='view') }}

SELECT
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
      case when b.selector_type = 'arr' then b.selector_value = c.arr
        when b.selector_type = 'epci' then b.selector_value = c.epci
        when b.selector_type = 'aom' then b.selector_value = c.aom
        when b.selector_type = 'dep' then b.selector_value = c.dep
        when b.selector_type = 'reg' then b.selector_value = c.reg
	    end
    )
    AND c.year = 2024
ORDER BY c.arr
