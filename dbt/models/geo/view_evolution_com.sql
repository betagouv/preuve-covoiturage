{{ config(materialized='view') }}

select
  a.arr                      as arr_2020,
  coalesce(b.new_com, a.arr) as arr_2021,
  coalesce(c.new_com, a.arr) as arr_2022,
  coalesce(d.new_com, a.arr) as arr_2023,
  coalesce(e.new_com, a.arr) as arr_2024
from {{ source('geo','perimeters') }} as a
left join
  {{ source('geo','com_evolution') }} as b
  on a.arr = b.old_com and b.year = 2021
left join
  {{ source('geo','com_evolution') }} as c
  on a.arr = c.old_com and c.year = 2022
left join
  {{ source('geo','com_evolution') }} as d
  on a.arr = d.old_com and d.year = 2023
left join
  {{ source('geo','com_evolution') }} as e
  on a.arr = e.old_com and e.year = 2024
where a.year = 2020
order by a.arr asc
