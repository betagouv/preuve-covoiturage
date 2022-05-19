CREATE INDEX IF NOT EXISTS geo_perimeters_year_idx ON geo.perimeters(year);
CREATE INDEX IF NOT EXISTS geo_perimeters_surface_idx ON geo.perimeters(surface);
CREATE INDEX IF NOT EXISTS geo_perimeters_arr_idx ON geo.perimeters(arr);
CREATE INDEX IF NOT EXISTS geo_perimeters_aom_idx ON geo.perimeters(aom);
CREATE INDEX IF NOT EXISTS geo_perimeters_epci_idx ON geo.perimeters(epci);

CREATE OR REPLACE FUNCTION geo.get_latest_by_point(lon float, lat float) returns table (
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
    ST_WITHIN(
      ST_SETSRID(
        ST_POINT($1, $2),
        '4326'
      ),
      geom
    )
  ORDER BY surface ASC, year DESC
  LIMIT 1
$$ language sql;

CREATE OR REPLACE FUNCTION geo.get_latest_by_code(code varchar) returns table (
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
    arr = $1
  ORDER BY year DESC
  LIMIT 1
$$ language sql;

CREATE OR REPLACE FUNCTION geo.get_latest_millesime() returns smallint as $$
  SELECT 
    max(year)
  FROM geo.perimeters
$$ language sql;

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
  ORDER BY surface ASC, year DESC
  LIMIT 1
$$ language sql stable;

CREATE OR REPLACE FUNCTION geo.get_by_code(code varchar, year smallint) returns table (
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
    arr = $1 AND
    year = $2
  LIMIT 1
$$ language sql stable;
