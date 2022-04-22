DROP VIEW IF EXISTS policy.trips;
CREATE VIEW policy.trips AS (
  SELECT
    cp._id as carpool_id,
    cp.status as carpool_status,
    cp.trip_id as trip_id,
    cp.acquisition_id as acquisition_id,
    cp.operator_id::int as operator_id,
    cp.operator_class as operator_class,
    cp.datetime as datetime, 
    cp.seats as seats,
    cp.cost as cost,
    cp.is_driver as is_driver,
    (CASE WHEN cp.distance IS NOT NULL THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance,
    (CASE WHEN cp.duration IS NOT NULL THEN cp.duration ELSE (cp.meta::json->>'calc_duration')::int END) as duration,
    (CASE WHEN ci.travel_pass_user_id IS NOT NULL THEN true ELSE false END) as has_travel_pass,
    (CASE WHEN ci.over_18 IS NOT NULL THEN ci.over_18 ELSE null END) as is_over_18,
    ci.uuid as identity_uuid,
    cp.start_geo_code,
    cp.end_geo_code,
    (
      SELECT
        json_build_object(
          'arr',
          arr,
          'com',
          com,
          'epci',
          epci,
          'dep',
          dep,
          'reg',
          reg,
          'country',
          country,
          'aom',
          aom,
          'reseau',
          reseau
        )
      FROM geo.get_by_code(cp.start_geo_code::varchar, EXTRACT(year FROM cp.datetime)::smallint) AS position 
    ) as carpool_start,
    (
      SELECT
        json_build_object(
          'arr',
          arr,
          'com',
          com,
          'epci',
          epci,
          'dep',
          dep,
          'reg',
          reg,
          'country',
          country,
          'aom',
          aom,
          'reseau',
          reseau
        )
      FROM geo.get_by_code(cp.end_geo_code::varchar, EXTRACT(year FROM cp.datetime)::smallint) AS position
    ) as carpool_end
  FROM carpool.carpools as cp
  LEFT JOIN carpool.identities as ci ON cp.identity_id = ci._id
);

CREATE OR REPLACE FUNCTION policy.get_com_by_territory_id(_id int, year smallint) returns table (com varchar) as $$
  with data as (select * from territory.territory_group_selector where territory_group_id = $1)
  select gp.com from geo.perimeters gp join data d 
    on (d.selector_type = 'arr' OR d.selector_type = 'com') and d.selector_value = gp.arr
  where year = $2
  union
  select gp.com from geo.perimeters gp join data d 
    on d.selector_type = 'aom' and d.selector_value = gp.aom
  where year = $2;
$$ language sql stable;

CREATE OR REPLACE FUNCTION policy.get_territory_id_by_selector(com varchar default null, aom varchar default null) returns table (_id int) as $$
  SELECT
    territory_group_id as _id
  FROM territory.territory_group_selector
  WHERE
    (selector_type = 'com' OR selector_type = 'arr') AND
    selector_value = $1
  UNION
  SELECT
    territory_group_id as _id
  FROM territory.territory_group_selector
  WHERE
    selector_type = 'aom' AND
    selector_value = $2
$$ language sql stable;
