{{ config(materialized='view') }}

select a.arr as arr_2020, 
case when b.new_com is null then a.arr else b.new_com end as arr_2021,
case when c.new_com is null then a.arr else c.new_com end as arr_2022,
case when d.new_com is null then a.arr else d.new_com end as arr_2023
from {{ source('geo','perimeters') }} a 
left join {{ source('geo','com_evolution') }} b on a.arr = b.old_com and b.year = 2021
left join {{ source('geo','com_evolution') }} c on a.arr = c.old_com and c.year = 2022
left join {{ source('geo','com_evolution') }} d on a.arr = d.old_com and d.year = 2023
where a.year = 2020 
order by a.arr asc
