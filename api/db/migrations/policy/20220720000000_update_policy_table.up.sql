ALTER TABLE policy.policies ALTER COLUMN unit DROP NOT NULL;
ALTER TABLE policy.policies ADD COLUMN handler VARCHAR(256);

DROP VIEW IF EXISTS policy.trips;
CREATE VIEW policy.trips AS (
  SELECT
    cp._id as carpool_id,
    cp.status as carpool_status,
    cp.trip_id as trip_id,
    cp.acquisition_id as acquisition_id,
    cp.operator_id::int as operator_id,
    oo.siret as operator_siret,
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
      FROM geo.get_by_code(cp.start_geo_code::varchar, geo.get_latest_millesime_or(EXTRACT(year FROM cp.datetime)::smallint)) AS position 
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
      FROM geo.get_by_code(cp.end_geo_code::varchar, geo.get_latest_millesime_or(EXTRACT(year FROM cp.datetime)::smallint)) AS position 
    ) as carpool_end
  FROM carpool.carpools as cp
  LEFT JOIN carpool.identities as ci ON cp.identity_id = ci._id
  LEFT JOIN operator.operators as oo ON cp.operator_id = oo._id
);
