CREATE OR REPLACE FUNCTION territory.get_com_by_territory_id(_id int, year smallint) returns table (com varchar) as $$
  with data as (select * from territory.territory_group_selector where territory_group_id = $1)
  select gp.com from geo.perimeters gp join data d 
    on (d.selector_type = 'arr' OR d.selector_type = 'com') and d.selector_value = gp.arr
  where year = $2
  union
  select gp.com from geo.perimeters gp join data d 
    on d.selector_type = 'aom' and d.selector_value = gp.aom
  where year = $2
  union
  select gp.com from geo.perimeters gp join data d 
    on d.selector_type = 'epci' and d.selector_value = gp.epci
  where year = $2;
$$ language sql stable;
