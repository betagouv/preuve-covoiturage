CREATE OR REPLACE FUNCTION territory.get_com_by_territory_id(_id int, year smallint) returns table (com varchar) as $$
  with data as (select * from territory.territory_group_selector where territory_group_id = $1)
  select gp.arr as com from geo.perimeters gp join data d 
    on (d.selector_type = 'arr' OR d.selector_type = 'com') and d.selector_value = gp.arr
  where year = $2
  union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'aom' and d.selector_value = gp.aom
  where year = $2
  union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'epci' and d.selector_value = gp.epci
  where year = $2
  union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'reg' and d.selector_value = gp.reg
  where year = $2
    union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'dep' and d.selector_value = gp.dep
  where year = $2;

$$ language sql stable;

CREATE INDEX IF NOT EXISTS geo_perimeters_dep_idx on geo.perimeters (dep) 