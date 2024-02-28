CREATE OR REPLACE FUNCTION geo.get_by_point(lon float, lat float, year smallint) returns table (
  year smallint,
  l_arr varchar,
  arr varchar,
  l_com varchar,
  com varchar,
  l_epci varchar,
  epci varchar,
  l_dep varchar,
  dep varchar,
  l_reg varchar,
  reg varchar,
  l_country varchar,
  country varchar,
  l_aom varchar,
  aom varchar,
  l_reseau varchar,
  reseau int,
  pop int,
  surface real 
) as $$
  SELECT
    year,
    l_arr,
    arr,
    l_com,
    com,
    l_epci,
    epci,
    l_dep,
    dep,
    l_reg,
    reg,
    l_country,
    country,
    l_aom,
    aom,
    l_reseau,
    reseau,
    pop,
    surface
  FROM geo.perimeters
  WHERE
    geom IS NOT NULL AND
    year = $3 AND
    ST_WITHIN(
      ST_SETSRID(
        ST_POINT($1, $2),
        '4326'
      ),
      geom
    )
  ORDER BY year DESC, surface ASC
  LIMIT 1
$$ language sql stable;