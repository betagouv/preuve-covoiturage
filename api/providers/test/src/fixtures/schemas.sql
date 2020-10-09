--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: acquisition; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA acquisition;


ALTER SCHEMA acquisition OWNER TO postgres;

--
-- Name: application; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA application;


ALTER SCHEMA application OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: carpool; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA carpool;


ALTER SCHEMA carpool OWNER TO postgres;

--
-- Name: certificate; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA certificate;


ALTER SCHEMA certificate OWNER TO postgres;

--
-- Name: common; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA common;


ALTER SCHEMA common OWNER TO postgres;

--
-- Name: company; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA company;


ALTER SCHEMA company OWNER TO postgres;

--
-- Name: fraudcheck; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA fraudcheck;


ALTER SCHEMA fraudcheck OWNER TO postgres;

--
-- Name: operator; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA operator;


ALTER SCHEMA operator OWNER TO postgres;

--
-- Name: payment; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA payment;


ALTER SCHEMA payment OWNER TO postgres;

--
-- Name: policy; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA policy;


ALTER SCHEMA policy OWNER TO postgres;

--
-- Name: territory; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA territory;


ALTER SCHEMA territory OWNER TO postgres;

--
-- Name: trip; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA trip;


ALTER SCHEMA trip OWNER TO postgres;

--
-- Name: intarray; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS intarray WITH SCHEMA public;


--
-- Name: EXTENSION intarray; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION intarray IS 'functions, operators, and index support for 1-D arrays of integers';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track execution statistics of all SQL statements executed';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: user_status_enum; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.user_status_enum AS ENUM (
    'pending',
    'active',
    'invited',
    'blocked'
);


ALTER TYPE auth.user_status_enum OWNER TO postgres;

--
-- Name: carpool_status_enum; Type: TYPE; Schema: carpool; Owner: postgres
--

CREATE TYPE carpool.carpool_status_enum AS ENUM (
    'ok',
    'expired',
    'canceled',
    'fraudcheck_error'
);


ALTER TYPE carpool.carpool_status_enum OWNER TO postgres;

--
-- Name: status_enum; Type: TYPE; Schema: fraudcheck; Owner: postgres
--

CREATE TYPE fraudcheck.status_enum AS ENUM (
    'pending',
    'done',
    'error'
);


ALTER TYPE fraudcheck.status_enum OWNER TO postgres;

--
-- Name: result; Type: TYPE; Schema: fraudcheck; Owner: postgres
--

CREATE TYPE fraudcheck.result AS (
	method character varying(128),
	status fraudcheck.status_enum,
	karma double precision,
	meta json
);


ALTER TYPE fraudcheck.result OWNER TO postgres;

--
-- Name: payment_status_enum; Type: TYPE; Schema: payment; Owner: postgres
--

CREATE TYPE payment.payment_status_enum AS ENUM (
    'draft',
    'validated',
    'warning',
    'error'
);


ALTER TYPE payment.payment_status_enum OWNER TO postgres;

--
-- Name: payment_type_enum; Type: TYPE; Schema: payment; Owner: postgres
--

CREATE TYPE payment.payment_type_enum AS ENUM (
    'incentive',
    'payment'
);


ALTER TYPE payment.payment_type_enum OWNER TO postgres;

--
-- Name: incentive_state_enum; Type: TYPE; Schema: policy; Owner: postgres
--

CREATE TYPE policy.incentive_state_enum AS ENUM (
    'regular',
    'null',
    'disabled'
);


ALTER TYPE policy.incentive_state_enum OWNER TO postgres;

--
-- Name: incentive_status_enum; Type: TYPE; Schema: policy; Owner: postgres
--

CREATE TYPE policy.incentive_status_enum AS ENUM (
    'draft',
    'validated',
    'warning',
    'error'
);


ALTER TYPE policy.incentive_status_enum OWNER TO postgres;

--
-- Name: policy_status_enum; Type: TYPE; Schema: policy; Owner: postgres
--

CREATE TYPE policy.policy_status_enum AS ENUM (
    'template',
    'draft',
    'active',
    'finished'
);


ALTER TYPE policy.policy_status_enum OWNER TO postgres;

--
-- Name: policy_unit_enum; Type: TYPE; Schema: policy; Owner: postgres
--

CREATE TYPE policy.policy_unit_enum AS ENUM (
    'euro',
    'point'
);


ALTER TYPE policy.policy_unit_enum OWNER TO postgres;

--
-- Name: breadcrumb; Type: TYPE; Schema: territory; Owner: postgres
--

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


ALTER TYPE territory.breadcrumb OWNER TO postgres;

--
-- Name: codes; Type: TYPE; Schema: territory; Owner: postgres
--

CREATE TYPE territory.codes AS (
	insee character varying[],
	postcode character varying[],
	codedep character varying[]
);


ALTER TYPE territory.codes OWNER TO postgres;

--
-- Name: territory_level_enum; Type: TYPE; Schema: territory; Owner: postgres
--

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


ALTER TYPE territory.territory_level_enum OWNER TO postgres;

--
-- Name: view; Type: TYPE; Schema: territory; Owner: postgres
--

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


ALTER TYPE territory.view OWNER TO postgres;

--
-- Name: incentive; Type: TYPE; Schema: trip; Owner: postgres
--

CREATE TYPE trip.incentive AS (
	siret character varying,
	amount integer,
	unit character varying,
	policy_id integer,
	type character varying
);


ALTER TYPE trip.incentive OWNER TO postgres;

--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: common; Owner: postgres
--

CREATE FUNCTION common.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION common.touch_updated_at() OWNER TO postgres;

--
-- Name: json_to_result(json); Type: FUNCTION; Schema: fraudcheck; Owner: postgres
--

CREATE FUNCTION fraudcheck.json_to_result(_ti json) RETURNS fraudcheck.result
    LANGUAGE sql
    AS $_$
  select ROW(
    $1->>'method',
    ($1->>'status')::fraudcheck.status_enum,
    ($1->>'karma')::float,
    ($1->>'meta')::json)::fraudcheck.result;
$_$;


ALTER FUNCTION fraudcheck.json_to_result(_ti json) OWNER TO postgres;

--
-- Name: json_to_result_array(json); Type: FUNCTION; Schema: fraudcheck; Owner: postgres
--

CREATE FUNCTION fraudcheck.json_to_result_array(_ti json) RETURNS fraudcheck.result[]
    LANGUAGE sql
    AS $_$
	select array_agg(fraudcheck.json_to_result(value)) from json_array_elements($1)
$_$;


ALTER FUNCTION fraudcheck.json_to_result_array(_ti json) OWNER TO postgres;

--
-- Name: result_to_json(fraudcheck.result); Type: FUNCTION; Schema: fraudcheck; Owner: postgres
--

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


ALTER FUNCTION fraudcheck.result_to_json(_ti fraudcheck.result) OWNER TO postgres;

--
-- Name: result_array_to_json(fraudcheck.result[]); Type: FUNCTION; Schema: fraudcheck; Owner: postgres
--

CREATE FUNCTION fraudcheck.result_array_to_json(_ti fraudcheck.result[]) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_agg(fraudcheck.result_to_json(data)) FROM UNNEST($1) as data;
$_$;


ALTER FUNCTION fraudcheck.result_array_to_json(_ti fraudcheck.result[]) OWNER TO postgres;

--
-- Name: breadcrumb_to_json(territory.breadcrumb); Type: FUNCTION; Schema: public; Owner: postgres
--

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


ALTER FUNCTION public.breadcrumb_to_json(bc territory.breadcrumb) OWNER TO postgres;

--
-- Name: hydrate_trip_from_carpool(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.hydrate_trip_from_carpool() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.hydrate_trip_from_carpool() OWNER TO postgres;

--
-- Name: hydrate_trip_from_policy(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.hydrate_trip_from_policy() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.hydrate_trip_from_policy() OWNER TO postgres;

--
-- Name: incentive_to_json(trip.incentive); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.incentive_to_json(_ti trip.incentive) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_build_object(
    'siret', $1.siret
  , 'amount', $1.amount
  , 'unit', $1.unit
  , 'policy_id', $1.policy_id
  , 'type', $1.type
  );
$_$;


ALTER FUNCTION public.incentive_to_json(_ti trip.incentive) OWNER TO postgres;

--
-- Name: json_to_breadcrumb(json); Type: FUNCTION; Schema: public; Owner: postgres
--

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


ALTER FUNCTION public.json_to_breadcrumb(bc json) OWNER TO postgres;

--
-- Name: json_to_incentive(json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.json_to_incentive(_ti json) RETURNS trip.incentive
    LANGUAGE sql
    AS $_$
  select ROW(
    $1->>'siret',
    ($1->>'amount')::int,
    $1->>'unit',
    ($1->>'policy_id')::int,
    $1->>'type')::trip.incentive;
$_$;


ALTER FUNCTION public.json_to_incentive(_ti json) OWNER TO postgres;

--
-- Name: ts_ceil(timestamp with time zone, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ts_ceil(_tstz timestamp with time zone, _int_seconds integer) RETURNS timestamp with time zone
    LANGUAGE sql STABLE
    AS $_$   
SELECT to_timestamp(ceil(extract(epoch FROM $1) / $2) * $2)
$_$;


ALTER FUNCTION public.ts_ceil(_tstz timestamp with time zone, _int_seconds integer) OWNER TO postgres;

--
-- Name: get_ancestors(integer[]); Type: FUNCTION; Schema: territory; Owner: postgres
--

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


ALTER FUNCTION territory.get_ancestors(ids integer[]) OWNER TO postgres;

--
-- Name: get_breadcrumb(integer, integer[]); Type: FUNCTION; Schema: territory; Owner: postgres
--

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


ALTER FUNCTION territory.get_breadcrumb(target_id integer, ancestors_ids integer[]) OWNER TO postgres;

--
-- Name: get_codes(integer, integer[]); Type: FUNCTION; Schema: territory; Owner: postgres
--

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


ALTER FUNCTION territory.get_codes(target_id integer, descendants_ids integer[]) OWNER TO postgres;

--
-- Name: get_data(integer[]); Type: FUNCTION; Schema: territory; Owner: postgres
--

CREATE FUNCTION territory.get_data(ids integer[]) RETURNS SETOF territory.view
    LANGUAGE sql STABLE
    AS $$
WITH RECURSIVE
  -- get _id as table filter existing on territory.territories
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


ALTER FUNCTION territory.get_data(ids integer[]) OWNER TO postgres;

--
-- Name: get_descendants(integer[]); Type: FUNCTION; Schema: territory; Owner: postgres
--

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


ALTER FUNCTION territory.get_descendants(ids integer[]) OWNER TO postgres;

--
-- Name: get_relations(integer[]); Type: FUNCTION; Schema: territory; Owner: postgres
--

CREATE FUNCTION territory.get_relations(ids integer[]) RETURNS integer[]
    LANGUAGE sql STABLE
    AS $$
  WITH data AS (
    SELECT * FROM unnest(territory.get_descendants(ids)) as _id
    UNION
    SELECT * FROM unnest(territory.get_ancestors(ids)) as _id
  ) SELECT array_agg(distinct _id) from data;
$$;


ALTER FUNCTION territory.get_relations(ids integer[]) OWNER TO postgres;

--
-- Name: CAST (fraudcheck.result[] AS json); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (fraudcheck.result[] AS json) WITH FUNCTION fraudcheck.result_array_to_json(fraudcheck.result[]) AS ASSIGNMENT;


--
-- Name: CAST (territory.breadcrumb AS json); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (territory.breadcrumb AS json) WITH FUNCTION public.breadcrumb_to_json(territory.breadcrumb) AS ASSIGNMENT;


--
-- Name: CAST (trip.incentive AS json); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (trip.incentive AS json) WITH FUNCTION public.incentive_to_json(trip.incentive) AS ASSIGNMENT;


--
-- Name: CAST (json AS fraudcheck.result[]); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (json AS fraudcheck.result[]) WITH FUNCTION fraudcheck.json_to_result_array(json) AS ASSIGNMENT;


--
-- Name: CAST (json AS territory.breadcrumb); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (json AS territory.breadcrumb) WITH FUNCTION public.json_to_breadcrumb(json) AS ASSIGNMENT;


--
-- Name: CAST (json AS trip.incentive); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (json AS trip.incentive) WITH FUNCTION public.json_to_incentive(json) AS ASSIGNMENT;


--
-- Name: CAST (json AS fraudcheck.result); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (json AS fraudcheck.result) WITH FUNCTION fraudcheck.json_to_result(json) AS ASSIGNMENT;


--
-- Name: CAST (fraudcheck.result AS json); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (fraudcheck.result AS json) WITH FUNCTION fraudcheck.result_to_json(fraudcheck.result) AS ASSIGNMENT;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acquisitions; Type: TABLE; Schema: acquisition; Owner: postgres
--

CREATE TABLE acquisition.acquisitions (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    application_id integer NOT NULL,
    operator_id integer NOT NULL,
    journey_id character varying NOT NULL,
    payload json NOT NULL
);


ALTER TABLE acquisition.acquisitions OWNER TO postgres;

--
-- Name: acquisitions__id_seq; Type: SEQUENCE; Schema: acquisition; Owner: postgres
--

CREATE SEQUENCE acquisition.acquisitions__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE acquisition.acquisitions__id_seq OWNER TO postgres;

--
-- Name: acquisitions__id_seq; Type: SEQUENCE OWNED BY; Schema: acquisition; Owner: postgres
--

ALTER SEQUENCE acquisition.acquisitions__id_seq OWNED BY acquisition.acquisitions._id;


--
-- Name: carpools; Type: TABLE; Schema: carpool; Owner: postgres
--

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
    end_territory_id integer
);


ALTER TABLE carpool.carpools OWNER TO postgres;

--
-- Name: carpools; Type: VIEW; Schema: acquisition; Owner: postgres
--

CREATE VIEW acquisition.carpools AS
 SELECT carpools.acquisition_id,
    carpools.operator_id,
    carpools.operator_trip_id AS journey_id,
    carpools.status
   FROM carpool.carpools
  WHERE ((carpools.is_driver = true) AND (carpools.operator_trip_id IS NOT NULL))
  ORDER BY carpools.acquisition_id DESC;


ALTER TABLE acquisition.carpools OWNER TO postgres;

--
-- Name: errors; Type: TABLE; Schema: acquisition; Owner: postgres
--

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


ALTER TABLE acquisition.errors OWNER TO postgres;

--
-- Name: errors__id_seq; Type: SEQUENCE; Schema: acquisition; Owner: postgres
--

CREATE SEQUENCE acquisition.errors__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE acquisition.errors__id_seq OWNER TO postgres;

--
-- Name: errors__id_seq; Type: SEQUENCE OWNED BY; Schema: acquisition; Owner: postgres
--

ALTER SEQUENCE acquisition.errors__id_seq OWNED BY acquisition.errors._id;


--
-- Name: applications; Type: TABLE; Schema: application; Owner: postgres
--

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


ALTER TABLE application.applications OWNER TO postgres;

--
-- Name: applications_new__id_seq; Type: SEQUENCE; Schema: application; Owner: postgres
--

CREATE SEQUENCE application.applications_new__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE application.applications_new__id_seq OWNER TO postgres;

--
-- Name: applications_new__id_seq; Type: SEQUENCE OWNED BY; Schema: application; Owner: postgres
--

ALTER SEQUENCE application.applications_new__id_seq OWNED BY application.applications._id;


--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

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
    last_login_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: users__id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

CREATE SEQUENCE auth.users__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.users__id_seq OWNER TO postgres;

--
-- Name: users__id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: postgres
--

ALTER SEQUENCE auth.users__id_seq OWNED BY auth.users._id;


--
-- Name: carpools__id_seq; Type: SEQUENCE; Schema: carpool; Owner: postgres
--

CREATE SEQUENCE carpool.carpools__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE carpool.carpools__id_seq OWNER TO postgres;

--
-- Name: carpools__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool; Owner: postgres
--

ALTER SEQUENCE carpool.carpools__id_seq OWNED BY carpool.carpools._id;


--
-- Name: identities; Type: TABLE; Schema: carpool; Owner: postgres
--

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
    over_18 boolean
);


ALTER TABLE carpool.identities OWNER TO postgres;

--
-- Name: identities__id_seq; Type: SEQUENCE; Schema: carpool; Owner: postgres
--

CREATE SEQUENCE carpool.identities__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE carpool.identities__id_seq OWNER TO postgres;

--
-- Name: identities__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool; Owner: postgres
--

ALTER SEQUENCE carpool.identities__id_seq OWNED BY carpool.identities._id;


--
-- Name: access_log; Type: TABLE; Schema: certificate; Owner: postgres
--

CREATE TABLE certificate.access_log (
    _id integer NOT NULL,
    certificate_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ip inet,
    user_agent character varying,
    user_id character varying,
    content_type character varying
);


ALTER TABLE certificate.access_log OWNER TO postgres;

--
-- Name: access_log__id_seq; Type: SEQUENCE; Schema: certificate; Owner: postgres
--

CREATE SEQUENCE certificate.access_log__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE certificate.access_log__id_seq OWNER TO postgres;

--
-- Name: access_log__id_seq; Type: SEQUENCE OWNED BY; Schema: certificate; Owner: postgres
--

ALTER SEQUENCE certificate.access_log__id_seq OWNED BY certificate.access_log._id;


--
-- Name: certificates; Type: TABLE; Schema: certificate; Owner: postgres
--

CREATE TABLE certificate.certificates (
    _id integer NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    identity_uuid uuid NOT NULL,
    operator_id character varying NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE certificate.certificates OWNER TO postgres;

--
-- Name: certificates__id_seq; Type: SEQUENCE; Schema: certificate; Owner: postgres
--

CREATE SEQUENCE certificate.certificates__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE certificate.certificates__id_seq OWNER TO postgres;

--
-- Name: certificates__id_seq; Type: SEQUENCE OWNED BY; Schema: certificate; Owner: postgres
--

ALTER SEQUENCE certificate.certificates__id_seq OWNED BY certificate.certificates._id;


--
-- Name: certificates_new__id_seq; Type: SEQUENCE; Schema: certificate; Owner: postgres
--

CREATE SEQUENCE certificate.certificates_new__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE certificate.certificates_new__id_seq OWNER TO postgres;

--
-- Name: certificates_new__id_seq; Type: SEQUENCE OWNED BY; Schema: certificate; Owner: postgres
--

ALTER SEQUENCE certificate.certificates_new__id_seq OWNED BY certificate.certificates._id;


--
-- Name: certificates_old; Type: TABLE; Schema: certificate; Owner: postgres
--

CREATE TABLE certificate.certificates_old (
    _id integer DEFAULT nextval('certificate.certificates__id_seq'::regclass),
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    identity_id integer NOT NULL,
    operator_id integer NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    meta jsonb
);


ALTER TABLE certificate.certificates_old OWNER TO postgres;

--
-- Name: identities; Type: VIEW; Schema: certificate; Owner: postgres
--

CREATE VIEW certificate.identities AS
 SELECT ci.phone,
    array_agg(cc.identity_id) AS identities
   FROM (carpool.carpools cc
     JOIN carpool.identities ci ON ((cc.identity_id = ci._id)))
  GROUP BY ci.phone;


ALTER TABLE certificate.identities OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: common; Owner: postgres
--

CREATE TABLE common.roles (
    slug character varying NOT NULL,
    description character varying,
    permissions character varying[]
);


ALTER TABLE common.roles OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: company; Owner: postgres
--

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


ALTER TABLE company.companies OWNER TO postgres;

--
-- Name: companies__id_seq; Type: SEQUENCE; Schema: company; Owner: postgres
--

CREATE SEQUENCE company.companies__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE company.companies__id_seq OWNER TO postgres;

--
-- Name: companies__id_seq; Type: SEQUENCE OWNED BY; Schema: company; Owner: postgres
--

ALTER SEQUENCE company.companies__id_seq OWNED BY company.companies._id;


--
-- Name: fraudchecks; Type: TABLE; Schema: fraudcheck; Owner: postgres
--

CREATE TABLE fraudcheck.fraudchecks (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    acquisition_id integer NOT NULL,
    status fraudcheck.status_enum DEFAULT 'pending'::fraudcheck.status_enum NOT NULL,
    karma double precision DEFAULT 0,
    data fraudcheck.result[]
);


ALTER TABLE fraudcheck.fraudchecks OWNER TO postgres;

--
-- Name: fraudchecks__id_seq1; Type: SEQUENCE; Schema: fraudcheck; Owner: postgres
--

CREATE SEQUENCE fraudcheck.fraudchecks__id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE fraudcheck.fraudchecks__id_seq1 OWNER TO postgres;

--
-- Name: fraudchecks__id_seq1; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: postgres
--

ALTER SEQUENCE fraudcheck.fraudchecks__id_seq1 OWNED BY fraudcheck.fraudchecks._id;


--
-- Name: processable_carpool; Type: MATERIALIZED VIEW; Schema: fraudcheck; Owner: postgres
--

CREATE MATERIALIZED VIEW fraudcheck.processable_carpool AS
 SELECT DISTINCT cc.acquisition_id
   FROM (carpool.carpools cc
     LEFT JOIN fraudcheck.fraudchecks ff ON (((ff.acquisition_id = cc.acquisition_id) AND (ff.status = 'done'::fraudcheck.status_enum))))
  WHERE ((cc.datetime >= (now() - '45 days'::interval)) AND (ff.acquisition_id IS NULL))
  WITH NO DATA;


ALTER TABLE fraudcheck.processable_carpool OWNER TO postgres;

--
-- Name: operators; Type: TABLE; Schema: operator; Owner: postgres
--

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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


ALTER TABLE operator.operators OWNER TO postgres;

--
-- Name: operators__id_seq; Type: SEQUENCE; Schema: operator; Owner: postgres
--

CREATE SEQUENCE operator.operators__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE operator.operators__id_seq OWNER TO postgres;

--
-- Name: operators__id_seq; Type: SEQUENCE OWNED BY; Schema: operator; Owner: postgres
--

ALTER SEQUENCE operator.operators__id_seq OWNED BY operator.operators._id;


--
-- Name: payments; Type: TABLE; Schema: payment; Owner: postgres
--

CREATE TABLE payment.payments (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    siret character varying NOT NULL,
    index smallint NOT NULL,
    type payment.payment_type_enum NOT NULL,
    amount integer DEFAULT 0 NOT NULL,
    status payment.payment_status_enum NOT NULL,
    meta json
);


ALTER TABLE payment.payments OWNER TO postgres;

--
-- Name: payments__id_seq; Type: SEQUENCE; Schema: payment; Owner: postgres
--

CREATE SEQUENCE payment.payments__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE payment.payments__id_seq OWNER TO postgres;

--
-- Name: payments__id_seq; Type: SEQUENCE OWNED BY; Schema: payment; Owner: postgres
--

ALTER SEQUENCE payment.payments__id_seq OWNED BY payment.payments._id;


--
-- Name: incentives; Type: TABLE; Schema: policy; Owner: postgres
--

CREATE TABLE policy.incentives (
    _id integer NOT NULL,
    policy_id integer NOT NULL,
    status policy.incentive_status_enum NOT NULL,
    meta json,
    carpool_id integer NOT NULL,
    amount integer DEFAULT 0 NOT NULL,
    datetime timestamp with time zone NOT NULL,
    result integer DEFAULT 0 NOT NULL,
    state policy.incentive_state_enum DEFAULT 'regular'::policy.incentive_state_enum NOT NULL
);


ALTER TABLE policy.incentives OWNER TO postgres;

--
-- Name: incentives__id_seq; Type: SEQUENCE; Schema: policy; Owner: postgres
--

CREATE SEQUENCE policy.incentives__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE policy.incentives__id_seq OWNER TO postgres;

--
-- Name: incentives__id_seq; Type: SEQUENCE OWNED BY; Schema: policy; Owner: postgres
--

ALTER SEQUENCE policy.incentives__id_seq OWNED BY policy.incentives._id;


--
-- Name: policies; Type: TABLE; Schema: policy; Owner: postgres
--

CREATE TABLE policy.policies (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    parent_id integer,
    territory_id integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    name character varying NOT NULL,
    description character varying,
    unit policy.policy_unit_enum NOT NULL,
    status policy.policy_status_enum NOT NULL,
    global_rules json,
    rules json,
    ui_status json,
    slug character varying
);


ALTER TABLE policy.policies OWNER TO postgres;

--
-- Name: policies__id_seq; Type: SEQUENCE; Schema: policy; Owner: postgres
--

CREATE SEQUENCE policy.policies__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE policy.policies__id_seq OWNER TO postgres;

--
-- Name: policies__id_seq; Type: SEQUENCE OWNED BY; Schema: policy; Owner: postgres
--

ALTER SEQUENCE policy.policies__id_seq OWNED BY policy.policies._id;


--
-- Name: policy_metas; Type: TABLE; Schema: policy; Owner: postgres
--

CREATE TABLE policy.policy_metas (
    _id integer NOT NULL,
    policy_id integer NOT NULL,
    key character varying DEFAULT 'default'::character varying NOT NULL,
    value json,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE policy.policy_metas OWNER TO postgres;

--
-- Name: policy_metas__id_seq; Type: SEQUENCE; Schema: policy; Owner: postgres
--

CREATE SEQUENCE policy.policy_metas__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE policy.policy_metas__id_seq OWNER TO postgres;

--
-- Name: policy_metas__id_seq; Type: SEQUENCE OWNED BY; Schema: policy; Owner: postgres
--

ALTER SEQUENCE policy.policy_metas__id_seq OWNED BY policy.policy_metas._id;


--
-- Name: territory_codes; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territory_codes (
    _id integer NOT NULL,
    territory_id integer NOT NULL,
    type character varying(10) NOT NULL,
    value character varying(64) NOT NULL
);


ALTER TABLE territory.territory_codes OWNER TO postgres;

--
-- Name: trips; Type: MATERIALIZED VIEW; Schema: policy; Owner: postgres
--

CREATE MATERIALIZED VIEW policy.trips AS
 SELECT cp._id AS carpool_id,
    cp.status AS carpool_status,
    cp.trip_id,
    tsc.value[1] AS start_insee,
    tec.value[1] AS end_insee,
    cp.operator_id,
    cp.operator_class,
    cp.datetime,
    cp.seats,
    cp.cost,
    cp.is_driver,
        CASE
            WHEN (cp.distance IS NOT NULL) THEN cp.distance
            ELSE ((cp.meta ->> 'calc_distance'::text))::integer
        END AS distance,
        CASE
            WHEN (cp.duration IS NOT NULL) THEN cp.duration
            ELSE ((cp.meta ->> 'calc_duration'::text))::integer
        END AS duration,
    id.identity_uuid,
    id.has_travel_pass,
    id.is_over_18,
    (ats.ats || cp.start_territory_id) AS start_territory_id,
    (ate.ate || cp.end_territory_id) AS end_territory_id,
    ap.applicable_policies,
    pp.processed_policies,
    (ap.applicable_policies OPERATOR(public.-) pp.processed_policies) AS processable_policies
   FROM ((carpool.carpools cp
     LEFT JOIN LATERAL territory.get_ancestors(ARRAY[cp.start_territory_id]) ats(ats) ON (true))
     LEFT JOIN LATERAL territory.get_ancestors(ARRAY[cp.end_territory_id]) ate(ate) ON (true)),
    LATERAL ( SELECT array_agg(territory_codes.value) AS value
           FROM territory.territory_codes
          WHERE ((territory_codes.territory_id = cp.start_territory_id) AND ((territory_codes.type)::text = 'insee'::text))) tsc,
    LATERAL ( SELECT array_agg(territory_codes.value) AS value
           FROM territory.territory_codes
          WHERE ((territory_codes.territory_id = cp.end_territory_id) AND ((territory_codes.type)::text = 'insee'::text))) tec,
    LATERAL ( SELECT COALESCE(array_agg(pp_1._id), ARRAY[]::integer[]) AS applicable_policies
           FROM policy.policies pp_1
          WHERE ((pp_1.territory_id = ANY ((((cp.start_territory_id || ats.ats) || ate.ate) || cp.end_territory_id))) AND (pp_1.start_date <= cp.datetime) AND (pp_1.end_date >= cp.datetime) AND (pp_1.status = 'active'::policy.policy_status_enum))) ap,
    LATERAL ( SELECT COALESCE(array_agg(pi.policy_id), ARRAY[]::integer[]) AS processed_policies
           FROM policy.incentives pi
          WHERE (pi.carpool_id = cp._id)) pp,
    LATERAL ( SELECT
                CASE
                    WHEN (ci.travel_pass_user_id IS NOT NULL) THEN true
                    ELSE false
                END AS has_travel_pass,
                CASE
                    WHEN (ci.over_18 IS NOT NULL) THEN ci.over_18
                    ELSE NULL::boolean
                END AS is_over_18,
            ci.uuid AS identity_uuid
           FROM carpool.identities ci
          WHERE (cp.identity_id = ci._id)) id
  WHERE ((cp.datetime >= (now() - '45 days'::interval)) AND (cp.datetime < (now() - '5 days'::interval)))
  WITH NO DATA;


ALTER TABLE policy.trips OWNER TO postgres;

--
-- Name: acquisition_meta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acquisition_meta (
    acquisition_id integer,
    created_at timestamp without time zone,
    meta character varying
);


ALTER TABLE public.acquisition_meta OWNER TO postgres;

--
-- Name: mapids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mapids (
    _id integer NOT NULL,
    collection character varying(64) NOT NULL,
    key character varying(24) NOT NULL,
    object_id character varying(24) NOT NULL,
    pg_id integer NOT NULL
);


ALTER TABLE public.mapids OWNER TO postgres;

--
-- Name: mapids__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mapids__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mapids__id_seq OWNER TO postgres;

--
-- Name: mapids__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mapids__id_seq OWNED BY public.mapids._id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: insee; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.insee (
    _id character varying NOT NULL,
    territory_id integer NOT NULL
);


ALTER TABLE territory.insee OWNER TO postgres;

--
-- Name: territories; Type: TABLE; Schema: territory; Owner: postgres
--

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
    surface integer,
    geo public.geography,
    ui_status json
);


ALTER TABLE territory.territories OWNER TO postgres;

--
-- Name: territories__id_seq1; Type: SEQUENCE; Schema: territory; Owner: postgres
--

CREATE SEQUENCE territory.territories__id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE territory.territories__id_seq1 OWNER TO postgres;

--
-- Name: territories__id_seq1; Type: SEQUENCE OWNED BY; Schema: territory; Owner: postgres
--

ALTER SEQUENCE territory.territories__id_seq1 OWNED BY territory.territories._id;


--
-- Name: territory_codes__id_seq; Type: SEQUENCE; Schema: territory; Owner: postgres
--

CREATE SEQUENCE territory.territory_codes__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE territory.territory_codes__id_seq OWNER TO postgres;

--
-- Name: territory_codes__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: postgres
--

ALTER SEQUENCE territory.territory_codes__id_seq OWNED BY territory.territory_codes._id;


--
-- Name: territory_operators; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territory_operators (
    territory_id integer NOT NULL,
    operator_id integer NOT NULL
);


ALTER TABLE territory.territory_operators OWNER TO postgres;

--
-- Name: territory_relation; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territory_relation (
    _id integer NOT NULL,
    parent_territory_id integer NOT NULL,
    child_territory_id integer NOT NULL
);


ALTER TABLE territory.territory_relation OWNER TO postgres;

--
-- Name: territory_relation__id_seq; Type: SEQUENCE; Schema: territory; Owner: postgres
--

CREATE SEQUENCE territory.territory_relation__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE territory.territory_relation__id_seq OWNER TO postgres;

--
-- Name: territory_relation__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: postgres
--

ALTER SEQUENCE territory.territory_relation__id_seq OWNED BY territory.territory_relation._id;


--
-- Name: list; Type: TABLE; Schema: trip; Owner: postgres
--

CREATE TABLE trip.list (
    operator_id integer,
    start_territory_id integer,
    end_territory_id integer,
    applied_policies integer[],
    journey_id integer,
    trip_id character varying(256),
    journey_start_datetime timestamp with time zone,
    journey_start_weekday integer,
    journey_start_dayhour integer,
    journey_start_lon numeric,
    journey_start_lat numeric,
    journey_start_insee character varying(10),
    journey_start_postalcode character varying(10),
    journey_start_department character varying(2),
    journey_start_town character varying(128),
    journey_start_towngroup character varying(128),
    journey_start_country character varying(128),
    journey_end_datetime timestamp with time zone,
    journey_end_lon numeric,
    journey_end_lat numeric,
    journey_end_insee character varying(10),
    journey_end_postalcode character varying(10),
    journey_end_department character varying(2),
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
    status carpool.carpool_status_enum
);


ALTER TABLE trip.list OWNER TO postgres;

--
-- Name: list_view; Type: VIEW; Schema: trip; Owner: postgres
--

CREATE VIEW trip.list_view AS
 SELECT cpp.operator_id,
    cpp.start_territory_id,
    cpp.end_territory_id,
    COALESCE((pip.policy_id || pid.policy_id), ARRAY[]::integer[]) AS applied_policies,
    cpp.acquisition_id AS journey_id,
    cpp.trip_id,
    public.ts_ceil(cpp.datetime, 600) AS journey_start_datetime,
    date_part('isodow'::text, cpp.datetime) AS journey_start_weekday,
    date_part('hour'::text, cpp.datetime) AS journey_start_dayhour,
    trunc((public.st_x((cpp.start_position)::public.geometry))::numeric,
        CASE
            WHEN ((tts.surface > 0) AND (((tts.population)::double precision / ((tts.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_start_lon,
    trunc((public.st_y((cpp.start_position)::public.geometry))::numeric,
        CASE
            WHEN ((tts.surface > 0) AND (((tts.population)::double precision / ((tts.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_start_lat,
    cts.insee[1] AS journey_start_insee,
    cts.postcode[1] AS journey_start_postalcode,
    "substring"((cts.postcode[1])::text, 1, 2) AS journey_start_department,
    bts.town AS journey_start_town,
    bts.towngroup AS journey_start_towngroup,
    bts.country AS journey_start_country,
    public.ts_ceil((cpp.datetime + ((cpp.duration || ' seconds'::text))::interval), 600) AS journey_end_datetime,
    trunc((public.st_x((cpp.end_position)::public.geometry))::numeric,
        CASE
            WHEN ((tte.surface > 0) AND (((tte.population)::double precision / ((tte.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_end_lon,
    trunc((public.st_y((cpp.end_position)::public.geometry))::numeric,
        CASE
            WHEN ((tte.surface > 0) AND (((tte.population)::double precision / ((tte.surface)::double precision / (100)::double precision)) > (40)::double precision)) THEN 3
            ELSE 2
        END) AS journey_end_lat,
    cte.insee[1] AS journey_end_insee,
    cte.postcode[1] AS journey_end_postalcode,
    "substring"((cte.postcode[1])::text, 1, 2) AS journey_end_department,
    bte.town AS journey_end_town,
    bte.towngroup AS journey_end_towngroup,
    bte.country AS journey_end_country,
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
    pid.incentive_sum AS driver_incentive_rpc_sum,
    cpp.status
   FROM ((((((((((carpool.carpools cpp
     JOIN operator.operators ope ON ((ope._id = cpp.operator_id)))
     LEFT JOIN territory.territories tts ON ((tts._id = cpp.start_territory_id)))
     LEFT JOIN territory.territories tte ON ((tte._id = cpp.end_territory_id)))
     LEFT JOIN carpool.carpools cpd ON (((cpd.acquisition_id = cpp.acquisition_id) AND (cpd.is_driver = true) AND (cpd.status = 'ok'::carpool.carpool_status_enum))))
     LEFT JOIN carpool.identities cip ON ((cip._id = cpp.identity_id)))
     LEFT JOIN carpool.identities cid ON ((cid._id = cpd.identity_id)))
     LEFT JOIN LATERAL territory.get_codes(cpp.start_territory_id, ARRAY[]::integer[]) cts(insee, postcode, codedep) ON (true))
     LEFT JOIN LATERAL territory.get_codes(cpp.end_territory_id, ARRAY[]::integer[]) cte(insee, postcode, codedep) ON (true))
     LEFT JOIN LATERAL territory.get_breadcrumb(cpp.start_territory_id, territory.get_ancestors(ARRAY[cpp.start_territory_id])) bts(country, countrygroup, district, megalopolis, other, region, state, town, towngroup) ON (true))
     LEFT JOIN LATERAL territory.get_breadcrumb(cpp.end_territory_id, territory.get_ancestors(ARRAY[cpp.end_territory_id])) bte(country, countrygroup, district, megalopolis, other, region, state, town, towngroup) ON (true)),
    LATERAL ( WITH data AS (
                 SELECT pi.policy_id,
                    sum(pi.amount) AS amount
                   FROM policy.incentives pi
                  WHERE ((pi.carpool_id = cpp._id) AND (pi.status = 'validated'::policy.incentive_status_enum))
                  GROUP BY pi.policy_id
                ), incentive AS (
                 SELECT data.policy_id,
                    ROW(cc.siret, (data.amount)::integer, (pp.unit)::character varying, data.policy_id, 'incentive'::character varying)::trip.incentive AS value,
                    data.amount
                   FROM (((data
                     LEFT JOIN policy.policies pp ON ((pp._id = data.policy_id)))
                     LEFT JOIN territory.territories tt ON ((pp.territory_id = tt._id)))
                     LEFT JOIN company.companies cc ON ((cc._id = tt.company_id)))
                )
         SELECT array_agg(incentive.value) AS incentive_raw,
            sum(incentive.amount) AS incentive_sum,
            array_agg(incentive.policy_id) AS policy_id
           FROM incentive) pip,
    LATERAL ( WITH data AS (
                 SELECT pi.policy_id,
                    sum(pi.amount) AS amount
                   FROM policy.incentives pi
                  WHERE ((pi.carpool_id = cpd._id) AND (pi.status = 'validated'::policy.incentive_status_enum))
                  GROUP BY pi.policy_id
                ), incentive AS (
                 SELECT data.policy_id,
                    ROW(cc.siret, (data.amount)::integer, (pp.unit)::character varying, data.policy_id, 'incentive'::character varying)::trip.incentive AS value,
                    data.amount
                   FROM (((data
                     LEFT JOIN policy.policies pp ON ((pp._id = data.policy_id)))
                     LEFT JOIN territory.territories tt ON ((pp.territory_id = tt._id)))
                     LEFT JOIN company.companies cc ON ((cc._id = tt.company_id)))
                )
         SELECT array_agg(incentive.value) AS incentive_raw,
            sum(incentive.amount) AS incentive_sum,
            array_agg(incentive.policy_id) AS policy_id
           FROM incentive) pid,
    LATERAL ( SELECT array_agg((json_array_elements.value)::trip.incentive) AS incentive
           FROM json_array_elements((cpp.meta -> 'payments'::text)) json_array_elements(value)) cpip,
    LATERAL ( SELECT array_agg((json_array_elements.value)::trip.incentive) AS incentive
           FROM json_array_elements((cpd.meta -> 'payments'::text)) json_array_elements(value)) cpid
  WHERE ((cpp.is_driver = false) AND (cpp.status = 'ok'::carpool.carpool_status_enum));


ALTER TABLE trip.list_view OWNER TO postgres;

--
-- Name: stat_cache; Type: TABLE; Schema: trip; Owner: postgres
--

CREATE TABLE trip.stat_cache (
    hash character varying(32) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    data json NOT NULL
);


ALTER TABLE trip.stat_cache OWNER TO postgres;

--
-- Name: acquisitions _id; Type: DEFAULT; Schema: acquisition; Owner: postgres
--

ALTER TABLE ONLY acquisition.acquisitions ALTER COLUMN _id SET DEFAULT nextval('acquisition.acquisitions__id_seq'::regclass);


--
-- Name: errors _id; Type: DEFAULT; Schema: acquisition; Owner: postgres
--

ALTER TABLE ONLY acquisition.errors ALTER COLUMN _id SET DEFAULT nextval('acquisition.errors__id_seq'::regclass);


--
-- Name: applications _id; Type: DEFAULT; Schema: application; Owner: postgres
--

ALTER TABLE ONLY application.applications ALTER COLUMN _id SET DEFAULT nextval('application.applications_new__id_seq'::regclass);


--
-- Name: users _id; Type: DEFAULT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users ALTER COLUMN _id SET DEFAULT nextval('auth.users__id_seq'::regclass);


--
-- Name: carpools _id; Type: DEFAULT; Schema: carpool; Owner: postgres
--

ALTER TABLE ONLY carpool.carpools ALTER COLUMN _id SET DEFAULT nextval('carpool.carpools__id_seq'::regclass);


--
-- Name: identities _id; Type: DEFAULT; Schema: carpool; Owner: postgres
--

ALTER TABLE ONLY carpool.identities ALTER COLUMN _id SET DEFAULT nextval('carpool.identities__id_seq'::regclass);


--
-- Name: access_log _id; Type: DEFAULT; Schema: certificate; Owner: postgres
--

ALTER TABLE ONLY certificate.access_log ALTER COLUMN _id SET DEFAULT nextval('certificate.access_log__id_seq'::regclass);


--
-- Name: certificates _id; Type: DEFAULT; Schema: certificate; Owner: postgres
--

ALTER TABLE ONLY certificate.certificates ALTER COLUMN _id SET DEFAULT nextval('certificate.certificates__id_seq'::regclass);


--
-- Name: companies _id; Type: DEFAULT; Schema: company; Owner: postgres
--

ALTER TABLE ONLY company.companies ALTER COLUMN _id SET DEFAULT nextval('company.companies__id_seq'::regclass);


--
-- Name: fraudchecks _id; Type: DEFAULT; Schema: fraudcheck; Owner: postgres
--

ALTER TABLE ONLY fraudcheck.fraudchecks ALTER COLUMN _id SET DEFAULT nextval('fraudcheck.fraudchecks__id_seq1'::regclass);


--
-- Name: operators _id; Type: DEFAULT; Schema: operator; Owner: postgres
--

ALTER TABLE ONLY operator.operators ALTER COLUMN _id SET DEFAULT nextval('operator.operators__id_seq'::regclass);


--
-- Name: payments _id; Type: DEFAULT; Schema: payment; Owner: postgres
--

ALTER TABLE ONLY payment.payments ALTER COLUMN _id SET DEFAULT nextval('payment.payments__id_seq'::regclass);


--
-- Name: incentives _id; Type: DEFAULT; Schema: policy; Owner: postgres
--

ALTER TABLE ONLY policy.incentives ALTER COLUMN _id SET DEFAULT nextval('policy.incentives__id_seq'::regclass);


--
-- Name: policies _id; Type: DEFAULT; Schema: policy; Owner: postgres
--

ALTER TABLE ONLY policy.policies ALTER COLUMN _id SET DEFAULT nextval('policy.policies__id_seq'::regclass);


--
-- Name: policy_metas _id; Type: DEFAULT; Schema: policy; Owner: postgres
--

ALTER TABLE ONLY policy.policy_metas ALTER COLUMN _id SET DEFAULT nextval('policy.policy_metas__id_seq'::regclass);


--
-- Name: mapids _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapids ALTER COLUMN _id SET DEFAULT nextval('public.mapids__id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: territories _id; Type: DEFAULT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories ALTER COLUMN _id SET DEFAULT nextval('territory.territories__id_seq1'::regclass);


--
-- Name: territory_codes _id; Type: DEFAULT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_codes ALTER COLUMN _id SET DEFAULT nextval('territory.territory_codes__id_seq'::regclass);


--
-- Name: territory_relation _id; Type: DEFAULT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_relation ALTER COLUMN _id SET DEFAULT nextval('territory.territory_relation__id_seq'::regclass);


--
-- Name: acquisitions acquisitions_pkey; Type: CONSTRAINT; Schema: acquisition; Owner: postgres
--

ALTER TABLE ONLY acquisition.acquisitions
    ADD CONSTRAINT acquisitions_pkey PRIMARY KEY (_id);


--
-- Name: errors errors_pkey; Type: CONSTRAINT; Schema: acquisition; Owner: postgres
--

ALTER TABLE ONLY acquisition.errors
    ADD CONSTRAINT errors_pkey PRIMARY KEY (_id);


--
-- Name: applications applications_new_pkey; Type: CONSTRAINT; Schema: application; Owner: postgres
--

ALTER TABLE ONLY application.applications
    ADD CONSTRAINT applications_new_pkey PRIMARY KEY (_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (_id);


--
-- Name: carpools carpools_pkey; Type: CONSTRAINT; Schema: carpool; Owner: postgres
--

ALTER TABLE ONLY carpool.carpools
    ADD CONSTRAINT carpools_pkey PRIMARY KEY (_id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: carpool; Owner: postgres
--

ALTER TABLE ONLY carpool.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (_id);


--
-- Name: access_log access_log_pkey; Type: CONSTRAINT; Schema: certificate; Owner: postgres
--

ALTER TABLE ONLY certificate.access_log
    ADD CONSTRAINT access_log_pkey PRIMARY KEY (_id);


--
-- Name: certificates certificates_new_pkey; Type: CONSTRAINT; Schema: certificate; Owner: postgres
--

ALTER TABLE ONLY certificate.certificates
    ADD CONSTRAINT certificates_new_pkey PRIMARY KEY (_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: common; Owner: postgres
--

ALTER TABLE ONLY common.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (slug);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: company; Owner: postgres
--

ALTER TABLE ONLY company.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (_id);


--
-- Name: fraudchecks fraudchecks_pkey1; Type: CONSTRAINT; Schema: fraudcheck; Owner: postgres
--

ALTER TABLE ONLY fraudcheck.fraudchecks
    ADD CONSTRAINT fraudchecks_pkey1 PRIMARY KEY (_id);


--
-- Name: operators operators_pkey; Type: CONSTRAINT; Schema: operator; Owner: postgres
--

ALTER TABLE ONLY operator.operators
    ADD CONSTRAINT operators_pkey PRIMARY KEY (_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: payment; Owner: postgres
--

ALTER TABLE ONLY payment.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (_id);


--
-- Name: incentives incentives_pkey; Type: CONSTRAINT; Schema: policy; Owner: postgres
--

ALTER TABLE ONLY policy.incentives
    ADD CONSTRAINT incentives_pkey PRIMARY KEY (_id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: policy; Owner: postgres
--

ALTER TABLE ONLY policy.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (_id);


--
-- Name: policy_metas policy_metas_pkey; Type: CONSTRAINT; Schema: policy; Owner: postgres
--

ALTER TABLE ONLY policy.policy_metas
    ADD CONSTRAINT policy_metas_pkey PRIMARY KEY (_id);


--
-- Name: mapids mapids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapids
    ADD CONSTRAINT mapids_pkey PRIMARY KEY (_id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: insee insee_pkey; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.insee
    ADD CONSTRAINT insee_pkey PRIMARY KEY (_id);


--
-- Name: territories territories_pkey1; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_pkey1 PRIMARY KEY (_id);


--
-- Name: territory_codes territory_codes_pkey; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_pkey PRIMARY KEY (_id);


--
-- Name: territory_codes territory_codes_territory_id_type_value_key; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_territory_id_type_value_key UNIQUE (territory_id, type, value);


--
-- Name: territory_relation territory_relation_parent_territory_id_child_territory_id_key; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_parent_territory_id_child_territory_id_key UNIQUE (parent_territory_id, child_territory_id);


--
-- Name: territory_relation territory_relation_pkey; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_pkey PRIMARY KEY (_id);


--
-- Name: stat_cache stat_cache_pkey; Type: CONSTRAINT; Schema: trip; Owner: postgres
--

ALTER TABLE ONLY trip.stat_cache
    ADD CONSTRAINT stat_cache_pkey PRIMARY KEY (hash);


--
-- Name: acquisitions_application_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_application_id_idx ON acquisition.acquisitions USING btree (application_id);


--
-- Name: acquisitions_journey_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_journey_id_idx ON acquisition.acquisitions USING btree (journey_id);


--
-- Name: acquisitions_operator_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_operator_id_idx ON acquisition.acquisitions USING btree (operator_id);


--
-- Name: acquisitions_operator_id_journey_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE UNIQUE INDEX acquisitions_operator_id_journey_id_idx ON acquisition.acquisitions USING btree (operator_id, journey_id);


--
-- Name: errors_journey_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX errors_journey_id_idx ON acquisition.errors USING btree (journey_id);


--
-- Name: errors_operator_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX errors_operator_id_idx ON acquisition.errors USING btree (operator_id);


--
-- Name: errors_request_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX errors_request_id_idx ON acquisition.errors USING btree (request_id);


--
-- Name: applications_owner_service_owner_id_idx; Type: INDEX; Schema: application; Owner: postgres
--

CREATE INDEX applications_owner_service_owner_id_idx ON application.applications USING btree (owner_service, owner_id);


--
-- Name: applications_uuid_idx; Type: INDEX; Schema: application; Owner: postgres
--

CREATE UNIQUE INDEX applications_uuid_idx ON application.applications USING btree (uuid);


--
-- Name: users_email_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX users_email_idx ON auth.users USING btree (email);


--
-- Name: carpools_acquisition_id_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_acquisition_id_idx ON carpool.carpools USING btree (acquisition_id);


--
-- Name: carpools_acquisition_id_idx1; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_acquisition_id_idx1 ON carpool.carpools USING btree (acquisition_id);


--
-- Name: carpools_acquisition_id_is_driver_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE UNIQUE INDEX carpools_acquisition_id_is_driver_idx ON carpool.carpools USING btree (acquisition_id, is_driver);


--
-- Name: carpools_datetime_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_datetime_idx ON carpool.carpools USING btree (datetime);


--
-- Name: carpools_distance_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_distance_idx ON carpool.carpools USING btree (distance);


--
-- Name: carpools_identity_id_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_identity_id_idx ON carpool.carpools USING btree (identity_id);


--
-- Name: carpools_operator_class_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_operator_class_idx ON carpool.carpools USING btree (operator_class);


--
-- Name: carpools_operator_id_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_operator_id_idx ON carpool.carpools USING btree (operator_id);


--
-- Name: carpools_operator_trip_id_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_operator_trip_id_idx ON carpool.carpools USING btree (operator_trip_id);


--
-- Name: carpools_trip_id_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_trip_id_idx ON carpool.carpools USING btree (trip_id);


--
-- Name: identities_phone_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX identities_phone_idx ON carpool.identities USING btree (phone);


--
-- Name: identities_phone_trunc_operator_user_id_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX identities_phone_trunc_operator_user_id_idx ON carpool.identities USING btree (phone_trunc, operator_user_id);


--
-- Name: identities_uuid_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX identities_uuid_idx ON carpool.identities USING btree (uuid);


--
-- Name: access_log_certificate_id_idx; Type: INDEX; Schema: certificate; Owner: postgres
--

CREATE INDEX access_log_certificate_id_idx ON certificate.access_log USING btree (certificate_id);


--
-- Name: certificates_identity_id_operator_id_idx; Type: INDEX; Schema: certificate; Owner: postgres
--

CREATE INDEX certificates_identity_id_operator_id_idx ON certificate.certificates_old USING btree (identity_id, operator_id);


--
-- Name: certificates_new_identity_uuid_operator_id_idx; Type: INDEX; Schema: certificate; Owner: postgres
--

CREATE INDEX certificates_new_identity_uuid_operator_id_idx ON certificate.certificates USING btree (identity_uuid, operator_id);


--
-- Name: certificates_new_uuid_idx; Type: INDEX; Schema: certificate; Owner: postgres
--

CREATE UNIQUE INDEX certificates_new_uuid_idx ON certificate.certificates USING btree (uuid);


--
-- Name: certificates_uuid_idx1; Type: INDEX; Schema: certificate; Owner: postgres
--

CREATE UNIQUE INDEX certificates_uuid_idx1 ON certificate.certificates_old USING btree (uuid);


--
-- Name: companies_siren_idx; Type: INDEX; Schema: company; Owner: postgres
--

CREATE INDEX companies_siren_idx ON company.companies USING btree (siren);


--
-- Name: companies_siret_idx; Type: INDEX; Schema: company; Owner: postgres
--

CREATE UNIQUE INDEX companies_siret_idx ON company.companies USING btree (siret);


--
-- Name: fraudchecks_acquisition_id_idx1; Type: INDEX; Schema: fraudcheck; Owner: postgres
--

CREATE UNIQUE INDEX fraudchecks_acquisition_id_idx1 ON fraudcheck.fraudchecks USING btree (acquisition_id);


--
-- Name: fraudchecks_status_idx1; Type: INDEX; Schema: fraudcheck; Owner: postgres
--

CREATE INDEX fraudchecks_status_idx1 ON fraudcheck.fraudchecks USING btree (status);


--
-- Name: processable_carpool_acquisition_id_idx; Type: INDEX; Schema: fraudcheck; Owner: postgres
--

CREATE UNIQUE INDEX processable_carpool_acquisition_id_idx ON fraudcheck.processable_carpool USING btree (acquisition_id);


--
-- Name: operators_siret_idx; Type: INDEX; Schema: operator; Owner: postgres
--

CREATE INDEX operators_siret_idx ON operator.operators USING btree (siret);


--
-- Name: operators_uuid_idx; Type: INDEX; Schema: operator; Owner: postgres
--

CREATE INDEX operators_uuid_idx ON operator.operators USING btree (uuid);


--
-- Name: payments_carpool_id_idx; Type: INDEX; Schema: payment; Owner: postgres
--

CREATE INDEX payments_carpool_id_idx ON payment.payments USING btree (carpool_id);


--
-- Name: payments_siret_idx; Type: INDEX; Schema: payment; Owner: postgres
--

CREATE INDEX payments_siret_idx ON payment.payments USING btree (siret);


--
-- Name: payments_status_idx; Type: INDEX; Schema: payment; Owner: postgres
--

CREATE INDEX payments_status_idx ON payment.payments USING btree (status);


--
-- Name: payments_type_idx; Type: INDEX; Schema: payment; Owner: postgres
--

CREATE INDEX payments_type_idx ON payment.payments USING btree (type);


--
-- Name: incentives_carpool_id_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX incentives_carpool_id_idx ON policy.incentives USING btree (carpool_id);


--
-- Name: incentives_datetime_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX incentives_datetime_idx ON policy.incentives USING btree (datetime);


--
-- Name: incentives_policy_id_carpool_id_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE UNIQUE INDEX incentives_policy_id_carpool_id_idx ON policy.incentives USING btree (policy_id, carpool_id);


--
-- Name: incentives_policy_id_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX incentives_policy_id_idx ON policy.incentives USING btree (policy_id);


--
-- Name: incentives_state_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX incentives_state_idx ON policy.incentives USING btree (state);


--
-- Name: incentives_status_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX incentives_status_idx ON policy.incentives USING btree (status);


--
-- Name: policies_slug_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE UNIQUE INDEX policies_slug_idx ON policy.policies USING btree (slug);


--
-- Name: policies_territory_id_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX policies_territory_id_idx ON policy.policies USING btree (territory_id);


--
-- Name: policy_meta_unique_key; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE UNIQUE INDEX policy_meta_unique_key ON policy.policy_metas USING btree (policy_id, key);


--
-- Name: policy_metas_policy_id_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX policy_metas_policy_id_idx ON policy.policy_metas USING btree (policy_id);


--
-- Name: trips_applicable_policies_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX trips_applicable_policies_idx ON policy.trips USING btree (applicable_policies);


--
-- Name: trips_carpool_id_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE UNIQUE INDEX trips_carpool_id_idx ON policy.trips USING btree (carpool_id);


--
-- Name: trips_datetime_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX trips_datetime_idx ON policy.trips USING btree (datetime);


--
-- Name: trips_processable_policies_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX trips_processable_policies_idx ON policy.trips USING btree (processable_policies);


--
-- Name: trips_trip_id_idx; Type: INDEX; Schema: policy; Owner: postgres
--

CREATE INDEX trips_trip_id_idx ON policy.trips USING btree (trip_id);


--
-- Name: acq_acquisition_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX acq_acquisition_id_idx ON public.acquisition_meta USING btree (acquisition_id);


--
-- Name: mapids_all_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mapids_all_idx ON public.mapids USING btree (collection, object_id, pg_id);


--
-- Name: insee_territory_id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX insee_territory_id_idx ON territory.insee USING btree (territory_id);


--
-- Name: territories__id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territories__id_idx ON territory.territories USING btree (_id);


--
-- Name: territories_geo_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territories_geo_idx ON territory.territories USING gist (geo);


--
-- Name: territory_codes_territory_id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territory_codes_territory_id_idx ON territory.territory_codes USING btree (territory_id);


--
-- Name: territory_codes_type_value_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territory_codes_type_value_idx ON territory.territory_codes USING btree (type, value);


--
-- Name: territory_operators_operator_id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territory_operators_operator_id_idx ON territory.territory_operators USING btree (operator_id);


--
-- Name: territory_operators_territory_id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territory_operators_territory_id_idx ON territory.territory_operators USING btree (territory_id);


--
-- Name: territory_operators_territory_id_operator_id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE UNIQUE INDEX territory_operators_territory_id_operator_id_idx ON territory.territory_operators USING btree (territory_id, operator_id);


--
-- Name: territory_relation_child_territory_id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territory_relation_child_territory_id_idx ON territory.territory_relation USING btree (child_territory_id);


--
-- Name: territory_relation_parent_territory_id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territory_relation_parent_territory_id_idx ON territory.territory_relation USING btree (parent_territory_id);


--
-- Name: list_applied_policies_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_applied_policies_idx ON trip.list USING btree (applied_policies);


--
-- Name: list_end_territory_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_end_territory_id_idx ON trip.list USING btree (end_territory_id);


--
-- Name: list_journey_distance_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_journey_distance_idx ON trip.list USING btree (journey_distance);


--
-- Name: list_journey_distance_idx1; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_journey_distance_idx1 ON trip.list USING btree (journey_distance);


--
-- Name: list_journey_start_datetime_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_journey_start_datetime_idx ON trip.list USING btree (journey_start_datetime);


--
-- Name: list_journey_start_dayhour_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_journey_start_dayhour_idx ON trip.list USING btree (journey_start_dayhour);


--
-- Name: list_journey_start_weekday_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_journey_start_weekday_idx ON trip.list USING btree (journey_start_weekday);


--
-- Name: list_operator_class_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_operator_class_idx ON trip.list USING btree (operator_class);


--
-- Name: list_operator_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_operator_id_idx ON trip.list USING btree (operator_id);


--
-- Name: list_start_territory_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_start_territory_id_idx ON trip.list USING btree (start_territory_id);


--
-- Name: trip_list_journey_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE UNIQUE INDEX trip_list_journey_id_idx ON trip.list USING btree (journey_id);


--
-- Name: users touch_users_updated_at; Type: TRIGGER; Schema: auth; Owner: postgres
--

CREATE TRIGGER touch_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: carpools hydrate_trip_from_carpool; Type: TRIGGER; Schema: carpool; Owner: postgres
--

CREATE TRIGGER hydrate_trip_from_carpool AFTER INSERT OR UPDATE ON carpool.carpools FOR EACH ROW EXECUTE FUNCTION public.hydrate_trip_from_carpool();


--
-- Name: identities touch_identities_updated_at; Type: TRIGGER; Schema: carpool; Owner: postgres
--

CREATE TRIGGER touch_identities_updated_at BEFORE UPDATE ON carpool.identities FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: certificates touch_certificates_updated_at; Type: TRIGGER; Schema: certificate; Owner: postgres
--

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: certificates_old touch_certificates_updated_at; Type: TRIGGER; Schema: certificate; Owner: postgres
--

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates_old FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: fraudchecks touch_fraudchecks_updated_at; Type: TRIGGER; Schema: fraudcheck; Owner: postgres
--

CREATE TRIGGER touch_fraudchecks_updated_at BEFORE UPDATE ON fraudcheck.fraudchecks FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: operators touch_operators_updated_at; Type: TRIGGER; Schema: operator; Owner: postgres
--

CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: incentives hydrate_trip_from_policy; Type: TRIGGER; Schema: policy; Owner: postgres
--

CREATE TRIGGER hydrate_trip_from_policy AFTER INSERT OR UPDATE ON policy.incentives FOR EACH ROW EXECUTE FUNCTION public.hydrate_trip_from_policy();


--
-- Name: policies touch_policies_updated_at; Type: TRIGGER; Schema: policy; Owner: postgres
--

CREATE TRIGGER touch_policies_updated_at BEFORE UPDATE ON policy.policies FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: policy_metas touch_policy_meta_updated_at; Type: TRIGGER; Schema: policy; Owner: postgres
--

CREATE TRIGGER touch_policy_meta_updated_at BEFORE UPDATE ON policy.policy_metas FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: territories touch_territories_updated_at; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: territories territories_company_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_company_id_fkey FOREIGN KEY (company_id) REFERENCES company.companies(_id) ON DELETE SET NULL;


--
-- Name: territory_codes territory_codes_territory_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_territory_id_fkey FOREIGN KEY (territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;


--
-- Name: territory_relation territory_relation_child_territory_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_child_territory_id_fkey FOREIGN KEY (child_territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;


--
-- Name: territory_relation territory_relation_parent_territory_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_parent_territory_id_fkey FOREIGN KEY (parent_territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

