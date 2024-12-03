{{ config(materialized='view') }}

SELECT distinct d.arr,d.l_arr, a._id as territory_id, a.name as l_territory
from territory.territories a 
JOIN territory.territory_group b on b.company_id = a.company_id
JOIN territory.territory_group_selector c on c.territory_group_id = b._id
JOIN geo.perimeters d on (c.selector_value = d.arr or c.selector_value = d.epci or c.selector_value = d.aom or c.selector_value = d.dep or c.selector_value=d.reg) and d.year = 2023
order by  d.arr