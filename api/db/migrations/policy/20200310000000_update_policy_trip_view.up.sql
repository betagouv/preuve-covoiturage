CREATE EXTENSION IF NOT EXISTS intarray;
DROP MATERIALIZED VIEW IF EXISTS policy.trips;

CREATE MATERIALIZED VIEW policy.trips AS (
  SELECT
    cp._id as carpool_id,
    cp.status as carpool_status,
    cp.trip_id as trip_id,
    cp.start_insee as start_insee,
    cp.end_insee as end_insee,
    cp.operator_id::int as operator_id,
    cp.operator_class as operator_class,
    cp.datetime as datetime, 
    cp.seats as seats,
    cp.cost as cost,
    cp.is_driver as is_driver,
    (CASE WHEN cp.distance IS NOT NULL THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance,
    (CASE WHEN cp.duration IS NOT NULL THEN cp.duration ELSE (cp.meta::json->>'calc_duration')::int END) as duration,
    id.identity_uuid as identity_uuid,
    id.has_travel_pass as has_travel_pass,
    id.is_over_18 as is_over_18,
    tis.territory_id as start_territory_id,
    tie.territory_id as end_territory_id,
    ap.applicable_policies as applicable_policies,
    pp.processed_policies as processed_policies,
    (ap.applicable_policies - pp.processed_policies) as processable_policies
  FROM carpool.carpools as cp,
  -- Find territory by insee code
  LATERAL (
    SELECT
       COALESCE(array_agg(ti.territory_id)::int[], ARRAY[]::int[]) as territory_id
    FROM territory.insee as ti
    WHERE ti._id = cp.start_insee
  ) as tis,
  LATERAL (
    SELECT
       COALESCE(array_agg(ti.territory_id)::int[], ARRAY[]::int[]) as territory_id
    FROM territory.insee as ti
    WHERE ti._id = cp.end_insee
  ) as tie,
  -- Find all policies that appliable to carpool
  LATERAL (
    SELECT
      COALESCE(array_agg(pp._id), ARRAY[]::int[]) as applicable_policies
    FROM policy.policies as pp
    WHERE
      (pp.territory_id = any(tis.territory_id) OR pp.territory_id = any(tie.territory_id))
      AND pp.start_date <= cp.datetime
      AND pp.end_date >= cp.datetime
      AND pp.status = 'active'
  ) as ap,
  -- Find all already processed policies
  LATERAL (
    SELECT
      COALESCE(array_agg(pi.policy_id), ARRAY[]::int[]) as processed_policies
    FROM policy.incentives as pi
    WHERE
      pi.carpool_id::int = cp._id
  ) as pp,
  -- Find identity relative data
  LATERAL (
    SELECT
      (CASE WHEN ci.travel_pass_user_id IS NOT NULL THEN true ELSE false END) as has_travel_pass,
      (CASE WHEN ci.over_18 IS NOT NULL THEN ci.over_18 ELSE null END) as is_over_18,
      ci.uuid as identity_uuid
    FROM carpool.identities as ci
    WHERE
      cp.identity_id = ci._id
  ) as id
  WHERE cp.datetime >= (NOW() - interval '45 days')
);

CREATE UNIQUE INDEX IF NOT EXISTS trips_carpool_id_idx ON policy.trips (carpool_id);
CREATE INDEX IF NOT EXISTS trips_datetime_idx ON policy.trips (datetime);
CREATE INDEX IF NOT EXISTS trips_trip_id_idx ON policy.trips (trip_id);
CREATE INDEX IF NOT EXISTS trips_applicable_policies_idx ON policy.trips (applicable_policies);
CREATE INDEX IF NOT EXISTS trips_processable_policies_idx ON policy.trips (processable_policies);
