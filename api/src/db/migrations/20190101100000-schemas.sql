CREATE SCHEMA acquisition;
CREATE SCHEMA application;
CREATE SCHEMA auth;
CREATE SCHEMA carpool;
CREATE SCHEMA carpool_v2;
CREATE SCHEMA cee;
CREATE SCHEMA certificate;
CREATE SCHEMA common;
CREATE SCHEMA company;
CREATE SCHEMA export;
CREATE SCHEMA fraudcheck;
CREATE SCHEMA geo;
CREATE SCHEMA honor;
CREATE SCHEMA operator;
CREATE SCHEMA policy;
CREATE SCHEMA public;
COMMENT ON SCHEMA public IS 'standard public schema';
CREATE SCHEMA territory;
CREATE SCHEMA trip;
CREATE TYPE acquisition.acquisition_status_enum AS ENUM (
    'ok',
    'error',
    'pending',
    'canceled'
);
CREATE TYPE auth.user_status_enum AS ENUM (
    'pending',
    'active',
    'invited',
    'blocked'
);
CREATE TYPE carpool.carpool_status_enum AS ENUM (
    'ok',
    'expired',
    'canceled',
    'fraudcheck_error',
    'anomaly_error'
);
CREATE TYPE carpool.tmp_incentive AS (
	index smallint,
	siret character varying(14),
	amount integer
);
CREATE TYPE carpool_v2.carpool_acquisition_status_enum AS ENUM (
    'received',
    'updated',
    'processed',
    'failed',
    'canceled',
    'expired'
);
CREATE TYPE carpool_v2.carpool_fraud_status_enum AS ENUM (
    'pending',
    'passed',
    'failed'
);
CREATE TYPE cee.application_error_enum AS ENUM (
    'validation',
    'date',
    'non-eligible',
    'conflict'
);
CREATE TYPE cee.journey_type_enum AS ENUM (
    'short',
    'long'
);
CREATE TYPE fraudcheck.status_enum AS ENUM (
    'pending',
    'done',
    'error'
);
CREATE TYPE fraudcheck.result AS (
	method character varying(128),
	status fraudcheck.status_enum,
	karma double precision,
	meta json
);
CREATE TYPE policy.incentive_state_enum AS ENUM (
    'regular',
    'null',
    'disabled'
);
CREATE TYPE policy.incentive_status_enum AS ENUM (
    'draft',
    'pending',
    'validated',
    'warning',
    'error'
);
CREATE TYPE policy.policy_status_enum AS ENUM (
    'template',
    'draft',
    'active',
    'finished'
);
CREATE TYPE policy.policy_unit_enum AS ENUM (
    'euro',
    'point'
);
CREATE TYPE territory.breadcrumb AS (
	country character varying,
	countrygroup character varying,
	district character varying,
	megalopolis character varying,
	other character varying,
	region character varying,
	state character varying,
	town character varying,
	towngroup character varying
);
CREATE TYPE territory.codes AS (
	insee character varying[],
	postcode character varying[],
	codedep character varying[]
);
CREATE TYPE territory.territory_level_enum AS ENUM (
    'town',
    'towngroup',
    'district',
    'megalopolis',
    'region',
    'state',
    'country',
    'countrygroup',
    'other'
);
CREATE TYPE territory.view AS (
	_id integer,
	active boolean,
	activable boolean,
	level territory.territory_level_enum,
	parents integer[],
	children integer[],
	ancestors integer[],
	descendants integer[],
	insee character varying[],
	postcode character varying[],
	codedep character varying[],
	breadcrumb territory.breadcrumb
);
CREATE TYPE trip.incentive AS (
	siret character varying,
	amount integer,
	unit character varying,
	policy_id integer,
	policy_name character varying,
	type character varying
);
CREATE FUNCTION fraudcheck.result_array_to_json(_ti fraudcheck.result[]) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_agg(fraudcheck.result_to_json(data)) FROM UNNEST($1) as data;
$_$;
CREATE FUNCTION public.breadcrumb_to_json(bc territory.breadcrumb) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_build_object(
    'country', $1.country
  , 'countrygroup', $1.countrygroup
  , 'district', $1.district
  , 'megalopolis', $1.megalopolis
  , 'other', $1.other
  , 'region', $1.region
  , 'state', $1.state
  , 'town', $1.town
  , 'towngroup', $1.towngroup
 
  );
$_$;
CREATE FUNCTION public.incentive_to_json(_ti trip.incentive) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_build_object(
    'siret', $1.siret
  , 'amount', $1.amount
  , 'unit', $1.unit
  , 'policy_id', $1.policy_id
  , 'policy_name', $1.policy_name
  , 'type', $1.type
  );
$_$;
CREATE FUNCTION fraudcheck.json_to_result_array(_ti json) RETURNS fraudcheck.result[]
    LANGUAGE sql
    AS $_$
	select array_agg(fraudcheck.json_to_result(value)) from json_array_elements($1)
$_$;
CREATE FUNCTION public.json_to_breadcrumb(bc json) RETURNS territory.breadcrumb
    LANGUAGE sql
    AS $_$
  select ROW(
    $1->>'country',
    $1->>'countrygroup',
    $1->>'district',
    $1->>'megalopolis',
    $1->>'other',
    $1->>'region',
    $1->>'state',
    $1->>'town',
    $1->>'towngroup')::territory.breadcrumb;
$_$;
CREATE FUNCTION public.json_to_incentive(_ti json) RETURNS trip.incentive
    LANGUAGE sql
    AS $_$
  select ROW(
    $1->>'siret',
    ($1->>'amount')::int,
    $1->>'unit',
    ($1->>'policy_id')::int,
    ($1->>'policy_name')::varchar,
    $1->>'type')::trip.incentive;
$_$;
CREATE FUNCTION fraudcheck.json_to_result(_ti json) RETURNS fraudcheck.result
    LANGUAGE sql
    AS $_$
  select ROW(
    $1->>'method',
    ($1->>'status')::fraudcheck.status_enum,
    ($1->>'karma')::float,
    ($1->>'meta')::json)::fraudcheck.result;
$_$;
CREATE FUNCTION fraudcheck.result_to_json(_ti fraudcheck.result) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_build_object(
    'method', $1.method
  , 'status', $1.status
  , 'karma', $1.karma
  , 'meta', $1.meta
  );
$_$;
CREATE FUNCTION common.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
CREATE FUNCTION geo.get_by_code(code character varying, year smallint) RETURNS TABLE(year smallint, l_arr character varying, arr character varying, l_com character varying, com character varying, l_epci character varying, epci character varying, l_dep character varying, dep character varying, l_reg character varying, reg character varying, l_country character varying, country character varying, l_aom character varying, aom character varying, l_reseau character varying, reseau integer, pop integer, surface real)
    LANGUAGE sql
    AS $_$
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
    $_$;
CREATE FUNCTION geo.get_by_point(lon double precision, lat double precision, year smallint) RETURNS TABLE(year smallint, l_arr character varying, arr character varying, l_com character varying, com character varying, l_epci character varying, epci character varying, l_dep character varying, dep character varying, l_reg character varying, reg character varying, l_country character varying, country character varying, l_aom character varying, aom character varying, l_reseau character varying, reseau integer, pop integer, surface real)
    LANGUAGE sql
    AS $_$
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
        AND year = $3 
        AND ST_WITHIN(ST_SETSRID(ST_POINT($1, $2), '4326'), geom)
      ORDER BY year DESC, surface ASC
      LIMIT 1
    $_$;
CREATE FUNCTION geo.get_closest_com(lon double precision, lat double precision, buffer integer DEFAULT 1000) RETURNS TABLE(year smallint, l_arr character varying, arr character varying, l_com character varying, com character varying, l_epci character varying, epci character varying, l_dep character varying, dep character varying, l_reg character varying, reg character varying, l_country character varying, country character varying, l_aom character varying, aom character varying, l_reseau character varying, reseau integer, pop integer, surface real, distance double precision)
    LANGUAGE sql STABLE
    AS $_$
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
        AND country = 'XXXXX'
        AND
        ST_Intersects(ST_Buffer(ST_Transform(ST_SetSRID(ST_Point($1, $2),'4326'),2154),$3),ST_Transform(geom,2154))
      ORDER BY year DESC, distance ASC
      LIMIT 1
    $_$;
CREATE FUNCTION geo.get_closest_country(lon double precision, lat double precision) RETURNS TABLE(year smallint, l_arr character varying, arr character varying, l_com character varying, com character varying, l_epci character varying, epci character varying, l_dep character varying, dep character varying, l_reg character varying, reg character varying, l_country character varying, country character varying, l_aom character varying, aom character varying, l_reseau character varying, reseau integer, pop integer, surface real)
    LANGUAGE sql STABLE
    AS $_$
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
        AND
        ST_Intersects(ST_Buffer(ST_Transform(ST_SetSRID(ST_Point($1, $2),'4326'),2154),1000),ST_Transform(geom,2154))
      ORDER BY year DESC
      LIMIT 1
    $_$;
CREATE FUNCTION geo.get_latest_by_code(code character varying) RETURNS TABLE(year smallint, l_arr character varying, arr character varying, l_com character varying, com character varying, l_epci character varying, epci character varying, l_dep character varying, dep character varying, l_reg character varying, reg character varying, l_country character varying, country character varying, l_aom character varying, aom character varying, l_reseau character varying, reseau integer, pop integer, surface real)
    LANGUAGE sql
    AS $_$
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
    $_$;
CREATE FUNCTION geo.get_latest_by_point(lon double precision, lat double precision) RETURNS TABLE(year smallint, l_arr character varying, arr character varying, l_com character varying, com character varying, l_epci character varying, epci character varying, l_dep character varying, dep character varying, l_reg character varying, reg character varying, l_country character varying, country character varying, l_aom character varying, aom character varying, l_reseau character varying, reseau integer, pop integer, surface real)
    LANGUAGE sql
    AS $_$
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
        AND ST_WITHIN(ST_SETSRID(ST_POINT($1, $2), '4326'), geom)
      ORDER BY year DESC, surface ASC
      LIMIT 1
    $_$;
CREATE FUNCTION geo.get_latest_millesime() RETURNS smallint
    LANGUAGE sql
    AS $$
      SELECT 
        max(year)
      FROM geo.perimeters
    $$;
CREATE FUNCTION geo.get_latest_millesime_or(l smallint) RETURNS smallint
    LANGUAGE sql
    AS $_$
      SELECT max(year) as year FROM geo.perimeters WHERE year = $1
      UNION ALL
      SELECT max(year) as year FROM geo.perimeters
      ORDER BY year
      LIMIT 1
    $_$;
CREATE FUNCTION public.gmap_url(start_position public.geography, end_position public.geography) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
  RETURN 'https://www.google.com/maps/dir/' || ST_Y(start_position::geometry) || ',' || ST_X(start_position::geometry) || '/' || ST_Y(end_position::geometry) || ',' || ST_X(end_position::geometry);
END;
$$;
CREATE FUNCTION public.hydrate_trip_from_carpool() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO trip.list ( 
      operator_id,
      applied_policies,
      journey_id,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
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
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) SELECT
      operator_id,
      applied_policies,
      journey_id,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
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
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    FROM trip.list_view WHERE journey_id = NEW.acquisition_id
    ON CONFLICT (journey_id)
    DO UPDATE SET (
      operator_id,
      applied_policies,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
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
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) = (
      excluded.operator_id,
      excluded.applied_policies,
      excluded.trip_id,
      excluded.journey_start_datetime,
      excluded.journey_start_weekday,
      excluded.journey_start_dayhour,
      excluded.journey_start_lon,
      excluded.journey_start_lat,
      excluded.journey_start_insee,
      excluded.journey_start_department,
      excluded.journey_start_town,
      excluded.journey_start_towngroup,
      excluded.journey_start_country,
      excluded.journey_end_datetime,
      excluded.journey_end_lon,
      excluded.journey_end_lat,
      excluded.journey_end_insee,
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
      excluded.operator_journey_id,
      excluded.operator_passenger_id,
      excluded.operator_driver_id,
      excluded.passenger_id,
      excluded.passenger_card,
      excluded.passenger_over_18,
      excluded.passenger_seats,
      excluded.passenger_contribution,
      excluded.passenger_incentive_raw,
      excluded.passenger_incentive_rpc_raw,
      excluded.passenger_incentive_rpc_sum,
      excluded.passenger_incentive_rpc_financial_sum,
      excluded.driver_id,
      excluded.driver_card,
      excluded.driver_revenue,
      excluded.driver_incentive_raw,
      excluded.driver_incentive_rpc_raw,
      excluded.driver_incentive_rpc_sum,
      excluded.driver_incentive_rpc_financial_sum,
      excluded.status
    );
    RETURN NULL;
END;
$$;
CREATE FUNCTION public.hydrate_trip_from_policy() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO trip.list ( 
      operator_id,
      applied_policies,
      journey_id,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
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
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) SELECT
      tv.operator_id,
      tv.applied_policies,
      tv.journey_id,
      tv.trip_id,
      tv.journey_start_datetime,
      tv.journey_start_weekday,
      tv.journey_start_dayhour,
      tv.journey_start_lon,
      tv.journey_start_lat,
      tv.journey_start_insee,
      tv.journey_start_department,
      tv.journey_start_town,
      tv.journey_start_towngroup,
      tv.journey_start_country,
      tv.journey_end_datetime,
      tv.journey_end_lon,
      tv.journey_end_lat,
      tv.journey_end_insee,
      tv.journey_end_department,
      tv.journey_end_town,
      tv.journey_end_towngroup,
      tv.journey_end_country,
      tv.journey_distance,
      tv.journey_distance_anounced,
      tv.journey_distance_calculated,
      tv.journey_duration,
      tv.journey_duration_anounced,
      tv.journey_duration_calculated,
      tv.operator,
      tv.operator_class,
      tv.operator_journey_id,
      tv.operator_passenger_id,
      tv.operator_driver_id,
      tv.passenger_id,
      tv.passenger_card,
      tv.passenger_over_18,
      tv.passenger_seats,
      tv.passenger_contribution,
      tv.passenger_incentive_raw,
      tv.passenger_incentive_rpc_raw,
      tv.passenger_incentive_rpc_sum,
      tv.passenger_incentive_rpc_financial_sum,
      tv.driver_id,
      tv.driver_card,
      tv.driver_revenue,
      tv.driver_incentive_raw,
      tv.driver_incentive_rpc_raw,
      tv.driver_incentive_rpc_sum,
      tv.driver_incentive_rpc_financial_sum,
      tv.status
    FROM carpool.carpools AS cc
    LEFT JOIN trip.list_view AS tv ON tv.journey_id = cc.acquisition_id
    WHERE cc._id = NEW.carpool_id
    ON CONFLICT (journey_id)
    DO UPDATE SET (
      operator_id,
      applied_policies,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
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
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) = (
      excluded.operator_id,
      excluded.applied_policies,
      excluded.trip_id,
      excluded.journey_start_datetime,
      excluded.journey_start_weekday,
      excluded.journey_start_dayhour,
      excluded.journey_start_lon,
      excluded.journey_start_lat,
      excluded.journey_start_insee,
      excluded.journey_start_department,
      excluded.journey_start_town,
      excluded.journey_start_towngroup,
      excluded.journey_start_country,
      excluded.journey_end_datetime,
      excluded.journey_end_lon,
      excluded.journey_end_lat,
      excluded.journey_end_insee,
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
      excluded.operator_journey_id,
      excluded.operator_passenger_id,
      excluded.operator_driver_id,
      excluded.passenger_id,
      excluded.passenger_card,
      excluded.passenger_over_18,
      excluded.passenger_seats,
      excluded.passenger_contribution,
      excluded.passenger_incentive_raw,
      excluded.passenger_incentive_rpc_raw,
      excluded.passenger_incentive_rpc_sum,
      excluded.passenger_incentive_rpc_financial_sum,
      excluded.driver_id,
      excluded.driver_card,
      excluded.driver_revenue,
      excluded.driver_incentive_raw,
      excluded.driver_incentive_rpc_raw,
      excluded.driver_incentive_rpc_sum,
      excluded.driver_incentive_rpc_financial_sum,
      excluded.status
    );
    RETURN NULL;
END;
$$;
CREATE FUNCTION public.populate_fraud_from_carpool(days integer) RETURNS void
    LANGUAGE plpgsql
    AS $_$
BEGIN
    INSERT INTO fraudcheck.fraudchecks (acquisition_id)
    SELECT distinct cc.acquisition_id FROM carpool.carpools AS cc
    LEFT JOIN fraudcheck.fraudchecks AS ff
      ON ff.acquisition_id = cc.acquisition_id
    WHERE
      cc.datetime >= NOW() - $1 * '1 hour'::interval AND
      cc.status = 'ok' AND
      ff.acquisition_id IS NULL;
END;
$_$;
CREATE FUNCTION public.tlv(start_datetime timestamp without time zone, end_datetime timestamp without time zone, operator_id integer, policy_id integer) RETURNS TABLE(min double precision, max double precision, count bigint, not_null bigint, sub_count bigint, driver_sum double precision, passenger_sum double precision)
    LANGUAGE sql
    AS $_$
  with ccd as (
    select
    _id,
    identity_id,
    datetime,
    trip_id,
    acquisition_id,
    operator_trip_id,
    distance,
    duration,
    operator_class
    from carpool.carpools
    where
    datetime >= $1
    and datetime < $2
    and status = 'ok'
    and operator_id = $3
    and is_driver = true
  ),
  trips as (
    select
    ccd._id as driver_carpool_id,
    ccp._id as passenger_carpool_id,
    ccd.trip_id,
    ccd.operator_trip_id as operator_journey_id,
    
    cid.uuid as driver_uuid,
    cid.operator_user_id as operator_driver_id,
    pid.amount as driver_rpc_incentive,
    
    cip.uuid as passenger_uuid,
    cip.operator_user_id as operator_passenger_id,
    pip.amount as passenger_rpc_incentive,
    
    
    ccd.datetime as start_datetime,
    ccd.datetime + (ccd.duration || ' seconds')::interval as end_datetime,
    ccd.duration,
    ccd.distance,
    ccd.operator_class
    from ccd
    left join carpool.carpools ccp on ccd.acquisition_id = ccp.acquisition_id and ccp.is_driver = false
    left join carpool.identities cid on cid._id = ccd.identity_id
    left join carpool.identities cip on cip._id = ccp.identity_id
    left join policy.incentives pid on ccd._id = pid.carpool_id and pid.policy_id = $4 and pid.status = 'validated'
    left join policy.incentives pip on ccp._id = pip.carpool_id and pip.policy_id = $4 and pid.status = 'validated'
    where pid.policy_id is not null or pip.policy_id is not null
    order by
    ccd.trip_id,
    ccd.datetime
  )
  select
    min(distance)::float / 1000,
    max(distance)::float / 1000,
    count(*),
    count(*) filter (where driver_rpc_incentive is not null) as not_null,
    count(*) filter (where driver_rpc_incentive > 0) as sub_count,
    sum(driver_rpc_incentive)::float / 100 as driver_sum,
    sum(passenger_rpc_incentive)::float / 100 as passenger_sum
  from trips
$_$;
CREATE FUNCTION public.ts_ceil(_tstz timestamp with time zone, _int_seconds integer) RETURNS timestamp with time zone
    LANGUAGE sql STABLE
    AS $_$   
SELECT to_timestamp(ceil(extract(epoch FROM $1) / $2) * $2)
$_$;
CREATE FUNCTION territory.get_ancestors(ids integer[]) RETURNS integer[]
    LANGUAGE sql STABLE
    AS $$
  WITH RECURSIVE ancestors AS (
    SELECT 
      t.parent_territory_id AS ancestor
    FROM territory.territory_relation AS t
    JOIN unnest(ids) AS input_id ON input_id = t.child_territory_id
    UNION ALL
    SELECT
      t.parent_territory_id AS ancestor
    FROM territory.territory_relation AS t
    JOIN ancestors AS l ON l.ancestor = t.child_territory_id
  ) SELECT array_agg(distinct ancestor) FROM ancestors;
$$;
CREATE FUNCTION territory.get_breadcrumb(target_id integer, ancestors_ids integer[]) RETURNS territory.breadcrumb
    LANGUAGE sql STABLE
    AS $$
  WITH breadcrumb AS (
    SELECT
      target_id as _id,
      array_remove(array_agg(country.name), NULL) as country,
      array_remove(array_agg(countrygroup.name), NULL) as countrygroup,
      array_remove(array_agg(district.name), NULL) as district,
      array_remove(array_agg(megalopolis.name), NULL) as megalopolis,
      array_remove(array_agg(other.name), NULL) as other,
      array_remove(array_agg(region.name), NULL) as region,
      array_remove(array_agg(state.name), NULL) as state,
      array_remove(array_agg(town.name), NULL) as town,
      array_remove(array_agg(towngroup.name), NULL) as towngroup
    FROM unnest(ARRAY[target_id]) AS target_id
    LEFT JOIN unnest(ancestors_ids) AS a_id ON TRUE
    LEFT JOIN territory.territories as country on (a_id = country._id OR target_id = country._id) AND country.level = 'country'
    LEFT JOIN territory.territories as countrygroup on (a_id = countrygroup._id OR target_id = countrygroup._id) AND countrygroup.level = 'countrygroup'
    LEFT JOIN territory.territories as district on (a_id = district._id OR target_id = district._id) AND district.level = 'district'
    LEFT JOIN territory.territories as megalopolis on (a_id = megalopolis._id OR target_id = megalopolis._id) AND megalopolis.level = 'megalopolis'
    LEFT JOIN territory.territories as other on (a_id = other._id OR target_id = other._id) AND other.level = 'other'
    LEFT JOIN territory.territories as region on (a_id = region._id OR target_id = region._id) AND region.level = 'region'
    LEFT JOIN territory.territories as state on (a_id = state._id OR target_id = state._id) AND state.level = 'state'
    LEFT JOIN territory.territories as town on (a_id = town._id OR target_id = town._id) AND town.level = 'town'
    LEFT JOIN territory.territories as towngroup on (a_id = towngroup._id OR target_id = towngroup._id) AND towngroup.level = 'towngroup'
    GROUP BY target_id
  )
  SELECT
    row(
        bc.country[1],
        bc.countrygroup[1],
        bc.district[1],
        bc.megalopolis[1],
        bc.other[1],
        bc.region[1],
        bc.state[1],
        bc.town[1],
        bc.towngroup[1]
      )::territory.breadcrumb as breadcrumb
  FROM breadcrumb as bc
$$;
CREATE FUNCTION territory.get_codes(target_id integer, descendants_ids integer[]) RETURNS territory.codes
    LANGUAGE sql STABLE
    AS $$
  WITH codes AS (
    SELECT
      target_id as territory_id,
      array_remove(array_agg(distinct tc.value) FILTER(where tc.type = 'insee'), null) AS insee,
      array_remove(array_agg(distinct tc.value) FILTER(where tc.type = 'postcode'), null) AS postcode,
      array_remove(array_agg(distinct tc.value) FILTER(where tc.type = 'codedep'), null) AS codedep
    FROM territory.territory_codes AS tc
    WHERE territory_id = ANY(descendants_ids || target_id)
    GROUP BY target_id
  )
  SELECT
    row(
      c.insee,
      c.postcode,
      c.codedep
    )::territory.codes as codes
  FROM codes as c
$$;
CREATE FUNCTION territory.get_com_by_territory_id(_id integer, year smallint) RETURNS TABLE(com character varying)
    LANGUAGE sql STABLE
    AS $_$
  with data as (select * from territory.territory_group_selector where territory_group_id = $1)
  select gp.arr as com from geo.perimeters gp join data d 
    on (d.selector_type = 'arr' OR d.selector_type = 'com') and d.selector_value = gp.arr
  where year = $2::smallint
  union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'aom' and d.selector_value = gp.aom
  where year = $2::smallint
  union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'epci' and d.selector_value = gp.epci
  where year = $2::smallint
  union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'reg' and d.selector_value = gp.reg
  where year = $2::smallint
    union
  select gp.arr as com from geo.perimeters gp join data d 
    on d.selector_type = 'dep' and d.selector_value = gp.dep
  where year = $2::smallint
  ;
$_$;
CREATE FUNCTION territory.get_data(ids integer[]) RETURNS SETOF territory.view
    LANGUAGE sql STABLE
    AS $$
WITH RECURSIVE
  
  input AS (
    SELECT
      t._id,
      t.active::boolean,
      t.activable::boolean,
      t.level::territory.territory_level_enum,
      territory.get_ancestors(ARRAY[t._id]) as ancestors,
      territory.get_descendants(ARRAY[t._id]) as descendants
    FROM UNNEST(ids::int[]) as unnest_id
    JOIN territory.territories AS t on t._id = unnest_id
  ),
  codes AS (
    SELECT
      i._id,
      territory.get_codes(i._id, i.descendants) as codes
    FROM input as i
  ),
  direct_relation AS (
    SELECT
      i._id,
      array_remove(array_agg(distinct c.child_territory_id), NULL) as children,
      array_remove(array_agg(distinct p.parent_territory_id), NULL) as parents
    FROM input as i
    LEFT JOIN territory.territory_relation as c on c.parent_territory_id = i._id
    LEFT JOIN territory.territory_relation as p on p.child_territory_id = i._id
    GROUP BY i._id
  )
  SELECT
    i._id,
    i.active,
    i.activable,
    i.level,
    dr.parents as parents,
    dr.children as children,
    i.ancestors,
    i.descendants,
    (c.codes).insee::varchar[],
    (c.codes).postcode::varchar[],
    (c.codes).codedep::varchar[],
    territory.get_breadcrumb(i._id, i.ancestors) as breadcrumb
  FROM input AS i
  LEFT JOIN codes as c on c._id = i._id
  LEFT JOIN direct_relation as dr on dr._id = i._id;
$$;
CREATE FUNCTION territory.get_descendants(ids integer[]) RETURNS integer[]
    LANGUAGE sql STABLE
    AS $$
  WITH RECURSIVE descendants AS (
    SELECT 
      t.child_territory_id AS descendant
    FROM territory.territory_relation AS t
    JOIN unnest(ids) AS input_id ON input_id = t.parent_territory_id
    UNION ALL
    SELECT
      t.child_territory_id AS descendant
    FROM territory.territory_relation AS t
    JOIN descendants AS l ON l.descendant = t.parent_territory_id
  ) SELECT array_agg(distinct descendant) FROM descendants;
$$;
CREATE FUNCTION territory.get_relations(ids integer[]) RETURNS integer[]
    LANGUAGE sql STABLE
    AS $$
  WITH data AS (
    SELECT * FROM unnest(territory.get_descendants(ids)) as _id
    UNION
    SELECT * FROM unnest(territory.get_ancestors(ids)) as _id
  ) SELECT array_agg(distinct _id) from data;
$$;
CREATE FUNCTION territory.get_selector_by_territory_id(_id integer[]) RETURNS TABLE(territory_id integer, selector json)
    LANGUAGE sql STABLE
    AS $_$
  WITH selector_raw AS (
    SELECT
      territory_group_id,
      selector_type,
      ARRAY_AGG(selector_value) as selector_value
    FROM territory.territory_group_selector
    WHERE territory_group_id = ANY($1)
    GROUP BY territory_group_id, selector_type
  )
  SELECT
    territory_group_id as territory_id,
    JSON_OBJECT_AGG(
      selector_type,
      selector_value
    ) as selector
  FROM selector_raw
  GROUP BY territory_group_id
$_$;
SET default_tablespace = '';
SET default_table_access_method = heap;
CREATE TABLE acquisition.acquisitions (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    application_id integer NOT NULL,
    operator_id integer NOT NULL,
    journey_id character varying NOT NULL,
    payload json NOT NULL,
    api_version smallint DEFAULT 2 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id character varying,
    status acquisition.acquisition_status_enum DEFAULT 'pending'::acquisition.acquisition_status_enum NOT NULL,
    try_count smallint DEFAULT 0 NOT NULL,
    error_stage character varying(255),
    errors jsonb,
    cancel_code character varying(32),
    cancel_message character varying(512)
);
CREATE SEQUENCE acquisition.acquisitions__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE acquisition.acquisitions__id_seq OWNED BY acquisition.acquisitions._id;
CREATE TABLE carpool.carpools (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    acquisition_id integer,
    operator_id integer,
    trip_id character varying,
    operator_trip_id character varying,
    is_driver boolean,
    operator_class character(1),
    datetime timestamp with time zone,
    duration integer,
    start_position public.geography,
    end_position public.geography,
    distance integer,
    seats integer DEFAULT 1,
    identity_id integer NOT NULL,
    operator_journey_id character varying,
    cost integer DEFAULT 0 NOT NULL,
    meta json,
    status carpool.carpool_status_enum DEFAULT 'ok'::carpool.carpool_status_enum NOT NULL,
    start_territory_id integer,
    end_territory_id integer,
    start_geo_code character varying(5) NOT NULL,
    end_geo_code character varying(5) NOT NULL,
    payment integer
);
CREATE VIEW acquisition.carpools AS
 SELECT carpools.acquisition_id,
    carpools.operator_id,
    carpools.operator_journey_id AS journey_id,
    carpools.operator_trip_id AS operator_journey_id,
    carpools.status,
    carpools.is_driver
   FROM carpool.carpools
  ORDER BY carpools.acquisition_id DESC;
CREATE TABLE acquisition.errors (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_id integer NOT NULL,
    source character varying NOT NULL,
    error_message character varying,
    error_code character varying,
    error_line integer,
    auth jsonb DEFAULT '{}'::jsonb NOT NULL,
    headers jsonb DEFAULT '{}'::jsonb NOT NULL,
    body jsonb DEFAULT '{}'::jsonb NOT NULL,
    error_stage character varying(255) DEFAULT 'acquisition'::character varying NOT NULL,
    error_attempt integer DEFAULT 1 NOT NULL,
    error_resolved boolean DEFAULT false NOT NULL,
    journey_id character varying,
    request_id character varying
);
CREATE SEQUENCE acquisition.errors__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE acquisition.errors__id_seq OWNED BY acquisition.errors._id;
CREATE TABLE application.applications (
    _id integer NOT NULL,
    uuid character varying DEFAULT public.uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    owner_id integer NOT NULL,
    owner_service character varying NOT NULL,
    permissions character varying[] DEFAULT ARRAY[]::character varying[]
);
CREATE SEQUENCE application.applications_new__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE application.applications_new__id_seq OWNED BY application.applications._id;
CREATE TABLE auth.users (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_id integer,
    territory_id integer,
    email character varying NOT NULL,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    phone character varying,
    password character varying,
    status auth.user_status_enum DEFAULT 'pending'::auth.user_status_enum NOT NULL,
    token character varying,
    token_expires_at timestamp with time zone,
    role character varying NOT NULL,
    ui_status json,
    last_login_at timestamp with time zone DEFAULT now() NOT NULL,
    hidden boolean DEFAULT false
);
CREATE SEQUENCE auth.users__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE auth.users__id_seq OWNED BY auth.users._id;
CREATE SEQUENCE carpool.carpools__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool.carpools__id_seq OWNED BY carpool.carpools._id;
CREATE TABLE carpool.identities (
    _id integer NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone character varying,
    phone_trunc character varying,
    operator_user_id character varying,
    firstname character varying,
    lastname character varying,
    email character varying,
    company character varying,
    travel_pass_name character varying,
    travel_pass_user_id character varying,
    over_18 boolean,
    identity_key character varying(64)
);
CREATE SEQUENCE carpool.identities__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool.identities__id_seq OWNED BY carpool.identities._id;
CREATE TABLE carpool.incentives (
    acquisition_id integer NOT NULL,
    idx smallint NOT NULL,
    datetime timestamp with time zone NOT NULL,
    siret character varying(14) NOT NULL,
    amount integer NOT NULL
);
CREATE SEQUENCE carpool_v2.carpools_legacy_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE carpool_v2.carpools (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_id integer NOT NULL,
    operator_journey_id character varying NOT NULL,
    operator_trip_id character varying,
    operator_class character(1) NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    start_position public.geography NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    end_position public.geography NOT NULL,
    distance integer NOT NULL,
    licence_plate character varying(32),
    driver_identity_key character varying(64),
    driver_operator_user_id character varying(256),
    driver_phone character varying(32),
    driver_phone_trunc character varying(32),
    driver_travelpass_name character varying(32),
    driver_travelpass_user_id character varying(128),
    driver_revenue integer NOT NULL,
    passenger_identity_key character varying(64),
    passenger_operator_user_id character varying(256),
    passenger_phone character varying(32),
    passenger_phone_trunc character varying(32),
    passenger_travelpass_name character varying(32),
    passenger_travelpass_user_id character varying(128),
    passenger_over_18 boolean,
    passenger_seats smallint NOT NULL,
    passenger_contribution integer NOT NULL,
    passenger_payments jsonb,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    legacy_id bigint DEFAULT nextval('carpool_v2.carpools_legacy_id_seq'::regclass) NOT NULL
);
CREATE SEQUENCE carpool_v2.carpools__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool_v2.carpools__id_seq OWNED BY carpool_v2.carpools._id;
CREATE TABLE carpool_v2.geo (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_geo_code character varying(5),
    end_geo_code character varying(5),
    errors jsonb
);
CREATE SEQUENCE carpool_v2.geo__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool_v2.geo__id_seq OWNED BY carpool_v2.geo._id;
CREATE TABLE carpool_v2.operator_incentive_counterparts (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    target_is_driver boolean NOT NULL,
    siret character varying(14) NOT NULL,
    amount integer NOT NULL
);
CREATE SEQUENCE carpool_v2.operator_incentive_counterparts__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool_v2.operator_incentive_counterparts__id_seq OWNED BY carpool_v2.operator_incentive_counterparts._id;
CREATE TABLE carpool_v2.operator_incentives (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    idx smallint NOT NULL,
    siret character varying(14) NOT NULL,
    amount integer NOT NULL
);
CREATE SEQUENCE carpool_v2.operator_incentives__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool_v2.operator_incentives__id_seq OWNED BY carpool_v2.operator_incentives._id;
CREATE TABLE carpool_v2.requests (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    operator_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_journey_id character varying NOT NULL,
    payload jsonb,
    api_version smallint NOT NULL,
    cancel_code character varying(32),
    cancel_message character varying(512)
);
CREATE SEQUENCE carpool_v2.requests__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool_v2.requests__id_seq OWNED BY carpool_v2.requests._id;
CREATE TABLE carpool_v2.status (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    acquisition_status carpool_v2.carpool_acquisition_status_enum DEFAULT 'received'::carpool_v2.carpool_acquisition_status_enum NOT NULL,
    fraud_status carpool_v2.carpool_fraud_status_enum DEFAULT 'pending'::carpool_v2.carpool_fraud_status_enum NOT NULL
);
CREATE SEQUENCE carpool_v2.status__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE carpool_v2.status__id_seq OWNED BY carpool_v2.status._id;
CREATE TABLE cee.cee_application_errors (
    _id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_id integer NOT NULL,
    journey_type cee.journey_type_enum NOT NULL,
    error_type cee.application_error_enum NOT NULL,
    last_name_trunc character varying(3),
    phone_trunc character varying(32),
    driving_license character varying(64),
    datetime character varying(64),
    operator_journey_id character varying(256),
    application_id uuid,
    identity_key character varying(64)
);
CREATE TABLE cee.cee_applications (
    _id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_id integer NOT NULL,
    journey_type cee.journey_type_enum NOT NULL,
    is_specific boolean DEFAULT false NOT NULL,
    last_name_trunc character varying(3) NOT NULL,
    phone_trunc character varying(32) NOT NULL,
    datetime timestamp without time zone NOT NULL,
    carpool_id integer,
    driving_license character varying(64),
    application_timestamp timestamp without time zone NOT NULL,
    identity_key character varying(64),
    operator_journey_id character varying(255),
    CONSTRAINT cee_driving_license_constraint CHECK (
CASE
    WHEN (is_specific = true) THEN (driving_license IS NULL)
    ELSE (driving_license IS NOT NULL)
END),
    CONSTRAINT cee_operator_id_operator_journey_id_check_constraint CHECK (
CASE
    WHEN ((journey_type = 'short'::cee.journey_type_enum) AND (is_specific = false)) THEN (operator_journey_id IS NOT NULL)
    ELSE (operator_journey_id IS NULL)
END)
);
CREATE TABLE cee.labels (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cee_application_id uuid NOT NULL,
    label character varying NOT NULL
);
CREATE SEQUENCE cee.labels__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE cee.labels__id_seq OWNED BY cee.labels._id;
CREATE TABLE certificate.access_log (
    _id integer NOT NULL,
    certificate_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ip inet,
    user_agent character varying,
    user_id character varying,
    content_type character varying
);
CREATE SEQUENCE certificate.access_log__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE certificate.access_log__id_seq OWNED BY certificate.access_log._id;
CREATE TABLE certificate.certificates (
    _id integer NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    identity_uuid uuid NOT NULL,
    operator_id integer NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL
);
CREATE SEQUENCE certificate.certificates__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE certificate.certificates__id_seq OWNED BY certificate.certificates._id;
CREATE SEQUENCE certificate.certificates_new__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE certificate.certificates_new__id_seq OWNED BY certificate.certificates._id;
CREATE VIEW certificate.identities AS
 SELECT ci.phone,
    array_agg(cc.identity_id) AS identities
   FROM (carpool.carpools cc
     JOIN carpool.identities ci ON ((cc.identity_id = ci._id)))
  GROUP BY ci.phone;
CREATE TABLE company.companies (
    siret character varying(14) NOT NULL,
    siren character varying(9) NOT NULL,
    nic character varying(5) NOT NULL,
    legal_name character varying(256) NOT NULL,
    company_naf_code character varying(5) NOT NULL,
    establishment_naf_code character varying(5) NOT NULL,
    legal_nature_code character varying(10),
    legal_nature_label character varying(256),
    nonprofit_code character varying(10),
    intra_vat character varying(16),
    geo public.geography,
    address character varying,
    headquarter boolean NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    _id integer NOT NULL,
    address_street character varying(255),
    address_postcode character varying(5),
    address_cedex character varying(128),
    address_city character varying(255)
);
CREATE SEQUENCE company.companies__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE company.companies__id_seq OWNED BY company.companies._id;
CREATE TABLE export.exports (
    _id integer NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    target character varying(255) DEFAULT 'opendata'::character varying NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    download_url_expire_at timestamp with time zone,
    download_url character varying(255),
    params json NOT NULL,
    error json,
    stats json
);
CREATE SEQUENCE export.exports__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE export.exports__id_seq OWNED BY export.exports._id;
CREATE TABLE export.logs (
    _id integer NOT NULL,
    export_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    type character varying(255) NOT NULL,
    message text NOT NULL
);
CREATE SEQUENCE export.logs__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE export.logs__id_seq OWNED BY export.logs._id;
CREATE TABLE export.recipients (
    _id integer NOT NULL,
    export_id integer NOT NULL,
    scrambled_at timestamp with time zone,
    email character varying(255) NOT NULL,
    fullname character varying(255),
    message text
);
CREATE SEQUENCE export.recipients__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE export.recipients__id_seq OWNED BY export.recipients._id;
CREATE TABLE fraudcheck.labels (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    carpool_id integer NOT NULL,
    label character varying NOT NULL,
    geo_code character varying(9)
);
CREATE SEQUENCE fraudcheck.labels__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE fraudcheck.labels__id_seq OWNED BY fraudcheck.labels._id;
CREATE TABLE fraudcheck.phone_insights (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_trunc character varying(20),
    departure_date timestamp with time zone,
    end_date timestamp with time zone,
    num_days integer,
    average_duration double precision,
    average_distance double precision,
    total_incentives double precision,
    average_trip_count double precision,
    num_operators integer,
    driver_trip_percentage double precision,
    role_change boolean,
    intraday_change_count integer,
    total_change_count integer,
    intraday_change_percentage double precision,
    total_change_percentage double precision,
    carpool_days integer,
    carpool_day_list character varying[],
    trip_id_list character varying[],
    operator_list integer[]
);
CREATE TABLE fraudcheck.phone_insights_detailed (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_trunc character varying,
    operator_user_id character varying,
    departure_date timestamp with time zone,
    end_date timestamp with time zone,
    num_days integer,
    average_duration double precision,
    average_distance double precision,
    total_incentives double precision,
    average_trip_count double precision,
    num_operators integer,
    driver_trip_percentage double precision,
    role_change boolean,
    intraday_change_count integer,
    total_change_count integer,
    intraday_change_percentage double precision,
    total_change_percentage double precision,
    carpool_days integer,
    carpool_day_list text,
    trip_id_list text,
    operator_list text,
    average_seats double precision,
    night_time_count_21_6 integer,
    has_night_time_21_6 boolean,
    night_time_percentage_21_6 double precision,
    night_time_count_21_5 integer,
    has_night_time_21_5 boolean,
    night_time_percentage_21_5 double precision,
    night_time_count_22_5 integer,
    has_night_time_22_5 boolean,
    night_time_percentage_22_5 double precision,
    occupancy_rate_exceeded boolean,
    triangular_level_1 boolean,
    triangular_level_2 boolean,
    traveled_with_level_1 boolean,
    traveled_with_level_2 boolean,
    phone_trunc_changed double precision
);
CREATE SEQUENCE fraudcheck.phone_insights_detailed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE fraudcheck.phone_insights_detailed_id_seq OWNED BY fraudcheck.phone_insights_detailed.id;
CREATE TABLE fraudcheck.phone_insights_detailed_old (
    id integer,
    created_at timestamp with time zone,
    phone_trunc character varying,
    operator_user_id character varying,
    departure_date timestamp with time zone,
    end_date timestamp with time zone,
    num_days integer,
    average_duration double precision,
    average_distance double precision,
    total_incentives double precision,
    average_trip_count double precision,
    num_operators integer,
    driver_trip_percentage double precision,
    role_change boolean,
    intraday_change_count integer,
    total_change_count integer,
    intraday_change_percentage double precision,
    total_change_percentage double precision,
    carpool_days integer,
    carpool_day_list text,
    trip_id_list text,
    operator_list text,
    average_seats double precision,
    night_time_count_21_6 integer,
    has_night_time_21_6 boolean,
    night_time_percentage_21_6 double precision,
    night_time_count_21_5 integer,
    has_night_time_21_5 boolean,
    night_time_percentage_21_5 double precision,
    night_time_count_22_5 integer,
    has_night_time_22_5 boolean,
    night_time_percentage_22_5 double precision,
    occupancy_rate_exceeded boolean,
    triangular_level_1 boolean,
    triangular_level_2 boolean,
    traveled_with_level_1 boolean,
    traveled_with_level_2 boolean,
    phone_trunc_changed double precision
);
CREATE SEQUENCE fraudcheck.phone_insights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE fraudcheck.phone_insights_id_seq OWNED BY fraudcheck.phone_insights.id;
CREATE TABLE fraudcheck.potential_triangular_patterns (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    groupe integer,
    num_participants integer,
    num_trips integer,
    operator_list integer[],
    num_operators integer,
    average_duration double precision,
    departure_date timestamp without time zone,
    end_date timestamp without time zone,
    average_daily_trips double precision,
    total_change_percentage double precision[],
    total_incentives double precision,
    central_participants jsonb,
    intermediate_participants jsonb,
    journey_id_list character varying[],
    phone_trunc character varying[]
);
CREATE SEQUENCE fraudcheck.potential_triangular_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE fraudcheck.potential_triangular_patterns_id_seq OWNED BY fraudcheck.potential_triangular_patterns.id;
CREATE TABLE fraudcheck.triangular_patterns (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_trunc text,
    num_participants integer,
    num_trips integer,
    num_operators integer,
    average_duration double precision,
    departure_date timestamp with time zone,
    end_date timestamp with time zone,
    average_daily_trips double precision,
    level integer,
    operator_user_id character varying,
    num_days double precision,
    average_distance double precision,
    total_incentives double precision,
    average_trip_count double precision,
    driver_trip_percentage double precision,
    role_change boolean,
    intraday_change_count integer,
    total_change_count integer,
    intraday_change_percentage double precision,
    total_change_percentage double precision,
    carpool_days integer,
    carpool_day_list timestamp with time zone[],
    trip_id_list character varying[],
    average_seats double precision,
    night_time_count_21_6 integer,
    has_night_time_21_6 boolean,
    night_time_percentage_21_6 double precision,
    night_time_count_21_5 integer,
    has_night_time_21_5 boolean,
    night_time_percentage_21_5 double precision,
    night_time_count_22_5 integer,
    has_night_time_22_5 boolean,
    night_time_percentage_22_5 double precision,
    occupancy_rate_exceeded boolean,
    triangular_level_1 boolean,
    triangular_level_2 boolean,
    traveled_with_level_1 boolean,
    traveled_with_level_2 boolean,
    phone_trunc_changed double precision,
    operator_list integer[]
);
CREATE SEQUENCE fraudcheck.triangular_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE fraudcheck.triangular_patterns_id_seq OWNED BY fraudcheck.triangular_patterns.id;
CREATE TABLE fraudcheck.triangular_patterns_old (
    id integer,
    created_at timestamp with time zone,
    phone_trunc text,
    num_participants integer,
    num_trips double precision,
    num_operators integer,
    average_duration double precision,
    departure_date timestamp with time zone,
    end_date timestamp with time zone,
    average_daily_trips double precision,
    level integer,
    operator_user_id character varying,
    num_days double precision,
    average_distance double precision,
    total_incentives double precision,
    average_trip_count double precision,
    driver_trip_percentage double precision,
    role_change boolean,
    intraday_change_count integer,
    total_change_count integer,
    intraday_change_percentage double precision,
    total_change_percentage double precision,
    carpool_days integer,
    carpool_day_list timestamp with time zone[],
    trip_id_list character varying[],
    average_seats double precision,
    night_time_count_21_6 integer,
    has_night_time_21_6 boolean,
    night_time_percentage_21_6 double precision,
    night_time_count_21_5 integer,
    has_night_time_21_5 boolean,
    night_time_percentage_21_5 double precision,
    night_time_count_22_5 integer,
    has_night_time_22_5 boolean,
    night_time_percentage_22_5 double precision,
    occupancy_rate_exceeded boolean,
    triangular_level_1 boolean,
    triangular_level_2 boolean,
    traveled_with_level_1 boolean,
    traveled_with_level_2 boolean,
    phone_trunc_changed double precision,
    operator_list integer[]
);
CREATE TABLE fraudcheck.user_phone_change_history (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    total_changes integer,
    year_month date
);
CREATE SEQUENCE fraudcheck.user_phone_change_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE fraudcheck.user_phone_change_history_id_seq OWNED BY fraudcheck.user_phone_change_history.id;
CREATE TABLE fraudcheck.users_3_months_patterns (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_trunc character varying(20),
    total_incentives double precision,
    triangular boolean,
    has_night_time boolean,
    night_time_percentage double precision,
    occupancy_rate_exceeded boolean,
    average_seats double precision
);
CREATE SEQUENCE fraudcheck.users_3_months_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE fraudcheck.users_3_months_patterns_id_seq OWNED BY fraudcheck.users_3_months_patterns.id;
CREATE TABLE geo.com_evolution (
    year smallint NOT NULL,
    mod smallint NOT NULL,
    old_com character varying(5),
    new_com character varying(5),
    l_mod character varying
);
CREATE TABLE geo.dataset_migration (
    key character varying(128) NOT NULL,
    datetime timestamp without time zone DEFAULT now() NOT NULL,
    millesime smallint DEFAULT (date_part('year'::text, now()))::smallint NOT NULL
);
CREATE TABLE geo.perimeters (
    id integer NOT NULL,
    year smallint NOT NULL,
    centroid public.geometry(Point,4326) NOT NULL,
    geom public.geometry(MultiPolygon,4326) NOT NULL,
    geom_simple public.geometry(MultiPolygon,4326) NOT NULL,
    l_arr character varying(256),
    arr character varying(5),
    l_com character varying(256),
    com character varying(5),
    l_epci character varying(256),
    epci character varying(9),
    l_dep character varying(256),
    dep character varying(3),
    l_reg character varying(256),
    reg character varying(2),
    l_country character varying(256),
    country character varying(5),
    l_aom character varying(256),
    aom character varying(9),
    l_reseau character varying(256),
    reseau integer,
    pop integer,
    surface real
);
CREATE TABLE geo.perimeters_centroid (
    id integer NOT NULL,
    year integer NOT NULL,
    territory character varying NOT NULL,
    l_territory character varying NOT NULL,
    type character varying NOT NULL,
    geom public.geometry(Point,4326) NOT NULL
);
CREATE SEQUENCE geo.perimeters_centroid_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE geo.perimeters_centroid_id_seq OWNED BY geo.perimeters_centroid.id;
CREATE SEQUENCE geo.perimeters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE geo.perimeters_id_seq OWNED BY geo.perimeters.id;
CREATE TABLE honor.tracking (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type character varying(32) NOT NULL,
    employer character varying(255) DEFAULT ''::character varying NOT NULL
);
CREATE SEQUENCE honor.tracking__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE honor.tracking__id_seq OWNED BY honor.tracking._id;
CREATE TABLE operator.operators (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    legal_name character varying NOT NULL,
    siret character varying NOT NULL,
    cgu_accepted_at timestamp with time zone,
    cgu_accepted_by character varying,
    company json NOT NULL,
    address json NOT NULL,
    bank json NOT NULL,
    contacts json NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    support character varying(256)
);
CREATE SEQUENCE operator.operators__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE operator.operators__id_seq OWNED BY operator.operators._id;
CREATE TABLE operator.thumbnails (
    _id integer NOT NULL,
    operator_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data bytea NOT NULL
);
CREATE SEQUENCE operator.thumbnails__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE operator.thumbnails__id_seq OWNED BY operator.thumbnails._id;
CREATE TABLE policy.incentives (
    _id integer NOT NULL,
    policy_id integer NOT NULL,
    status policy.incentive_status_enum NOT NULL,
    meta json,
    carpool_id integer NOT NULL,
    amount integer DEFAULT 0 NOT NULL,
    datetime timestamp with time zone NOT NULL,
    result integer DEFAULT 0 NOT NULL,
    state policy.incentive_state_enum DEFAULT 'regular'::policy.incentive_state_enum NOT NULL,
    operator_id integer,
    operator_journey_id character varying
);
CREATE SEQUENCE policy.incentives__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE policy.incentives__id_seq OWNED BY policy.incentives._id;
CREATE TABLE policy.lock (
    _id integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    stopped_at timestamp with time zone,
    success boolean,
    data json
);
CREATE SEQUENCE policy.lock__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE policy.lock__id_seq OWNED BY policy.lock._id;
CREATE TABLE policy.policies (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    territory_id integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    name character varying NOT NULL,
    description character varying,
    unit policy.policy_unit_enum,
    status policy.policy_status_enum NOT NULL,
    handler character varying(256),
    incentive_sum integer DEFAULT 0 NOT NULL,
    max_amount integer DEFAULT 0 NOT NULL,
    tz character varying(64) DEFAULT 'Europe/Paris'::character varying NOT NULL
);
CREATE SEQUENCE policy.policies__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE policy.policies__id_seq OWNED BY policy.policies._id;
CREATE TABLE policy.policy_metas (
    _id integer NOT NULL,
    policy_id integer NOT NULL,
    key character varying DEFAULT 'default'::character varying NOT NULL,
    value integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    datetime timestamp without time zone
);
CREATE SEQUENCE policy.policy_metas__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE policy.policy_metas__id_seq OWNED BY policy.policy_metas._id;
CREATE VIEW policy.trips AS
 SELECT cpd._id AS carpool_id,
    cp.status AS carpool_status,
    cp.trip_id,
    cp.acquisition_id,
    cp.operator_id,
    oo.uuid AS operator_uuid,
    cp.operator_class,
    cp.datetime,
    cp.seats,
    cp.cost,
        CASE
            WHEN (cp.distance IS NOT NULL) THEN cp.distance
            ELSE ((cp.meta ->> 'calc_distance'::text))::integer
        END AS distance,
        CASE
            WHEN (cp.duration IS NOT NULL) THEN cp.duration
            ELSE ((cp.meta ->> 'calc_duration'::text))::integer
        END AS duration,
        CASE
            WHEN (ci.travel_pass_user_id IS NOT NULL) THEN true
            ELSE false
        END AS passenger_has_travel_pass,
        CASE
            WHEN (cid.travel_pass_user_id IS NOT NULL) THEN true
            ELSE false
        END AS driver_has_travel_pass,
        CASE
            WHEN (ci.over_18 IS NOT NULL) THEN ci.over_18
            ELSE NULL::boolean
        END AS passenger_is_over_18,
    ci.uuid AS passenger_identity_uuid,
    cid.uuid AS driver_identity_uuid,
    cp.meta AS passenger_meta,
    cpd.meta AS driver_meta,
    cp.payment AS passenger_payment,
    cpd.payment AS driver_payment,
    (public.st_x((cp.start_position)::public.geometry))::numeric AS carpool_start_lon,
    (public.st_y((cp.start_position)::public.geometry))::numeric AS carpool_start_lat,
    (public.st_x((cp.end_position)::public.geometry))::numeric AS carpool_end_lon,
    (public.st_y((cp.end_position)::public.geometry))::numeric AS carpool_end_lat,
    cp.start_geo_code,
    cp.end_geo_code,
    ( SELECT json_build_object('arr', "position".arr, 'com', "position".com, 'epci', "position".epci, 'dep', "position".dep, 'reg', "position".reg, 'country', "position".country, 'aom', "position".aom, 'reseau', "position".reseau) AS json_build_object
           FROM geo.get_by_code((cp.start_geo_code)::character varying, geo.get_latest_millesime_or((EXTRACT(year FROM cp.datetime))::smallint)) "position"(year, l_arr, arr, l_com, com, l_epci, epci, l_dep, dep, l_reg, reg, l_country, country, l_aom, aom, l_reseau, reseau, pop, surface)) AS carpool_start,
    ( SELECT json_build_object('arr', "position".arr, 'com', "position".com, 'epci', "position".epci, 'dep', "position".dep, 'reg', "position".reg, 'country', "position".country, 'aom', "position".aom, 'reseau', "position".reseau) AS json_build_object
           FROM geo.get_by_code((cp.end_geo_code)::character varying, geo.get_latest_millesime_or((EXTRACT(year FROM cp.datetime))::smallint)) "position"(year, l_arr, arr, l_com, com, l_epci, epci, l_dep, dep, l_reg, reg, l_country, country, l_aom, aom, l_reseau, reseau, pop, surface)) AS carpool_end
   FROM ((((carpool.carpools cp
     JOIN carpool.carpools cpd ON (((cp.acquisition_id = cpd.acquisition_id) AND (cpd.is_driver = true))))
     JOIN carpool.identities ci ON ((cp.identity_id = ci._id)))
     JOIN carpool.identities cid ON ((cpd.identity_id = cid._id)))
     JOIN operator.operators oo ON ((cp.operator_id = oo._id)))
  WHERE (cp.is_driver = false);
CREATE TABLE public.acquisition_meta (
    acquisition_id integer,
    created_at timestamp without time zone,
    meta character varying
);
CREATE VIEW public.active_locks AS
 SELECT t.schemaname,
    t.relname,
    l.locktype,
    l.page,
    l.virtualtransaction,
    l.pid,
    l.mode,
    l.granted
   FROM (pg_locks l
     JOIN pg_stat_all_tables t ON ((l.relation = t.relid)))
  WHERE ((t.schemaname <> 'pg_toast'::name) AND (t.schemaname <> 'pg_catalog'::name))
  ORDER BY t.schemaname, t.relname;
CREATE VIEW public.copy_cee AS
 SELECT ce._id,
    ce.datetime,
    ce.operator_id,
    ce.carpool_id,
    ci.uuid,
    cc.trip_id
   FROM ((cee.cee_applications ce
     JOIN carpool.carpools cc ON ((cc._id = ce.carpool_id)))
     JOIN carpool.identities ci ON ((ci._id = cc.identity_id)))
  WHERE ((ce.datetime >= '2023-01-01 00:00:00'::timestamp without time zone) AND (ce.journey_type = 'short'::cee.journey_type_enum) AND (ce.is_specific = false));
CREATE VIEW public.cee_carpools AS
 SELECT DISTINCT cc.trip_id,
    ci.uuid,
    cc.datetime,
    cc.operator_id,
    pi.policy_id,
    COALESCE(pi.amount, 0) AS amount
   FROM (((carpool.identities ci
     JOIN carpool.carpools cc ON ((ci._id = cc.identity_id)))
     JOIN public.copy_cee ce ON ((ce.uuid = ci.uuid)))
     LEFT JOIN policy.incentives pi ON ((cc._id = pi.carpool_id)))
  WHERE (cc.datetime >= '2021-12-31 23:00:00+00'::timestamp with time zone)
  ORDER BY ci.uuid;
CREATE VIEW public.enums AS
 SELECT type.typname AS name,
    string_agg((enum.enumlabel)::text, '|'::text) AS value
   FROM (pg_enum enum
     JOIN pg_type type ON ((type.oid = enum.enumtypid)))
  GROUP BY type.typname;
CREATE TABLE public.jon_identities (
    _id integer,
    uuid uuid,
    datetime timestamp with time zone
);
CREATE TABLE public.jon_identities_primo (
    uuid uuid,
    min timestamp with time zone
);
CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);
CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
CREATE TABLE public.temp_cee_app (
    _id uuid,
    application_timestamp timestamp without time zone
);
CREATE MATERIALIZED VIEW public.tmp_applicants_trips AS
 WITH applicants AS (
         SELECT ci.uuid
           FROM ((cee.cee_applications cee
             JOIN carpool.carpools cc ON ((cee.carpool_id = cc._id)))
             JOIN carpool.identities ci ON ((cc.identity_id = ci._id)))
          WHERE ((cee.journey_type = 'short'::cee.journey_type_enum) AND (cee.is_specific = false) AND (cee.datetime >= '2023-01-01 00:00:00'::timestamp without time zone) AND (cee.datetime < '2023-01-08 00:00:00'::timestamp without time zone) AND (cc.is_driver = true))
          GROUP BY ci.uuid
        ), applicants_trips AS (
         SELECT DISTINCT cc.trip_id,
            ci.uuid,
            cc.is_driver,
            cc.datetime
           FROM (carpool.carpools cc
             JOIN carpool.identities ci ON ((ci._id = cc.identity_id)))
          WHERE ((ci.uuid IN ( SELECT applicants.uuid
                   FROM applicants)) AND (cc.datetime >= '2022-12-31 23:00:00+00'::timestamp with time zone))
        )
 SELECT applicants_trips.trip_id,
    applicants_trips.uuid,
    applicants_trips.is_driver,
    applicants_trips.datetime
   FROM applicants_trips
  WITH NO DATA;
CREATE UNLOGGED TABLE public.tmp_legacy_id_2018 (
    _id integer,
    acquisition_id integer
);
CREATE UNLOGGED TABLE public.tmp_legacy_id_2019 (
    _id integer,
    acquisition_id integer
);
CREATE UNLOGGED TABLE public.tmp_legacy_id_2020 (
    _id integer,
    acquisition_id integer
);
CREATE UNLOGGED TABLE public.tmp_legacy_id_2021 (
    _id integer,
    acquisition_id integer
);
CREATE UNLOGGED TABLE public.tmp_legacy_id_2022 (
    _id integer,
    acquisition_id integer
);
CREATE UNLOGGED TABLE public.tmp_legacy_id_2023 (
    _id integer,
    acquisition_id integer
);
CREATE UNLOGGED TABLE public.tmp_legacy_id_2024 (
    _id integer,
    acquisition_id integer
);
CREATE MATERIALIZED VIEW public.tmp_trips AS
 WITH applicants AS (
         SELECT ci.uuid
           FROM ((cee.cee_applications cee
             JOIN carpool.carpools cc ON ((cee.carpool_id = cc._id)))
             JOIN carpool.identities ci ON ((cc.identity_id = ci._id)))
          WHERE ((cee.journey_type = 'short'::cee.journey_type_enum) AND (cee.is_specific = false) AND (cee.datetime >= '2023-01-01 00:00:00'::timestamp without time zone) AND (cc.is_driver = true))
          GROUP BY ci.uuid
        ), trips AS (
         SELECT DISTINCT cc.trip_id,
            ci.uuid,
            cc.is_driver,
            cc.datetime
           FROM (carpool.carpools cc
             JOIN carpool.identities ci ON ((ci._id = cc.identity_id)))
          WHERE ((ci.uuid IN ( SELECT applicants.uuid
                   FROM applicants)) AND (cc.datetime >= '2022-12-31 23:00:00+00'::timestamp with time zone))
        ), trips_agg AS (
         SELECT trips.uuid,
            trips.is_driver,
            count(*) AS total,
            min((trips.datetime AT TIME ZONE 'Europe/Paris'::text)) AS min,
            max((trips.datetime AT TIME ZONE 'Europe/Paris'::text)) AS max,
            array_agg(to_char((trips.datetime AT TIME ZONE 'Europe/Paris'::text), 'YYYY-MM-DD'::text) ORDER BY 1::integer) AS trips
           FROM trips
          GROUP BY trips.uuid, trips.is_driver
          ORDER BY trips.uuid
        ), computed AS (
         SELECT trips_agg.uuid,
            trips_agg.is_driver,
            trips_agg.total,
            EXTRACT(day FROM (trips_agg.max - trips_agg.min)) AS days,
            (EXTRACT(day FROM (trips_agg.max - trips_agg.min)) / (7)::numeric) AS weeks,
            EXTRACT(month FROM age(trips_agg.max, trips_agg.min)) AS months,
            trips_agg.min,
            trips_agg.max,
            age(trips_agg.max, trips_agg.min) AS duration,
            trips_agg.trips
           FROM trips_agg
        )
 SELECT computed.uuid AS identity,
    computed.is_driver,
    computed.total,
    computed.days,
        CASE
            WHEN (computed.days = (0)::numeric) THEN (0)::numeric
            ELSE computed.weeks
        END AS weeks,
    computed.months,
        CASE
            WHEN (computed.days = (0)::numeric) THEN (computed.total)::numeric
            ELSE ((computed.total)::numeric / computed.days)
        END AS avg_per_day,
        CASE
            WHEN (computed.weeks = (0)::numeric) THEN (computed.total)::numeric
            ELSE ((computed.total)::numeric / computed.weeks)
        END AS avg_per_week,
        CASE
            WHEN (computed.months = (0)::numeric) THEN (computed.total)::numeric
            ELSE ((computed.total)::numeric / computed.months)
        END AS avg_per_month,
    computed.min,
    computed.max,
    computed.duration,
    computed.trips
   FROM computed
  ORDER BY computed.min, computed.uuid
  WITH NO DATA;
CREATE TABLE territory.territories (
    _id integer NOT NULL,
    company_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    level territory.territory_level_enum NOT NULL,
    name character varying(128),
    shortname character varying(128),
    activable boolean DEFAULT false NOT NULL,
    active boolean DEFAULT false NOT NULL,
    active_since timestamp with time zone,
    contacts json,
    address json,
    population integer,
    surface bigint,
    geo public.geography,
    ui_status json
);
CREATE TABLE trip.list (
    operator_id integer,
    applied_policies integer[],
    journey_id integer,
    trip_id character varying(256),
    journey_start_datetime timestamp with time zone,
    journey_start_weekday integer,
    journey_start_dayhour integer,
    journey_start_lon numeric,
    journey_start_lat numeric,
    journey_start_insee character varying(10),
    journey_start_department character varying(3),
    journey_start_town character varying(128),
    journey_start_towngroup character varying(128),
    journey_start_country character varying(128),
    journey_end_datetime timestamp with time zone,
    journey_end_lon numeric,
    journey_end_lat numeric,
    journey_end_insee character varying(10),
    journey_end_department character varying(3),
    journey_end_town character varying(128),
    journey_end_towngroup character varying(128),
    journey_end_country character varying(128),
    journey_distance integer,
    journey_distance_anounced integer,
    journey_distance_calculated integer,
    journey_duration integer,
    journey_duration_anounced integer,
    journey_duration_calculated integer,
    operator character varying(128),
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
    status carpool.carpool_status_enum,
    driver_incentive_rpc_financial_sum integer,
    passenger_incentive_rpc_financial_sum integer,
    operator_journey_id character varying,
    operator_passenger_id character varying,
    operator_driver_id character varying
);
CREATE TABLE territory.territory_codes (
    _id integer NOT NULL,
    territory_id integer NOT NULL,
    type character varying(10) NOT NULL,
    value character varying(64) NOT NULL
);
CREATE TABLE territory.territory_relation (
    _id integer NOT NULL,
    parent_territory_id integer NOT NULL,
    child_territory_id integer NOT NULL
);
CREATE TABLE territory.insee (
    _id character varying NOT NULL,
    territory_id integer NOT NULL
);
CREATE SEQUENCE territory.territories__id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE territory.territories__id_seq1 OWNED BY territory.territories._id;
CREATE SEQUENCE territory.territory_codes__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE territory.territory_codes__id_seq OWNED BY territory.territory_codes._id;
CREATE SEQUENCE territory.territory_group__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE territory.territory_group (
    _id integer DEFAULT nextval('territory.territory_group__id_seq'::regclass) NOT NULL,
    company_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying(128) NOT NULL,
    shortname character varying DEFAULT ''::character varying NOT NULL,
    contacts json DEFAULT '{}'::json NOT NULL,
    address json DEFAULT '{}'::json NOT NULL
);
CREATE TABLE territory.territory_group_selector (
    territory_group_id integer NOT NULL,
    selector_type character varying NOT NULL,
    selector_value character varying NOT NULL
);
CREATE TABLE territory.territory_operators_legacy (
    territory_id integer NOT NULL,
    operator_id integer NOT NULL
);
CREATE SEQUENCE territory.territory_relation__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE territory.territory_relation__id_seq OWNED BY territory.territory_relation._id;
CREATE VIEW trip.list_view AS
 SELECT cpp.operator_id,
    COALESCE((pip.policy_id || pid.policy_id), ARRAY[]::integer[]) AS applied_policies,
    cpp.acquisition_id AS journey_id,
    cpp.trip_id,
    public.ts_ceil(cpp.datetime, 600) AS journey_start_datetime,
    date_part('isodow'::text, cpp.datetime) AS journey_start_weekday,
    date_part('hour'::text, cpp.datetime) AS journey_start_dayhour,
    trunc((public.st_x((cpp.start_position)::public.geometry))::numeric,
        CASE
            WHEN ((cts.surface > (0)::double precision) AND (((cts.pop)::double precision / ((cts.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_start_lon,
    trunc((public.st_y((cpp.start_position)::public.geometry))::numeric,
        CASE
            WHEN ((cts.surface > (0)::double precision) AND (((cts.pop)::double precision / ((cts.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_start_lat,
    cts.arr AS journey_start_insee,
    cts.dep AS journey_start_department,
    cts.l_com AS journey_start_town,
    cts.l_epci AS journey_start_towngroup,
    cts.l_country AS journey_start_country,
    public.ts_ceil((cpp.datetime + ((cpp.duration || ' seconds'::text))::interval), 600) AS journey_end_datetime,
    trunc((public.st_x((cpp.end_position)::public.geometry))::numeric,
        CASE
            WHEN ((cte.surface > (0)::double precision) AND (((cte.pop)::double precision / ((cte.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_end_lon,
    trunc((public.st_y((cpp.end_position)::public.geometry))::numeric,
        CASE
            WHEN ((cte.surface > (0)::double precision) AND (((cte.pop)::double precision / ((cte.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_end_lat,
    cte.arr AS journey_end_insee,
    cte.dep AS journey_end_department,
    cte.l_com AS journey_end_town,
    cte.l_epci AS journey_end_towngroup,
    cte.l_country AS journey_end_country,
        CASE
            WHEN (cpp.distance IS NOT NULL) THEN cpp.distance
            ELSE ((cpp.meta ->> 'calc_distance'::text))::integer
        END AS journey_distance,
    cpp.distance AS journey_distance_anounced,
    ((cpp.meta ->> 'calc_distance'::text))::integer AS journey_distance_calculated,
        CASE
            WHEN (cpp.duration IS NOT NULL) THEN cpp.duration
            ELSE ((cpp.meta ->> 'calc_duration'::text))::integer
        END AS journey_duration,
    cpp.duration AS journey_duration_anounced,
    ((cpp.meta ->> 'calc_duration'::text))::integer AS journey_duration_calculated,
    ope.name AS operator,
    cpp.operator_class,
    cpp.operator_journey_id,
    cip.operator_user_id AS operator_passenger_id,
    cid.operator_user_id AS operator_driver_id,
    cip.uuid AS passenger_id,
    (
        CASE
            WHEN (cip.travel_pass_name IS NOT NULL) THEN '1'::text
            ELSE '0'::text
        END)::boolean AS passenger_card,
    cip.over_18 AS passenger_over_18,
    cpp.seats AS passenger_seats,
    abs(cpp.cost) AS passenger_contribution,
    cpip.incentive AS passenger_incentive_raw,
    pip.incentive_raw AS passenger_incentive_rpc_raw,
    pip.incentive_financial_sum AS passenger_incentive_rpc_financial_sum,
    pip.incentive_sum AS passenger_incentive_rpc_sum,
    cid.uuid AS driver_id,
    (
        CASE
            WHEN (cid.travel_pass_name IS NOT NULL) THEN '1'::text
            ELSE '0'::text
        END)::boolean AS driver_card,
    abs(cpd.cost) AS driver_revenue,
    cpid.incentive AS driver_incentive_raw,
    pid.incentive_raw AS driver_incentive_rpc_raw,
    pid.incentive_financial_sum AS driver_incentive_rpc_financial_sum,
    pid.incentive_sum AS driver_incentive_rpc_sum,
    (
        CASE
            WHEN ((cpp.status = 'ok'::carpool.carpool_status_enum) AND (cpd.status = 'ok'::carpool.carpool_status_enum)) THEN 'ok'::text
            WHEN ((cpp.status = 'expired'::carpool.carpool_status_enum) OR (cpd.status = 'expired'::carpool.carpool_status_enum)) THEN 'expired'::text
            WHEN ((cpp.status = 'canceled'::carpool.carpool_status_enum) OR (cpd.status = 'canceled'::carpool.carpool_status_enum)) THEN 'canceled'::text
            WHEN ((cpp.status = 'anomaly_error'::carpool.carpool_status_enum) OR (cpd.status = 'anomaly_error'::carpool.carpool_status_enum)) THEN 'anomaly_error'::text
            WHEN ((cpp.status = 'fraudcheck_error'::carpool.carpool_status_enum) OR (cpd.status = 'fraudcheck_error'::carpool.carpool_status_enum)) THEN 'fraudcheck_error'::text
            ELSE 'anomaly_error'::text
        END)::carpool.carpool_status_enum AS status
   FROM ((((((carpool.carpools cpp
     JOIN operator.operators ope ON ((ope._id = cpp.operator_id)))
     LEFT JOIN carpool.carpools cpd ON (((cpd.acquisition_id = cpp.acquisition_id) AND (cpd.is_driver = true))))
     LEFT JOIN carpool.identities cip ON ((cip._id = cpp.identity_id)))
     LEFT JOIN carpool.identities cid ON ((cid._id = cpd.identity_id)))
     LEFT JOIN geo.perimeters cts ON ((((cts.arr)::text = (cpp.start_geo_code)::text) AND (cts.year = geo.get_latest_millesime_or((date_part('year'::text, cpp.datetime))::smallint)))))
     LEFT JOIN geo.perimeters cte ON ((((cte.arr)::text = (cpp.end_geo_code)::text) AND (cte.year = geo.get_latest_millesime_or((date_part('year'::text, cpp.datetime))::smallint))))),
    LATERAL ( WITH data AS (
                 SELECT pi.policy_id,
                    sum(pi.amount) AS amount
                   FROM policy.incentives pi
                  WHERE ((pi.carpool_id = cpp._id) AND (pi.status = 'validated'::policy.incentive_status_enum))
                  GROUP BY pi.policy_id
                ), incentive AS (
                 SELECT data.policy_id,
                    ROW((cc.siret)::character varying, (data.amount)::integer, (pp.unit)::character varying, data.policy_id, pp.name, 'incentive'::character varying)::trip.incentive AS value,
                    data.amount,
                        CASE
                            WHEN (pp.unit = 'point'::policy.policy_unit_enum) THEN false
                            ELSE true
                        END AS financial
                   FROM (((data
                     LEFT JOIN policy.policies pp ON ((pp._id = data.policy_id)))
                     LEFT JOIN territory.territories tt ON ((pp.territory_id = tt._id)))
                     LEFT JOIN company.companies cc ON ((cc._id = tt.company_id)))
                )
         SELECT array_agg(incentive.value) AS incentive_raw,
            sum(incentive.amount) AS incentive_sum,
            sum(incentive.amount) FILTER (WHERE (incentive.financial IS TRUE)) AS incentive_financial_sum,
            array_agg(incentive.policy_id) AS policy_id
           FROM incentive) pip,
    ((LATERAL ( WITH data AS (
                 SELECT pi.policy_id,
                    sum(pi.amount) AS amount
                   FROM policy.incentives pi
                  WHERE ((pi.carpool_id = cpd._id) AND (pi.status = 'validated'::policy.incentive_status_enum))
                  GROUP BY pi.policy_id
                ), incentive AS (
                 SELECT data.policy_id,
                    ROW((cc.siret)::character varying, (data.amount)::integer, (pp.unit)::character varying, data.policy_id, pp.name, 'incentive'::character varying)::trip.incentive AS value,
                    data.amount,
                        CASE
                            WHEN (pp.unit = 'point'::policy.policy_unit_enum) THEN false
                            ELSE true
                        END AS financial
                   FROM (((data
                     LEFT JOIN policy.policies pp ON ((pp._id = data.policy_id)))
                     LEFT JOIN territory.territories tt ON ((pp.territory_id = tt._id)))
                     LEFT JOIN company.companies cc ON ((cc._id = tt.company_id)))
                )
         SELECT array_agg(incentive.value) AS incentive_raw,
            sum(incentive.amount) AS incentive_sum,
            sum(incentive.amount) FILTER (WHERE (incentive.financial IS TRUE)) AS incentive_financial_sum,
            array_agg(incentive.policy_id) AS policy_id
           FROM incentive) pid
     LEFT JOIN LATERAL ( SELECT array_agg((json_build_object('index', (cci.idx)::integer, 'siret', (cci.siret)::text, 'amount', cci.amount))::trip.incentive) AS incentive
           FROM carpool.incentives cci
          WHERE ((cci.acquisition_id = cpp.acquisition_id) AND (cpp.is_driver = false))) cpip ON (true))
     LEFT JOIN LATERAL ( SELECT array_agg((json_build_object('index', (cci.idx)::integer, 'siret', (cci.siret)::text, 'amount', cci.amount))::trip.incentive) AS incentive
           FROM carpool.incentives cci
          WHERE ((cci.acquisition_id = cpd.acquisition_id) AND (cpp.is_driver = true))) cpid ON (true))
  WHERE (cpp.is_driver = false);
CREATE TABLE trip.stat_cache (
    hash character varying(32) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    data json NOT NULL
);
ALTER TABLE ONLY acquisition.acquisitions ALTER COLUMN _id SET DEFAULT nextval('acquisition.acquisitions__id_seq'::regclass);
ALTER TABLE ONLY acquisition.errors ALTER COLUMN _id SET DEFAULT nextval('acquisition.errors__id_seq'::regclass);
ALTER TABLE ONLY application.applications ALTER COLUMN _id SET DEFAULT nextval('application.applications_new__id_seq'::regclass);
ALTER TABLE ONLY auth.users ALTER COLUMN _id SET DEFAULT nextval('auth.users__id_seq'::regclass);
ALTER TABLE ONLY carpool.carpools ALTER COLUMN _id SET DEFAULT nextval('carpool.carpools__id_seq'::regclass);
ALTER TABLE ONLY carpool.identities ALTER COLUMN _id SET DEFAULT nextval('carpool.identities__id_seq'::regclass);
ALTER TABLE ONLY carpool_v2.carpools ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.carpools__id_seq'::regclass);
ALTER TABLE ONLY carpool_v2.geo ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.geo__id_seq'::regclass);
ALTER TABLE ONLY carpool_v2.operator_incentive_counterparts ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.operator_incentive_counterparts__id_seq'::regclass);
ALTER TABLE ONLY carpool_v2.operator_incentives ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.operator_incentives__id_seq'::regclass);
ALTER TABLE ONLY carpool_v2.requests ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.requests__id_seq'::regclass);
ALTER TABLE ONLY carpool_v2.status ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.status__id_seq'::regclass);
ALTER TABLE ONLY cee.labels ALTER COLUMN _id SET DEFAULT nextval('cee.labels__id_seq'::regclass);
ALTER TABLE ONLY certificate.access_log ALTER COLUMN _id SET DEFAULT nextval('certificate.access_log__id_seq'::regclass);
ALTER TABLE ONLY certificate.certificates ALTER COLUMN _id SET DEFAULT nextval('certificate.certificates__id_seq'::regclass);
ALTER TABLE ONLY company.companies ALTER COLUMN _id SET DEFAULT nextval('company.companies__id_seq'::regclass);
ALTER TABLE ONLY export.exports ALTER COLUMN _id SET DEFAULT nextval('export.exports__id_seq'::regclass);
ALTER TABLE ONLY export.logs ALTER COLUMN _id SET DEFAULT nextval('export.logs__id_seq'::regclass);
ALTER TABLE ONLY export.recipients ALTER COLUMN _id SET DEFAULT nextval('export.recipients__id_seq'::regclass);
ALTER TABLE ONLY fraudcheck.labels ALTER COLUMN _id SET DEFAULT nextval('fraudcheck.labels__id_seq'::regclass);
ALTER TABLE ONLY fraudcheck.phone_insights ALTER COLUMN id SET DEFAULT nextval('fraudcheck.phone_insights_id_seq'::regclass);
ALTER TABLE ONLY fraudcheck.phone_insights_detailed ALTER COLUMN id SET DEFAULT nextval('fraudcheck.phone_insights_detailed_id_seq'::regclass);
ALTER TABLE ONLY fraudcheck.potential_triangular_patterns ALTER COLUMN id SET DEFAULT nextval('fraudcheck.potential_triangular_patterns_id_seq'::regclass);
ALTER TABLE ONLY fraudcheck.triangular_patterns ALTER COLUMN id SET DEFAULT nextval('fraudcheck.triangular_patterns_id_seq'::regclass);
ALTER TABLE ONLY fraudcheck.user_phone_change_history ALTER COLUMN id SET DEFAULT nextval('fraudcheck.user_phone_change_history_id_seq'::regclass);
ALTER TABLE ONLY fraudcheck.users_3_months_patterns ALTER COLUMN id SET DEFAULT nextval('fraudcheck.users_3_months_patterns_id_seq'::regclass);
ALTER TABLE ONLY geo.perimeters ALTER COLUMN id SET DEFAULT nextval('geo.perimeters_id_seq'::regclass);
ALTER TABLE ONLY geo.perimeters_centroid ALTER COLUMN id SET DEFAULT nextval('geo.perimeters_centroid_id_seq'::regclass);
ALTER TABLE ONLY honor.tracking ALTER COLUMN _id SET DEFAULT nextval('honor.tracking__id_seq'::regclass);
ALTER TABLE ONLY operator.operators ALTER COLUMN _id SET DEFAULT nextval('operator.operators__id_seq'::regclass);
ALTER TABLE ONLY operator.thumbnails ALTER COLUMN _id SET DEFAULT nextval('operator.thumbnails__id_seq'::regclass);
ALTER TABLE ONLY policy.incentives ALTER COLUMN _id SET DEFAULT nextval('policy.incentives__id_seq'::regclass);
ALTER TABLE ONLY policy.lock ALTER COLUMN _id SET DEFAULT nextval('policy.lock__id_seq'::regclass);
ALTER TABLE ONLY policy.policies ALTER COLUMN _id SET DEFAULT nextval('policy.policies__id_seq'::regclass);
ALTER TABLE ONLY policy.policy_metas ALTER COLUMN _id SET DEFAULT nextval('policy.policy_metas__id_seq'::regclass);
ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
ALTER TABLE ONLY territory.territories ALTER COLUMN _id SET DEFAULT nextval('territory.territories__id_seq1'::regclass);
ALTER TABLE ONLY territory.territory_codes ALTER COLUMN _id SET DEFAULT nextval('territory.territory_codes__id_seq'::regclass);
ALTER TABLE ONLY territory.territory_relation ALTER COLUMN _id SET DEFAULT nextval('territory.territory_relation__id_seq'::regclass);
ALTER TABLE ONLY acquisition.acquisitions
    ADD CONSTRAINT acquisitions_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY acquisition.errors
    ADD CONSTRAINT errors_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY application.applications
    ADD CONSTRAINT applications_new_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool.carpools
    ADD CONSTRAINT carpools_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool_v2.carpools
    ADD CONSTRAINT carpools_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool_v2.geo
    ADD CONSTRAINT geo_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool_v2.operator_incentive_counterparts
    ADD CONSTRAINT operator_incentive_counterparts_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool_v2.operator_incentives
    ADD CONSTRAINT operator_incentives_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool_v2.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY carpool_v2.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY cee.cee_application_errors
    ADD CONSTRAINT cee_application_errors_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY cee.cee_applications
    ADD CONSTRAINT cee_applications_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY cee.labels
    ADD CONSTRAINT labels__id_key UNIQUE (_id);
ALTER TABLE ONLY certificate.access_log
    ADD CONSTRAINT access_log_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY certificate.certificates
    ADD CONSTRAINT certificates_new_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY company.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY export.exports
    ADD CONSTRAINT exports_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY export.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY export.recipients
    ADD CONSTRAINT recipients_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY fraudcheck.labels
    ADD CONSTRAINT labels_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY fraudcheck.phone_insights_detailed
    ADD CONSTRAINT phone_insights_detailed_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fraudcheck.phone_insights
    ADD CONSTRAINT phone_insights_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fraudcheck.potential_triangular_patterns
    ADD CONSTRAINT potential_triangular_patterns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fraudcheck.triangular_patterns
    ADD CONSTRAINT triangular_patterns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fraudcheck.user_phone_change_history
    ADD CONSTRAINT user_phone_change_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fraudcheck.users_3_months_patterns
    ADD CONSTRAINT users_3_months_patterns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY geo.dataset_migration
    ADD CONSTRAINT dataset_migration_pkey PRIMARY KEY (key);
ALTER TABLE ONLY geo.perimeters_centroid
    ADD CONSTRAINT perimeters_centroid_pkey PRIMARY KEY (id);
ALTER TABLE ONLY geo.perimeters_centroid
    ADD CONSTRAINT perimeters_centroid_unique_key UNIQUE (year, territory, type);
ALTER TABLE ONLY geo.perimeters
    ADD CONSTRAINT perimeters_pkey PRIMARY KEY (id);
ALTER TABLE ONLY honor.tracking
    ADD CONSTRAINT tracking_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY operator.operators
    ADD CONSTRAINT operators_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY operator.thumbnails
    ADD CONSTRAINT thumbnails_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY policy.incentives
    ADD CONSTRAINT incentives_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY policy.lock
    ADD CONSTRAINT lock_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY policy.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY policy.policy_metas
    ADD CONSTRAINT policy_metas_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY territory.insee
    ADD CONSTRAINT insee_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_pkey1 PRIMARY KEY (_id);
ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_territory_id_type_value_key UNIQUE (territory_id, type, value);
ALTER TABLE ONLY territory.territory_group
    ADD CONSTRAINT territory_group_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_parent_territory_id_child_territory_id_key UNIQUE (parent_territory_id, child_territory_id);
ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_pkey PRIMARY KEY (_id);
ALTER TABLE ONLY trip.stat_cache
    ADD CONSTRAINT stat_cache_pkey PRIMARY KEY (hash);
CREATE INDEX acquisition_request_id_idx ON acquisition.acquisitions USING btree (request_id);
CREATE INDEX acquisition_status_idx ON acquisition.acquisitions USING btree (status);
CREATE INDEX acquisitions_application_id_idx ON acquisition.acquisitions USING btree (application_id);
CREATE INDEX acquisitions_created_at_idx ON acquisition.acquisitions USING btree (created_at);
CREATE INDEX acquisitions_journey_id_idx ON acquisition.acquisitions USING btree (journey_id);
CREATE INDEX acquisitions_operator_id_idx ON acquisition.acquisitions USING btree (operator_id);
CREATE UNIQUE INDEX acquisitions_operator_id_journey_id_idx ON acquisition.acquisitions USING btree (operator_id, journey_id);
CREATE INDEX errors_created_at ON acquisition.errors USING btree (created_at);
CREATE INDEX errors_journey_id_idx ON acquisition.errors USING btree (journey_id);
CREATE INDEX errors_operator_id_idx ON acquisition.errors USING btree (operator_id);
CREATE INDEX errors_request_id_idx ON acquisition.errors USING btree (request_id);
CREATE INDEX applications_owner_service_owner_id_idx ON application.applications USING btree (owner_service, owner_id);
CREATE UNIQUE INDEX applications_uuid_idx ON application.applications USING btree (uuid);
CREATE UNIQUE INDEX users_email_idx ON auth.users USING btree (email);
CREATE INDEX carpools_acquisition_id_idx ON carpool.carpools USING btree (acquisition_id);
CREATE UNIQUE INDEX carpools_acquisition_id_is_driver_idx ON carpool.carpools USING btree (acquisition_id, is_driver);
CREATE INDEX carpools_datetime_idx ON carpool.carpools USING btree (datetime);
CREATE INDEX carpools_datetime_operator_journey_id_operator_id_is_driver_idx ON carpool.carpools USING btree (datetime, operator_journey_id, operator_id, is_driver) WHERE ((datetime >= '2024-01-01 00:00:00+00'::timestamp with time zone) AND (is_driver = true));
CREATE INDEX carpools_end_geo_code_idx ON carpool.carpools USING btree (end_geo_code);
CREATE INDEX carpools_identity_id_idx ON carpool.carpools USING btree (identity_id);
CREATE INDEX carpools_operator_id_idx ON carpool.carpools USING btree (operator_id);
CREATE INDEX carpools_operator_journey_id_partial_idx ON carpool.carpools USING btree (operator_journey_id) WHERE (datetime >= '2022-12-31 00:00:00+00'::timestamp with time zone);
CREATE INDEX carpools_operator_trip_id_idx ON carpool.carpools USING btree (operator_trip_id);
CREATE INDEX carpools_start_geo_code_idx ON carpool.carpools USING btree (start_geo_code);
CREATE INDEX carpools_status_idx ON carpool.carpools USING btree (status);
CREATE INDEX carpools_trip_id_idx ON carpool.carpools USING btree (trip_id);
CREATE INDEX identities_created_at_idx ON carpool.identities USING btree (created_at);
CREATE INDEX identities_identity_key_idx ON carpool.identities USING btree (identity_key);
CREATE INDEX identities_operator_user_id_idx ON carpool.identities USING btree (operator_user_id) WITH (deduplicate_items='true');
CREATE INDEX identities_phone_idx ON carpool.identities USING btree (phone);
CREATE INDEX identities_phone_trunc_operator_user_id_idx ON carpool.identities USING btree (phone_trunc, operator_user_id);
CREATE INDEX identities_phone_trunc_travel_pass_name_travel_pass_user_id_idx ON carpool.identities USING btree (phone_trunc, travel_pass_name, travel_pass_user_id);
CREATE INDEX identities_uuid_idx ON carpool.identities USING btree (uuid);
CREATE INDEX incentives_acquisition_id_idx ON carpool.incentives USING btree (acquisition_id);
CREATE UNIQUE INDEX incentives_acquisition_id_idx_idx ON carpool.incentives USING btree (acquisition_id, idx);
CREATE INDEX incentives_datetime_idx ON carpool.incentives USING btree (datetime);
CREATE INDEX incentives_siret_idx ON carpool.incentives USING btree (siret);
CREATE INDEX carpool_created_at_idx ON carpool_v2.carpools USING btree (created_at);
CREATE INDEX carpool_driver_identity_key_idx ON carpool_v2.carpools USING btree (driver_identity_key);
CREATE INDEX carpool_driver_operator_user_id_idx ON carpool_v2.carpools USING btree (driver_operator_user_id);
CREATE INDEX carpool_driver_phone_trunc_idx ON carpool_v2.carpools USING btree (driver_phone_trunc);
CREATE UNIQUE INDEX carpool_geo_carpool_id_idx ON carpool_v2.geo USING btree (carpool_id);
CREATE INDEX carpool_geo_end_geo_code ON carpool_v2.geo USING btree (end_geo_code);
CREATE INDEX carpool_geo_start_geo_code ON carpool_v2.geo USING btree (start_geo_code);
CREATE UNIQUE INDEX carpool_incentives_carpool_id_idx ON carpool_v2.operator_incentives USING btree (carpool_id, idx);
CREATE INDEX carpool_incentives_siret_idx ON carpool_v2.operator_incentives USING btree (siret);
CREATE INDEX carpool_operator_id_idx ON carpool_v2.carpools USING btree (operator_id);
CREATE INDEX carpool_operator_journey_id_idx ON carpool_v2.carpools USING btree (operator_journey_id);
CREATE UNIQUE INDEX carpool_operator_operator_journey_id_idx ON carpool_v2.carpools USING btree (operator_id, operator_journey_id);
CREATE INDEX carpool_passenger_identity_key_idx ON carpool_v2.carpools USING btree (passenger_identity_key);
CREATE INDEX carpool_passenger_operator_user_id_idx ON carpool_v2.carpools USING btree (passenger_operator_user_id);
CREATE INDEX carpool_passenger_phone_trunc_idx ON carpool_v2.carpools USING btree (passenger_phone_trunc);
CREATE INDEX carpool_requests_carpool_id_idx ON carpool_v2.requests USING btree (carpool_id);
CREATE INDEX carpool_start_datetime_idx ON carpool_v2.carpools USING btree (start_datetime);
CREATE INDEX carpool_status_acquisition_idx ON carpool_v2.status USING btree (acquisition_status);
CREATE UNIQUE INDEX carpool_status_carpool_id_idx ON carpool_v2.status USING btree (carpool_id);
CREATE INDEX carpool_status_fraud_idx ON carpool_v2.status USING btree (fraud_status);
CREATE UNIQUE INDEX carpool_v2_carpools_uuid_idx ON carpool_v2.carpools USING btree (uuid);
CREATE INDEX cee_application_id_idx ON cee.labels USING btree (cee_application_id);
CREATE INDEX cee_atype_idx ON cee.cee_applications USING btree (is_specific);
CREATE INDEX cee_datetime_idx ON cee.cee_applications USING btree (datetime);
CREATE INDEX cee_error_datetime_idx ON cee.cee_application_errors USING btree (created_at);
CREATE INDEX cee_identity_idx ON cee.cee_applications USING btree (phone_trunc, last_name_trunc);
CREATE INDEX cee_identity_key_idx ON cee.cee_applications USING btree (identity_key);
CREATE INDEX cee_jtype_idx ON cee.cee_applications USING btree (journey_type);
CREATE INDEX cee_license_idx ON cee.cee_applications USING btree (driving_license);
CREATE UNIQUE INDEX cee_operator_id_journey_type_is_specific_uniqueness ON cee.cee_applications USING btree (operator_id, journey_type, last_name_trunc, phone_trunc) WHERE (is_specific = true);
CREATE UNIQUE INDEX cee_operator_id_operator_journey_id_on_short ON cee.cee_applications USING btree (operator_id, operator_journey_id) WHERE ((is_specific = false) AND (journey_type = 'short'::cee.journey_type_enum));
CREATE INDEX access_log_certificate_id_idx ON certificate.access_log USING btree (certificate_id);
CREATE INDEX certificates_new_identity_uuid_operator_id_idx ON certificate.certificates USING btree (identity_uuid, operator_id);
CREATE UNIQUE INDEX certificates_new_uuid_idx ON certificate.certificates USING btree (uuid);
CREATE INDEX companies_siren_idx ON company.companies USING btree (siren);
CREATE UNIQUE INDEX companies_siret_idx ON company.companies USING btree (siret);
CREATE INDEX exports_status_idx ON export.exports USING btree (status) WHERE ((status)::text = 'pending'::text);
CREATE UNIQUE INDEX exports_uuid_idx ON export.exports USING btree (uuid);
CREATE INDEX logs_export_id_idx ON export.logs USING btree (export_id);
CREATE UNIQUE INDEX recipients_export_id_email_idx ON export.recipients USING btree (export_id, email);
CREATE UNIQUE INDEX labels_carpool_id_label_idx ON fraudcheck.labels USING btree (carpool_id, label);
CREATE UNIQUE INDEX oui_departure_date_end_date_unique_index ON fraudcheck.phone_insights_detailed USING btree (operator_user_id, departure_date, end_date) WITH (deduplicate_items='true');
CREATE UNIQUE INDEX phone_insights_detailed_phone_trunc_departure_date_end_date_idx ON fraudcheck.phone_insights_detailed USING btree (phone_trunc, departure_date, end_date) WITH (deduplicate_items='true');
CREATE UNIQUE INDEX phone_insights_phone_trunc_departure_date_end_date_idx ON fraudcheck.phone_insights USING btree (phone_trunc, departure_date, end_date);
CREATE UNIQUE INDEX potential_triangular_patterns_id_groupe_phone_trunc_idx ON fraudcheck.potential_triangular_patterns USING btree (id, groupe, phone_trunc);
CREATE UNIQUE INDEX pt_departure_date_end_date_unique_index ON fraudcheck.triangular_patterns USING btree (phone_trunc, departure_date, end_date) WITH (deduplicate_items='true');
CREATE UNIQUE INDEX triangular_patterns_phone_trunc_departure_date_end_date_idx ON fraudcheck.triangular_patterns USING btree (phone_trunc, departure_date, end_date);
CREATE UNIQUE INDEX users_3_months_patterns_id_phone_trunc_idx ON fraudcheck.users_3_months_patterns USING btree (id, phone_trunc);
CREATE UNIQUE INDEX year_month_unique_index ON fraudcheck.user_phone_change_history USING btree (year_month) WITH (deduplicate_items='true');
CREATE INDEX geo_com_evolution_mod_index ON geo.com_evolution USING btree (mod);
CREATE INDEX geo_com_evolution_new_com_index ON geo.com_evolution USING btree (new_com);
CREATE INDEX geo_com_evolution_old_com_index ON geo.com_evolution USING btree (old_com);
CREATE INDEX geo_perimeters_aom_idx ON geo.perimeters USING btree (aom);
CREATE INDEX geo_perimeters_arr_idx ON geo.perimeters USING btree (arr);
CREATE INDEX geo_perimeters_centroid_geom_index ON geo.perimeters_centroid USING gist (geom);
CREATE INDEX geo_perimeters_centroid_id_index ON geo.perimeters_centroid USING btree (id);
CREATE INDEX geo_perimeters_centroid_index ON geo.perimeters USING gist (centroid);
CREATE INDEX geo_perimeters_dep_idx ON geo.perimeters USING btree (dep);
CREATE INDEX geo_perimeters_epci_idx ON geo.perimeters USING btree (epci);
CREATE INDEX geo_perimeters_geom_index ON geo.perimeters USING gist (geom);
CREATE INDEX geo_perimeters_geom_simple_index ON geo.perimeters USING gist (geom_simple);
CREATE INDEX geo_perimeters_id_index ON geo.perimeters USING btree (id);
CREATE INDEX geo_perimeters_reg_idx ON geo.perimeters USING btree (reg);
CREATE INDEX geo_perimeters_surface_idx ON geo.perimeters USING btree (surface);
CREATE INDEX geo_perimeters_year_idx ON geo.perimeters USING btree (year);
CREATE INDEX tmp_country ON geo.perimeters USING btree (country);
CREATE INDEX tracking_type_created_at_idx ON honor.tracking USING btree (type, created_at);
CREATE INDEX operators_siret_idx ON operator.operators USING btree (siret);
CREATE INDEX operators_uuid_idx ON operator.operators USING btree (uuid);
CREATE INDEX thumbnails_operator_id_idx ON operator.thumbnails USING btree (operator_id);
CREATE INDEX incentives_carpool_id_idx ON policy.incentives USING btree (carpool_id);
CREATE INDEX incentives_datetime_idx ON policy.incentives USING btree (datetime);
CREATE INDEX incentives_policy_id_idx ON policy.incentives USING btree (policy_id);
CREATE INDEX incentives_state_idx ON policy.incentives USING btree (state);
CREATE INDEX incentives_status_idx ON policy.incentives USING btree (status);
CREATE INDEX lock_stopped_at_idx ON policy.lock USING btree (stopped_at);
CREATE INDEX policies_territory_id_idx ON policy.policies USING btree (territory_id);
CREATE INDEX policy_incentives_operator_operator_journey_id_idx ON policy.incentives USING btree (operator_id, operator_journey_id);
CREATE UNIQUE INDEX policy_incentives_policy_operator_operator_journey_id_idx ON policy.incentives USING btree (policy_id, operator_id, operator_journey_id);
CREATE INDEX policy_meta_id_key ON policy.policy_metas USING btree (policy_id, key);
CREATE INDEX policy_meta_incentive ON policy.policy_metas USING btree (datetime);
CREATE INDEX policy_metas_policy_id_idx ON policy.policy_metas USING btree (policy_id);
CREATE INDEX acq_acquisition_id_idx ON public.acquisition_meta USING btree (acquisition_id);
CREATE INDEX insee_territory_id_idx ON territory.insee USING btree (territory_id);
CREATE INDEX territories__id_idx ON territory.territories USING btree (_id);
CREATE INDEX territories_geo_idx ON territory.territories USING gist (geo);
CREATE INDEX territory_codes_territory_id_idx ON territory.territory_codes USING btree (territory_id);
CREATE INDEX territory_codes_type_value_idx ON territory.territory_codes USING btree (type, value);
CREATE INDEX territory_group_deleted_idx ON territory.territory_group USING btree (deleted_at);
CREATE INDEX territory_group_name_idx ON territory.territory_group USING btree (name);
CREATE INDEX territory_group_selector_group_idx ON territory.territory_group_selector USING btree (territory_group_id);
CREATE UNIQUE INDEX territory_group_selector_idx ON territory.territory_group_selector USING btree (territory_group_id, selector_type, selector_value);
CREATE INDEX territory_operators_operator_id_idx ON territory.territory_operators_legacy USING btree (operator_id);
CREATE INDEX territory_operators_territory_id_idx ON territory.territory_operators_legacy USING btree (territory_id);
CREATE UNIQUE INDEX territory_operators_territory_id_operator_id_idx ON territory.territory_operators_legacy USING btree (territory_id, operator_id);
CREATE INDEX territory_relation_child_territory_id_idx ON territory.territory_relation USING btree (child_territory_id);
CREATE INDEX territory_relation_parent_territory_id_idx ON territory.territory_relation USING btree (parent_territory_id);
CREATE INDEX idx_applied_policies ON trip.list USING btree (applied_policies);
CREATE INDEX idx_driver_id ON trip.list USING btree (driver_id);
CREATE INDEX idx_journey_distance ON trip.list USING btree (journey_distance);
CREATE INDEX idx_journey_end_datetime ON trip.list USING btree (journey_end_datetime);
CREATE INDEX idx_journey_end_insee ON trip.list USING btree (journey_end_insee);
CREATE UNIQUE INDEX idx_journey_id ON trip.list USING btree (journey_id);
CREATE INDEX idx_journey_start_datetime ON trip.list USING btree (journey_start_datetime);
CREATE INDEX idx_journey_start_insee ON trip.list USING btree (journey_start_insee);
CREATE INDEX idx_operator_id ON trip.list USING btree (operator_id);
CREATE INDEX idx_operator_journey_id ON trip.list USING btree (operator_journey_id);
CREATE INDEX idx_passenger_id ON trip.list USING btree (passenger_id);
CREATE INDEX idx_status ON trip.list USING btree (status DESC NULLS LAST);
CREATE INDEX idx_trip_id ON trip.list USING btree (trip_id);
CREATE TRIGGER touch_acquisition_updated_at BEFORE UPDATE ON acquisition.acquisitions FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER hydrate_trip_from_carpool AFTER INSERT OR UPDATE ON carpool.carpools FOR EACH ROW EXECUTE FUNCTION public.hydrate_trip_from_carpool();
CREATE TRIGGER touch_identities_updated_at BEFORE UPDATE ON carpool.identities FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_carpool_updated_at BEFORE UPDATE ON carpool_v2.carpools FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_geo_updated_at BEFORE UPDATE ON carpool_v2.geo FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_status_updated_at BEFORE UPDATE ON carpool_v2.status FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_cee_updated_at BEFORE UPDATE ON cee.cee_applications FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_exports_updated_at BEFORE UPDATE ON export.exports FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER hydrate_trip_from_policy AFTER INSERT OR UPDATE ON policy.incentives FOR EACH ROW EXECUTE FUNCTION public.hydrate_trip_from_policy();
ALTER TABLE policy.incentives DISABLE TRIGGER hydrate_trip_from_policy;
CREATE TRIGGER touch_policies_updated_at BEFORE UPDATE ON policy.policies FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_policy_meta_updated_at BEFORE UPDATE ON policy.policy_metas FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_territory_group_updated_at BEFORE UPDATE ON territory.territory_group FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
ALTER TABLE ONLY carpool_v2.carpools
    ADD CONSTRAINT carpools_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);
ALTER TABLE ONLY carpool_v2.geo
    ADD CONSTRAINT geo_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);
ALTER TABLE ONLY carpool_v2.operator_incentive_counterparts
    ADD CONSTRAINT operator_incentive_counterparts_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);
ALTER TABLE ONLY carpool_v2.operator_incentives
    ADD CONSTRAINT operator_incentives_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);
ALTER TABLE ONLY carpool_v2.requests
    ADD CONSTRAINT requests_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);
ALTER TABLE ONLY carpool_v2.requests
    ADD CONSTRAINT requests_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);
ALTER TABLE ONLY carpool_v2.status
    ADD CONSTRAINT status_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);
ALTER TABLE ONLY cee.cee_application_errors
    ADD CONSTRAINT cee_application_errors_application_id_fkey FOREIGN KEY (application_id) REFERENCES cee.cee_applications(_id);
ALTER TABLE ONLY cee.cee_application_errors
    ADD CONSTRAINT cee_application_errors_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);
ALTER TABLE ONLY cee.cee_applications
    ADD CONSTRAINT cee_applications_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool.carpools(_id);
ALTER TABLE ONLY cee.cee_applications
    ADD CONSTRAINT cee_applications_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);
ALTER TABLE ONLY export.logs
    ADD CONSTRAINT logs_export_id_fkey FOREIGN KEY (export_id) REFERENCES export.exports(_id) ON DELETE CASCADE;
ALTER TABLE ONLY export.recipients
    ADD CONSTRAINT recipients_export_id_fkey FOREIGN KEY (export_id) REFERENCES export.exports(_id) ON DELETE CASCADE;
ALTER TABLE ONLY fraudcheck.labels
    ADD CONSTRAINT labels_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool.carpools(_id);
ALTER TABLE ONLY operator.thumbnails
    ADD CONSTRAINT thumbnails_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id) ON DELETE CASCADE;
ALTER TABLE ONLY policy.incentives
    ADD CONSTRAINT incentives_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);
ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_company_id_fkey FOREIGN KEY (company_id) REFERENCES company.companies(_id) ON DELETE SET NULL;
ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_territory_id_fkey FOREIGN KEY (territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;
ALTER TABLE ONLY territory.territory_group
    ADD CONSTRAINT territory_group_company_fk FOREIGN KEY (company_id) REFERENCES company.companies(_id);
ALTER TABLE ONLY territory.territory_group_selector
    ADD CONSTRAINT territory_group_selector_territory_fk FOREIGN KEY (territory_group_id) REFERENCES territory.territory_group(_id);
ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_child_territory_id_fkey FOREIGN KEY (child_territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;
ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_parent_territory_id_fkey FOREIGN KEY (parent_territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;
