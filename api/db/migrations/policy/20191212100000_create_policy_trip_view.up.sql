CREATE MATERIALIZED VIEW policy.trips AS (
  SELECT
    cp._id as carpool_id,
    cp.trip_id as trip_id,
    cp.start_insee as start_insee,
    cp.end_insee as end_insee,
    cp.operator_id::int as operator_id,
    cp.operator_class as operator_class,
    cp.datetime as datetime, 
    cp.seats as seats,
    cp.cost as cost,
    cp.is_driver as is_driver,
    (CASE WHEN ci.travel_pass_user_id <> null THEN '1'::boolean ELSE '0'::boolean END) as has_travel_pass,
    (CASE WHEN ci.over_18 <> null THEN ci.over_18 ELSE null END) as is_over_18,
    ci.uuid as identity_uuid,
    tis.territory_id as start_territory_id,
    tie.territory_id as end_territory_id,
    (CASE WHEN cp.distance <> null THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance,
    (CASE WHEN cp.duration <> null THEN cp.duration ELSE (cp.meta::json->>'calc_duration')::int END) as duration
  FROM carpool.carpools as cp
  JOIN territory.insee as tis ON cp.start_insee = tis._id
  JOIN territory.insee as tie ON cp.end_insee = tie._id
  JOIN carpool.identities as ci ON cp.identity_id = ci._id
);

CREATE INDEX ON policy.trips (carpool_id);
CREATE INDEX ON policy.trips (datetime);
CREATE INDEX ON policy.trips (start_territory_id);
CREATE INDEX ON policy.trips (end_territory_id);
