DROP MATERIALIZED VIEW IF EXISTS trip.export;

CREATE OR REPLACE FUNCTION ts_ceil(_tstz timestamptz, _int_seconds int)
  RETURNS timestamptz AS
$func$   
SELECT to_timestamp(ceil(extract(epoch FROM $1) / $2) * $2)
$func$  LANGUAGE sql STABLE;

CREATE TYPE trip.incentive AS (
  siret varchar,
  amount int,
  unit varchar,
  policy_id int,
  type varchar
);

create or replace function incentive_to_json(_ti trip.incentive) returns json as $$
  select json_build_object(
    'siret', $1.siret
  , 'amount', $1.amount
  , 'unit', $1.unit
  , 'policy_id', $1.policy_id
  , 'type', $1.type
  );
$$ language sql;

create cast (trip.incentive as json) with function incentive_to_json(_ti trip.incentive) as assignment;

create or replace function json_to_incentive(_ti json) returns trip.incentive as $$
  select ROW($1->>'siret', ($1->>'amount')::int, $1->>'unit', ($1->>'policy_id')::int, $1->>'type')::trip.incentive;
$$ language sql;

create cast (json as trip.incentive) with function json_to_incentive(_ti json) as assignment;

CREATE MATERIALIZED VIEW trip.export AS (
  SELECT

  -- THIS IS FOR AUTH ONLY --
    cpp.operator_id as operator_id,
    tis._id as start_territory_id,
    tie._id as end_territory_id,

    -- DATA --
    cpp.acquisition_id::varchar as journey_id,
    cpp.trip_id as trip_id,
    
    ts_ceil(cpp.datetime, 600) as journey_start_datetime,
    extract(isodow from cpp.datetime) as journey_start_weekday,
    extract(hour from cpp.datetime) as journey_start_dayhour,

    -- trunc(ST_X(cpp.start_position::geometry)::numeric, round(log(5-ts.density::int)+2)::int) as journey_start_lon, -- TODO
    -- trunc(ST_Y(cpp.start_position::geometry)::numeric, round(log(5-ts.density::int)+2)::int) as journey_start_lat, -- TODO
    ST_X(cpp.start_position::geometry)::numeric as journey_start_lon, -- TODO
    ST_Y(cpp.start_position::geometry)::numeric as journey_start_lat, -- TODO

    tis.insee[1] as journey_start_insee,
    tis.postcode[1] as journey_start_postalcode,
    substring(tis.postcode[1] from 1 for 2) as journey_start_department,
    tbs.town as journey_start_town,
    tbs.towngroup as journey_start_towngroup,
    tbs.country as journey_start_country,

    ts_ceil((cpp.datetime + (cpp.duration || ' seconds')::interval), 600) as journey_end_datetime,

    -- trunc(ST_X(cpp.end_position::geometry)::numeric, round(log(5-te.density::int)+2)::int) as journey_end_lon, -- TODO
    -- trunc(ST_Y(cpp.end_position::geometry)::numeric, round(log(5-te.density::int)+2)::int) as journey_end_lat, -- TODO
    ST_X(cpp.end_position::geometry)::numeric as journey_end_lon, -- TODO
    ST_Y(cpp.end_position::geometry)::numeric as journey_end_lat, -- TODO

    tie.insee[1] as journey_end_insee,
    tie.postcode[1] as journey_end_postalcode,
    substring(tie.postcode[1] from 1 for 2) as journey_end_department,
    tbe.town as journey_end_town,
    tbe.towngroup as journey_end_towngroup,
    tbe.country as journey_end_country,

    (CASE WHEN cpp.distance IS NOT NULL THEN cpp.distance ELSE (cpp.meta::json->>'calc_distance')::int END) as journey_distance,
    cpp.distance as journey_distance_anounced,
    (cpp.meta::json->>'calc_distance')::int as journey_distance_calculated,

    (CASE WHEN cpp.duration IS NOT NULL THEN cpp.duration ELSE (cpp.meta::json->>'calc_duration')::int END) as journey_duration,
    cpp.duration as journey_duration_anounced,
    (cpp.meta::json->>'calc_duration')::int as journey_duration_calculated,

    ope.name as operator,
    cpp.operator_class as operator_class,

    cip.uuid as passenger_id,
    (CASE WHEN cip.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as passenger_card,
    cip.over_18 as passenger_over_18,
    cpp.seats as passenger_seats,

    abs(cpp.cost) as passenger_contribution,
    cpip.incentive::trip.incentive[] as passenger_incentive_raw,
    pip.incentive_raw::trip.incentive[] as passenger_incentive_rpc_raw,
    pip.incentive_sum as passenger_incentive_rpc_sum,

    cid.uuid as driver_id,
    (CASE WHEN cid.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as driver_card,

    abs(cpd.cost) as driver_revenue,
    cpid.incentive::trip.incentive[] as driver_incentive_raw,
    pid.incentive_raw::trip.incentive[] as driver_incentive_rpc_raw,
    pid.incentive_sum as driver_incentive_rpc_sum,

    cpp.status as status
    -- status_message

  FROM carpool.carpools as cpp
  JOIN operator.operators as ope ON ope._id = cpp.operator_id::int

  LEFT JOIN territory.territories_view AS tis ON tis._id = cpp.start_territory_id
  LEFT JOIN territory.territories_view AS tie ON tie._id = cpp.end_territory_id
  LEFT JOIN territory.territories_breadcrumb as tbs ON tbs.territory_id = cpp.start_territory_id
  LEFT JOIN territory.territories_breadcrumb as tbe ON tbe.territory_id = cpp.end_territory_id

  LEFT JOIN carpool.carpools AS cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true AND cpd.status = 'ok'::carpool.carpool_status_enum
  LEFT JOIN carpool.identities AS cip ON cip._id = cpp.identity_id
  LEFT JOIN carpool.identities AS cid ON cid._id = cpd.identity_id,
  LATERAL (
    WITH data AS (
      SELECT
        pi.policy_id,
        sum(pi.amount) as amount
      FROM policy.incentives as pi
      WHERE pi.carpool_id = cpp._id
      AND pi.status = 'validated'::policy.incentive_status_enum
      GROUP BY pi.policy_id
    ),
    incentive AS (
      SELECT
        ROW(
          cc.siret,
          data.amount,
          pp.unit::varchar,
          data.policy_id,
          'incentive'
        )::trip.incentive as value,
        data.amount as amount
      FROM data
      JOIN policy.policies as pp on pp._id = data.policy_id
      JOIN territory.territories as tt on pp.territory_id = tt._id
      JOIN company.companies as cc on cc._id = tt.company_id
    )
    SELECT
      array_agg(
        incentive.value
      ) as incentive_raw,
      sum(incentive.amount) as incentive_sum
    FROM incentive
  ) as pip,
  LATERAL (
    WITH data AS (
      SELECT
        pi.policy_id,
        sum(pi.amount) as amount
      FROM policy.incentives as pi
      WHERE pi.carpool_id = cpd._id
      AND pi.status = 'validated'::policy.incentive_status_enum
      GROUP BY pi.policy_id
    ),
    incentive AS (
      SELECT
        ROW(
          cc.siret,
          data.amount,
          pp.unit::varchar,
          data.policy_id,
          'incentive'
        )::trip.incentive as value,
        data.amount as amount
      FROM data
      JOIN policy.policies as pp on pp._id = data.policy_id
      JOIN territory.territories as tt on pp.territory_id = tt._id
      JOIN company.companies as cc on cc._id = tt.company_id
    )
    SELECT
      array_agg(
        incentive.value
      ) as incentive_raw,
      sum(incentive.amount) as incentive_sum
    FROM incentive
  ) as pid,
  LATERAL (
    SELECT
      array_agg(
        value::trip.incentive
      ) as incentive
    FROM json_array_elements(cpp.meta->'payments')
  ) as cpip,
  LATERAL (
      SELECT
      array_agg(
        value::trip.incentive
      ) as incentive
    FROM json_array_elements(cpd.meta->'payments')
  ) as cpid
  WHERE cpp.is_driver = false AND cpp.status = 'ok'::carpool.carpool_status_enum AND cpp.datetime >= (NOW() - '2 month'::interval)
);

CREATE INDEX ON trip.export(journey_start_datetime);
CREATE INDEX ON trip.export(start_territory_id);
CREATE INDEX ON trip.export(end_territory_id);
CREATE INDEX ON trip.export(operator_id);
CREATE INDEX ON trip.export(journey_start_weekday);
CREATE INDEX ON trip.export(journey_start_dayhour);
CREATE INDEX ON trip.export(journey_distance);
CREATE INDEX ON trip.export(journey_distance);
CREATE INDEX ON trip.list (operator_class);
