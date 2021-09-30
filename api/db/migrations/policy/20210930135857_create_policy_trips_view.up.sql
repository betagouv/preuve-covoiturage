CREATE EXTENSION IF NOT EXISTS intarray;
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
    cp.start_territory_id as start_territory_id,
    cp.end_territory_id as end_territory_id,
    cp.seats as seats,
    cp.cost as cost,
    cp.is_driver as is_driver,
    (CASE WHEN cp.distance IS NOT NULL THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance,
    (CASE WHEN cp.duration IS NOT NULL THEN cp.duration ELSE (cp.meta::json->>'calc_duration')::int END) as duration,
    (CASE WHEN ci.travel_pass_user_id IS NOT NULL THEN true ELSE false END) as has_travel_pass,
    (CASE WHEN ci.over_18 IS NOT NULL THEN ci.over_18 ELSE null END) as is_over_18,
    ci.uuid as identity_uuid
  FROM carpool.carpools as cp
  LEFT JOIN carpool.identities as ci ON cp.identity_id = ci._id
);
