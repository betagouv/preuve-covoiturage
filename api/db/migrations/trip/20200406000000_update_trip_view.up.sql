DROP MATERIALIZED VIEW IF EXISTS trip.export;
DROP MATERIALIZED VIEW IF EXISTS trip.list;

CREATE TYPE trip.incentive AS (
  siret varchar,
  amount int,
  unit varchar,
  policy_id int,
  type varchar
);

CREATE OR REPLACE FUNCTION ts_ceil(_tstz timestamptz, _int_seconds int)
  RETURNS timestamptz AS
$func$   
SELECT to_timestamp(ceil(extract(epoch FROM $1) / $2) * $2)
$func$  LANGUAGE sql STABLE;

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
  select ROW(
    $1->>'siret',
    ($1->>'amount')::int,
    $1->>'unit',
    ($1->>'policy_id')::int,
    $1->>'type')::trip.incentive;
$$ language sql;

create cast (json as trip.incentive) with function json_to_incentive(_ti json) as assignment;

CREATE VIEW trip.list_view AS (
  SELECT

  -- THIS IS FOR AUTH AND SEARCH ONLY --
    cpp.operator_id as operator_id,
    cpp.start_territory_id as start_territory_id,
    cpp.end_territory_id as end_territory_id,
    COALESCE((pip.policy_id || pid.policy_id)::int[], ARRAY[]::int[]) as applied_policies,

    -- DATA --
    cpp.acquisition_id as journey_id,
    cpp.trip_id as trip_id,
    
    ts_ceil(cpp.datetime, 600) as journey_start_datetime,
    extract(isodow from cpp.datetime) as journey_start_weekday,
    extract(hour from cpp.datetime) as journey_start_dayhour,

    trunc(
      ST_X(cpp.start_position::geometry)::numeric,
      CASE WHEN (
        tts.surface > 0 AND 
        (tts.population::float / (tts.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_start_lon,
    trunc(
      ST_Y(cpp.start_position::geometry)::numeric,
      CASE WHEN (
        tts.surface > 0 AND 
        (tts.population::float / (tts.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_start_lat,

    cts.insee[1] as journey_start_insee,
    cts.postcode[1] as journey_start_postalcode,
    substring(cts.postcode[1] from 1 for 2) as journey_start_department,
    bts.town::varchar as journey_start_town,
    bts.towngroup::varchar as journey_start_towngroup,
    bts.country::varchar as journey_start_country,

    ts_ceil((cpp.datetime + (cpp.duration || ' seconds')::interval), 600) as journey_end_datetime,

    trunc(
      ST_X(cpp.end_position::geometry)::numeric,
      CASE WHEN (
        tte.surface > 0 AND 
        (tte.population::float / (tte.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_end_lon,
    trunc(
      ST_Y(cpp.end_position::geometry)::numeric,
      CASE WHEN (
        tte.surface > 0 AND 
        (tte.population::float / (tte.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_end_lat,

    cte.insee[1] as journey_end_insee,
    cte.postcode[1] as journey_end_postalcode,
    substring(cte.postcode[1] from 1 for 2) as journey_end_department,
    bte.town::varchar as journey_end_town,
    bte.towngroup::varchar as journey_end_towngroup,
    bte.country::varchar as journey_end_country,

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

  LEFT JOIN territory.territories AS tts ON tts._id = cpp.start_territory_id
  LEFT JOIN territory.territories AS tte ON tte._id = cpp.end_territory_id
  LEFT JOIN carpool.carpools AS cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true AND cpd.status = 'ok'::carpool.carpool_status_enum
  LEFT JOIN carpool.identities AS cip ON cip._id = cpp.identity_id
  LEFT JOIN carpool.identities AS cid ON cid._id = cpd.identity_id
  LEFT JOIN territory.get_codes(cpp.start_territory_id, ARRAY[]::int[]) AS cts ON TRUE
  LEFT JOIN territory.get_codes(cpp.end_territory_id, ARRAY[]::int[]) AS cte ON TRUE
  LEFT JOIN territory.get_breadcrumb(
    cpp.start_territory_id,
    territory.get_ancestors(ARRAY[cpp.start_territory_id])
  ) AS bts ON TRUE
  LEFT JOIN territory.get_breadcrumb(
    cpp.end_territory_id,
    territory.get_ancestors(ARRAY[cpp.end_territory_id])
  ) AS bte ON TRUE,
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
        data.policy_id as policy_id,
        ROW(
          cc.siret,
          data.amount,
          pp.unit::varchar,
          data.policy_id,
          'incentive'
        )::trip.incentive as value,
        data.amount as amount
      FROM data
      LEFT JOIN policy.policies as pp on pp._id = data.policy_id
      LEFT JOIN territory.territories as tt on pp.territory_id = tt._id
      LEFT JOIN company.companies as cc on cc._id = tt.company_id
    )
    SELECT
      array_agg(
        incentive.value
      ) as incentive_raw,
      sum(incentive.amount) as incentive_sum,
      array_agg(incentive.policy_id) as policy_id
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
        data.policy_id as policy_id,
        ROW(
          cc.siret,
          data.amount,
          pp.unit::varchar,
          data.policy_id,
          'incentive'
        )::trip.incentive as value,
        data.amount as amount
      FROM data
      LEFT JOIN policy.policies as pp on pp._id = data.policy_id
      LEFT JOIN territory.territories as tt on pp.territory_id = tt._id
      LEFT JOIN company.companies as cc on cc._id = tt.company_id
    )
    SELECT
      array_agg(
        incentive.value
      ) as incentive_raw,
      sum(incentive.amount) as incentive_sum,
      array_agg(incentive.policy_id) as policy_id
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
  WHERE cpp.is_driver = false AND cpp.status = 'ok'::carpool.carpool_status_enum
);

CREATE TABLE trip.list (
 operator_id integer,
 start_territory_id integer,
 end_territory_id integer,
 applied_policies integer[],
 journey_id integer,
 trip_id varchar(256),
 journey_start_datetime timestamp with time zone,
 journey_start_weekday integer,
 journey_start_dayhour integer,
 journey_start_lon decimal,
 journey_start_lat decimal,
 journey_start_insee varchar(10),
 journey_start_postalcode varchar(10),
 journey_start_department varchar(2),
 journey_start_town varchar(128),
 journey_start_towngroup varchar(128),
 journey_start_country varchar(128),
 journey_end_datetime timestamp with time zone,
 journey_end_lon decimal,
 journey_end_lat decimal,
 journey_end_insee varchar(10),
 journey_end_postalcode varchar(10),
 journey_end_department varchar(2),
 journey_end_town varchar(128),
 journey_end_towngroup varchar(128),
 journey_end_country varchar(128),
 journey_distance integer,
 journey_distance_anounced integer,
 journey_distance_calculated integer,
 journey_duration integer,
 journey_duration_anounced integer,
 journey_duration_calculated integer,
 operator varchar(128),
 operator_class character(1),
 passenger_id uuid,
 passenger_card boolean,
 passenger_over_18 boolean,
 passenger_seats integer,
 passenger_contribution integer,
 passenger_incentive_raw trip.incentive[],
 passenger_incentive_rpc_raw trip.incentive[],
 passenger_incentive_rpc_sum integer,
 driver_id uuid,
 driver_card boolean,
 driver_revenue integer,
 driver_incentive_raw trip.incentive[],
 driver_incentive_rpc_raw trip.incentive[],
 driver_incentive_rpc_sum integer,
 status carpool.carpool_status_enum
);

CREATE INDEX ON trip.list(journey_start_datetime);
CREATE INDEX ON trip.list(start_territory_id);
CREATE INDEX ON trip.list(end_territory_id);
CREATE INDEX ON trip.list(operator_id);
CREATE INDEX ON trip.list(applied_policies);
CREATE INDEX ON trip.list(journey_start_weekday);
CREATE INDEX ON trip.list(journey_start_dayhour);
CREATE INDEX ON trip.list(journey_distance);
CREATE INDEX ON trip.list(journey_distance);
CREATE INDEX ON trip.list (operator_class);
CREATE UNIQUE INDEX IF NOT EXISTS trip_list_journey_id_idx ON trip.list (journey_id);

CREATE OR REPLACE FUNCTION hydrate_trip_from_carpool() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trip.list
    SELECT * FROM trip.list_view WHERE journey_id = NEW.acquisition_id
    ON CONFLICT (journey_id)
    DO UPDATE SET (
      operator_id,
      start_territory_id,
      end_territory_id,
      applied_policies,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_postalcode,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
      journey_end_postalcode,
      journey_end_department,
      journey_end_town,
      journey_end_towngroup,
      journey_end_country,
      journey_distance,
      journey_distance_anounced,
      journey_distance_calculated,
      journey_duration,
      journey_duration_anounced,
      journey_duration_calculated,
      operator,
      operator_class,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      status
    ) = (
      excluded.operator_id,
      excluded.start_territory_id,
      excluded.end_territory_id,
      excluded.applied_policies,
      excluded.trip_id,
      excluded.journey_start_datetime,
      excluded.journey_start_weekday,
      excluded.journey_start_dayhour,
      excluded.journey_start_lon,
      excluded.journey_start_lat,
      excluded.journey_start_insee,
      excluded.journey_start_postalcode,
      excluded.journey_start_department,
      excluded.journey_start_town,
      excluded.journey_start_towngroup,
      excluded.journey_start_country,
      excluded.journey_end_datetime,
      excluded.journey_end_lon,
      excluded.journey_end_lat,
      excluded.journey_end_insee,
      excluded.journey_end_postalcode,
      excluded.journey_end_department,
      excluded.journey_end_town,
      excluded.journey_end_towngroup,
      excluded.journey_end_country,
      excluded.journey_distance,
      excluded.journey_distance_anounced,
      excluded.journey_distance_calculated,
      excluded.journey_duration,
      excluded.journey_duration_anounced,
      excluded.journey_duration_calculated,
      excluded.operator,
      excluded.operator_class,
      excluded.passenger_id,
      excluded.passenger_card,
      excluded.passenger_over_18,
      excluded.passenger_seats,
      excluded.passenger_contribution,
      excluded.passenger_incentive_raw,
      excluded.passenger_incentive_rpc_raw,
      excluded.passenger_incentive_rpc_sum,
      excluded.driver_id,
      excluded.driver_card,
      excluded.driver_revenue,
      excluded.driver_incentive_raw,
      excluded.driver_incentive_rpc_raw,
      excluded.driver_incentive_rpc_sum,
      excluded.status
    );
    RETURN NULL;
END;
$$ language plpgsql;
        
CREATE TRIGGER hydrate_trip_from_carpool
    AFTER INSERT OR UPDATE ON carpool.carpools
    FOR EACH ROW EXECUTE PROCEDURE hydrate_trip_from_carpool();

-- ADD TRIGGER WHEN INSERT/UPDATE ON policy.incentives
CREATE OR REPLACE FUNCTION hydrate_trip_from_policy() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trip.list
    SELECT tv.* FROM carpool.carpools AS cc
    LEFT JOIN trip.list_view AS tv ON tv.journey_id = cc.acquisition_id
    WHERE cc._id = NEW.carpool_id
    ON CONFLICT (journey_id)
    DO UPDATE SET (
      operator_id,
      start_territory_id,
      end_territory_id,
      applied_policies,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_postalcode,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
      journey_end_postalcode,
      journey_end_department,
      journey_end_town,
      journey_end_towngroup,
      journey_end_country,
      journey_distance,
      journey_distance_anounced,
      journey_distance_calculated,
      journey_duration,
      journey_duration_anounced,
      journey_duration_calculated,
      operator,
      operator_class,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      status
    ) = (
      excluded.operator_id,
      excluded.start_territory_id,
      excluded.end_territory_id,
      excluded.applied_policies,
      excluded.trip_id,
      excluded.journey_start_datetime,
      excluded.journey_start_weekday,
      excluded.journey_start_dayhour,
      excluded.journey_start_lon,
      excluded.journey_start_lat,
      excluded.journey_start_insee,
      excluded.journey_start_postalcode,
      excluded.journey_start_department,
      excluded.journey_start_town,
      excluded.journey_start_towngroup,
      excluded.journey_start_country,
      excluded.journey_end_datetime,
      excluded.journey_end_lon,
      excluded.journey_end_lat,
      excluded.journey_end_insee,
      excluded.journey_end_postalcode,
      excluded.journey_end_department,
      excluded.journey_end_town,
      excluded.journey_end_towngroup,
      excluded.journey_end_country,
      excluded.journey_distance,
      excluded.journey_distance_anounced,
      excluded.journey_distance_calculated,
      excluded.journey_duration,
      excluded.journey_duration_anounced,
      excluded.journey_duration_calculated,
      excluded.operator,
      excluded.operator_class,
      excluded.passenger_id,
      excluded.passenger_card,
      excluded.passenger_over_18,
      excluded.passenger_seats,
      excluded.passenger_contribution,
      excluded.passenger_incentive_raw,
      excluded.passenger_incentive_rpc_raw,
      excluded.passenger_incentive_rpc_sum,
      excluded.driver_id,
      excluded.driver_card,
      excluded.driver_revenue,
      excluded.driver_incentive_raw,
      excluded.driver_incentive_rpc_raw,
      excluded.driver_incentive_rpc_sum,
      excluded.status
    );
    RETURN NULL;
END;
$$ language plpgsql;

CREATE TRIGGER hydrate_trip_from_policy
    AFTER INSERT OR UPDATE ON policy.incentives
    FOR EACH ROW EXECUTE PROCEDURE hydrate_trip_from_policy();
