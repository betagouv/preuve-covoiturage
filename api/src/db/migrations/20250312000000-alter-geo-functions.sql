CREATE OR REPLACE FUNCTION geo.get_closest_com(lon float, lat float, buffer integer default 1000) 
  returns table (
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
    surface real,
    distance float 
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
      surface,
      st_distance(ST_SetSRID(ST_Point($1, $2),'4326'),geom) as distance
    FROM geo.perimeters
    WHERE
      geom IS NOT NULL
      AND arr <> 'XXXXX'
      AND arr <> '99100'
      AND (country = 'XXXXX' OR country = '99100')
      AND
      ST_Intersects(ST_Buffer(ST_Transform(ST_SetSRID(ST_Point($1, $2),'4326'),2154),$3),ST_Transform(geom,2154))
    ORDER BY year DESC, distance ASC
    LIMIT 1
  $$ language sql stable;

CREATE OR REPLACE FUNCTION geo.get_closest_country_with_distance(lon float, lat float, buffer integer default 10000) 
  returns table (
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
    surface real,
    distance float 
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
      surface,
      st_distance(ST_SetSRID(ST_Point($1, $2),'4326'),geom) as distance
    FROM geo.perimeters
    WHERE
      geom IS NOT NULL
      AND country <> 'XXXXX' 
      AND country <> '99100'
      AND com IS NULL
      AND
      ST_Intersects(ST_Buffer(ST_Transform(ST_SetSRID(ST_Point($1, $2),'4326'),2154),$3),ST_Transform(geom,2154))
    ORDER BY year DESC, distance ASC
    LIMIT 1
  $$ language sql stable;

CREATE OR REPLACE FUNCTION geo.get_closest_country(lon double precision, lat double precision)
 RETURNS TABLE(year smallint, l_arr character varying, arr character varying, l_com character varying, com character varying, l_epci character varying, epci character varying, l_dep character varying, dep character varying, l_reg character varying, reg character varying, l_country character varying, country character varying, l_aom character varying, aom character varying, l_reseau character varying, reseau integer, pop integer, surface real)
 LANGUAGE sql
 STABLE
  AS $function$
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
      geom IS NOT NULL
      AND country <> 'XXXXX'
      AND country <> '99100'
      AND
      ST_Intersects(ST_Buffer(ST_Transform(ST_SetSRID(ST_Point($1, $2),'4326'),2154),1000),ST_Transform(geom,2154))
    ORDER BY year DESC
    LIMIT 1
  $function$
;