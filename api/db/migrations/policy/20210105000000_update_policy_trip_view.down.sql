CREATE EXTENSION IF NOT EXISTS intarray;
DROP MATERIALIZED VIEW IF EXISTS policy.trips;

CREATE MATERIALIZED VIEW policy.trips AS (
  SELECT
    cp._id as carpool_id,
    cp.status as carpool_status,
    cp.trip_id as trip_id,
    tsc.value[1] as start_insee,
    tec.value[1] as end_insee,
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
    ats || cp.start_territory_id as start_territory_id,
    ate || cp.end_territory_id as end_territory_id,
    ap.applicable_policies as applicable_policies,
    pp.processed_policies as processed_policies,
    (ap.applicable_policies - pp.processed_policies) as processable_policies
  FROM carpool.carpools as cp
  LEFT JOIN territory.get_ancestors(ARRAY[cp.start_territory_id]) as ats ON TRUE
  LEFT JOIN territory.get_ancestors(ARRAY[cp.end_territory_id]) as ate ON TRUE,
  LATERAL (
    SELECT
      array_agg(value) as value
    FROM territory.territory_codes
    WHERE territory_id = cp.start_territory_id
    AND type = 'insee'
  ) as tsc,
  LATERAL (
    SELECT
      array_agg(value) as value
    FROM territory.territory_codes
    WHERE territory_id = cp.end_territory_id
    AND type = 'insee'
  ) as tec,
  -- Find all policies that appliable to carpool
  LATERAL (
    SELECT
      COALESCE(array_agg(pp._id), ARRAY[]::int[]) as applicable_policies
    FROM policy.policies as pp
    WHERE
      pp.territory_id = any(cp.start_territory_id || ats || ate || cp.end_territory_id)
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
  WHERE cp.datetime >= (NOW() - interval '45 days') AND cp.datetime < (NOW() - interval '5 days')
);

CREATE UNIQUE INDEX IF NOT EXISTS trips_carpool_id_idx ON policy.trips (carpool_id);
CREATE INDEX IF NOT EXISTS trips_datetime_idx ON policy.trips (datetime);
CREATE INDEX IF NOT EXISTS trips_trip_id_idx ON policy.trips (trip_id);
CREATE INDEX IF NOT EXISTS trips_applicable_policies_idx ON policy.trips (applicable_policies);
CREATE INDEX IF NOT EXISTS trips_processable_policies_idx ON policy.trips (processable_policies);
