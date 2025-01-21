--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Debian 14.13-1.pgdg110+1)
-- Dumped by pg_dump version 14.15

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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

--
-- Name: application; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA application;


--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: carpool_v2; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA carpool_v2;


--
-- Name: certificate; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA certificate;


--
-- Name: common; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA common;


--
-- Name: company; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA company;


--
-- Name: export; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA export;


--
-- Name: honor; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA honor;


--
-- Name: operator; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA operator;


--
-- Name: policy; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA policy;


--
-- Name: territory; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA territory;


--
-- Name: user_status_enum; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.user_status_enum AS ENUM (
    'pending',
    'active',
    'invited',
    'blocked'
);


--
-- Name: carpool_acquisition_status_enum; Type: TYPE; Schema: carpool_v2; Owner: -
--

CREATE TYPE carpool_v2.carpool_acquisition_status_enum AS ENUM (
    'received',
    'updated',
    'processed',
    'failed',
    'canceled',
    'expired',
    'terms_violation_error'
);


--
-- Name: carpool_anomaly_status_enum; Type: TYPE; Schema: carpool_v2; Owner: -
--

CREATE TYPE carpool_v2.carpool_anomaly_status_enum AS ENUM (
    'pending',
    'passed',
    'failed'
);


--
-- Name: carpool_fraud_status_enum; Type: TYPE; Schema: carpool_v2; Owner: -
--

CREATE TYPE carpool_v2.carpool_fraud_status_enum AS ENUM (
    'pending',
    'passed',
    'failed'
);


--
-- Name: incentive_state_enum; Type: TYPE; Schema: policy; Owner: -
--

CREATE TYPE policy.incentive_state_enum AS ENUM (
    'regular',
    'null',
    'disabled'
);


--
-- Name: incentive_status_enum; Type: TYPE; Schema: policy; Owner: -
--

CREATE TYPE policy.incentive_status_enum AS ENUM (
    'draft',
    'pending',
    'validated',
    'warning',
    'error'
);


--
-- Name: policy_status_enum; Type: TYPE; Schema: policy; Owner: -
--

CREATE TYPE policy.policy_status_enum AS ENUM (
    'template',
    'draft',
    'active',
    'finished'
);


--
-- Name: policy_unit_enum; Type: TYPE; Schema: policy; Owner: -
--

CREATE TYPE policy.policy_unit_enum AS ENUM (
    'euro',
    'point'
);


--
-- Name: breadcrumb; Type: TYPE; Schema: territory; Owner: -
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


--
-- Name: codes; Type: TYPE; Schema: territory; Owner: -
--

CREATE TYPE territory.codes AS (
	insee character varying[],
	postcode character varying[],
	codedep character varying[]
);


--
-- Name: territory_level_enum; Type: TYPE; Schema: territory; Owner: -
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


--
-- Name: view; Type: TYPE; Schema: territory; Owner: -
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


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: common; Owner: -
--

CREATE OR REPLACE FUNCTION common.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: get_ancestors(integer[]); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_ancestors(ids integer[]) RETURNS integer[]
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


--
-- Name: get_breadcrumb(integer, integer[]); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_breadcrumb(target_id integer, ancestors_ids integer[]) RETURNS territory.breadcrumb
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


--
-- Name: get_codes(integer, integer[]); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_codes(target_id integer, descendants_ids integer[]) RETURNS territory.codes
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


--
-- Name: get_com_by_territory_id(integer, smallint); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_com_by_territory_id(_id integer, year smallint) RETURNS TABLE(com character varying)
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


--
-- Name: get_data(integer[]); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_data(ids integer[]) RETURNS SETOF territory.view
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


--
-- Name: get_descendants(integer[]); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_descendants(ids integer[]) RETURNS integer[]
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


--
-- Name: get_relations(integer[]); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_relations(ids integer[]) RETURNS integer[]
    LANGUAGE sql STABLE
    AS $$
  WITH data AS (
    SELECT * FROM unnest(territory.get_descendants(ids)) as _id
    UNION
    SELECT * FROM unnest(territory.get_ancestors(ids)) as _id
  ) SELECT array_agg(distinct _id) from data;
$$;


--
-- Name: get_selector_by_territory_id(integer[]); Type: FUNCTION; Schema: territory; Owner: -
--

CREATE OR REPLACE FUNCTION territory.get_selector_by_territory_id(_id integer[]) RETURNS TABLE(territory_id integer, selector json)
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

--
-- Name: applications; Type: TABLE; Schema: application; Owner: -
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


--
-- Name: applications_new__id_seq; Type: SEQUENCE; Schema: application; Owner: -
--

CREATE SEQUENCE application.applications_new__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_new__id_seq; Type: SEQUENCE OWNED BY; Schema: application; Owner: -
--

ALTER SEQUENCE application.applications_new__id_seq OWNED BY application.applications._id;


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
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
    last_login_at timestamp with time zone DEFAULT now() NOT NULL,
    hidden boolean DEFAULT false
);


--
-- Name: users__id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.users__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users__id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.users__id_seq OWNED BY auth.users._id;


--
-- Name: carpools_legacy_id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.carpools_legacy_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carpools; Type: TABLE; Schema: carpool_v2; Owner: -
--

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


--
-- Name: carpools__id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.carpools__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carpools__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool_v2; Owner: -
--

ALTER SEQUENCE carpool_v2.carpools__id_seq OWNED BY carpool_v2.carpools._id;


--
-- Name: geo; Type: TABLE; Schema: carpool_v2; Owner: -
--

CREATE TABLE carpool_v2.geo (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_geo_code character varying(5),
    end_geo_code character varying(5),
    errors jsonb
);


--
-- Name: geo__id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.geo__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: geo__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool_v2; Owner: -
--

ALTER SEQUENCE carpool_v2.geo__id_seq OWNED BY carpool_v2.geo._id;


--
-- Name: operator_incentive_counterparts; Type: TABLE; Schema: carpool_v2; Owner: -
--

CREATE TABLE carpool_v2.operator_incentive_counterparts (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    target_is_driver boolean NOT NULL,
    siret character varying(14) NOT NULL,
    amount integer NOT NULL
);


--
-- Name: operator_incentive_counterparts__id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.operator_incentive_counterparts__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: operator_incentive_counterparts__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool_v2; Owner: -
--

ALTER SEQUENCE carpool_v2.operator_incentive_counterparts__id_seq OWNED BY carpool_v2.operator_incentive_counterparts._id;


--
-- Name: operator_incentives; Type: TABLE; Schema: carpool_v2; Owner: -
--

CREATE TABLE carpool_v2.operator_incentives (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    idx smallint NOT NULL,
    siret character varying(14) NOT NULL,
    amount integer NOT NULL
);


--
-- Name: operator_incentives__id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.operator_incentives__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: operator_incentives__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool_v2; Owner: -
--

ALTER SEQUENCE carpool_v2.operator_incentives__id_seq OWNED BY carpool_v2.operator_incentives._id;


--
-- Name: requests; Type: TABLE; Schema: carpool_v2; Owner: -
--

CREATE TABLE carpool_v2.requests (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    operator_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_journey_id character varying NOT NULL,
    payload jsonb,
    api_version character varying NOT NULL,
    cancel_code character varying(32),
    cancel_message character varying(512)
);


--
-- Name: requests__id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.requests__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requests__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool_v2; Owner: -
--

ALTER SEQUENCE carpool_v2.requests__id_seq OWNED BY carpool_v2.requests._id;


--
-- Name: status; Type: TABLE; Schema: carpool_v2; Owner: -
--

CREATE TABLE carpool_v2.status (
    _id integer NOT NULL,
    carpool_id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    acquisition_status carpool_v2.carpool_acquisition_status_enum DEFAULT 'received'::carpool_v2.carpool_acquisition_status_enum NOT NULL,
    fraud_status carpool_v2.carpool_fraud_status_enum DEFAULT 'pending'::carpool_v2.carpool_fraud_status_enum NOT NULL,
    anomaly_status carpool_v2.carpool_anomaly_status_enum DEFAULT 'pending'::carpool_v2.carpool_anomaly_status_enum NOT NULL
);


--
-- Name: status__id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.status__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: status__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool_v2; Owner: -
--

ALTER SEQUENCE carpool_v2.status__id_seq OWNED BY carpool_v2.status._id;


--
-- Name: terms_violation_error_labels; Type: TABLE; Schema: carpool_v2; Owner: -
--

CREATE TABLE carpool_v2.terms_violation_error_labels (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    carpool_id integer NOT NULL,
    labels character varying[] NOT NULL
);


--
-- Name: terms_violation_error_labels__id_seq; Type: SEQUENCE; Schema: carpool_v2; Owner: -
--

CREATE SEQUENCE carpool_v2.terms_violation_error_labels__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: terms_violation_error_labels__id_seq; Type: SEQUENCE OWNED BY; Schema: carpool_v2; Owner: -
--

ALTER SEQUENCE carpool_v2.terms_violation_error_labels__id_seq OWNED BY carpool_v2.terms_violation_error_labels._id;


--
-- Name: access_log; Type: TABLE; Schema: certificate; Owner: -
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


--
-- Name: access_log__id_seq; Type: SEQUENCE; Schema: certificate; Owner: -
--

CREATE SEQUENCE certificate.access_log__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: access_log__id_seq; Type: SEQUENCE OWNED BY; Schema: certificate; Owner: -
--

ALTER SEQUENCE certificate.access_log__id_seq OWNED BY certificate.access_log._id;


--
-- Name: certificates; Type: TABLE; Schema: certificate; Owner: -
--

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


--
-- Name: certificates__id_seq; Type: SEQUENCE; Schema: certificate; Owner: -
--

CREATE SEQUENCE certificate.certificates__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificates__id_seq; Type: SEQUENCE OWNED BY; Schema: certificate; Owner: -
--

ALTER SEQUENCE certificate.certificates__id_seq OWNED BY certificate.certificates._id;


--
-- Name: certificates_new__id_seq; Type: SEQUENCE; Schema: certificate; Owner: -
--

CREATE SEQUENCE certificate.certificates_new__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificates_new__id_seq; Type: SEQUENCE OWNED BY; Schema: certificate; Owner: -
--

ALTER SEQUENCE certificate.certificates_new__id_seq OWNED BY certificate.certificates._id;


--
-- Name: companies; Type: TABLE; Schema: company; Owner: -
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


--
-- Name: companies__id_seq; Type: SEQUENCE; Schema: company; Owner: -
--

CREATE SEQUENCE company.companies__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies__id_seq; Type: SEQUENCE OWNED BY; Schema: company; Owner: -
--

ALTER SEQUENCE company.companies__id_seq OWNED BY company.companies._id;


--
-- Name: operators; Type: TABLE; Schema: operator; Owner: -
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    support character varying(256)
);


--
-- Name: incentives; Type: TABLE; Schema: policy; Owner: -
--

CREATE TABLE policy.incentives (
    _id integer NOT NULL,
    policy_id integer NOT NULL,
    status policy.incentive_status_enum NOT NULL,
    meta json,
    carpool_id integer,
    amount integer DEFAULT 0 NOT NULL,
    datetime timestamp with time zone NOT NULL,
    result integer DEFAULT 0 NOT NULL,
    state policy.incentive_state_enum DEFAULT 'regular'::policy.incentive_state_enum NOT NULL,
    operator_id integer,
    operator_journey_id character varying
);


--
-- Name: exports; Type: TABLE; Schema: export; Owner: -
--

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


--
-- Name: exports__id_seq; Type: SEQUENCE; Schema: export; Owner: -
--

CREATE SEQUENCE export.exports__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exports__id_seq; Type: SEQUENCE OWNED BY; Schema: export; Owner: -
--

ALTER SEQUENCE export.exports__id_seq OWNED BY export.exports._id;


--
-- Name: logs; Type: TABLE; Schema: export; Owner: -
--

CREATE TABLE export.logs (
    _id integer NOT NULL,
    export_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    type character varying(255) NOT NULL,
    message text NOT NULL
);


--
-- Name: logs__id_seq; Type: SEQUENCE; Schema: export; Owner: -
--

CREATE SEQUENCE export.logs__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs__id_seq; Type: SEQUENCE OWNED BY; Schema: export; Owner: -
--

ALTER SEQUENCE export.logs__id_seq OWNED BY export.logs._id;


--
-- Name: recipients; Type: TABLE; Schema: export; Owner: -
--

CREATE TABLE export.recipients (
    _id integer NOT NULL,
    export_id integer NOT NULL,
    scrambled_at timestamp with time zone,
    email character varying(255) NOT NULL,
    fullname character varying(255),
    message text
);


--
-- Name: recipients__id_seq; Type: SEQUENCE; Schema: export; Owner: -
--

CREATE SEQUENCE export.recipients__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipients__id_seq; Type: SEQUENCE OWNED BY; Schema: export; Owner: -
--

ALTER SEQUENCE export.recipients__id_seq OWNED BY export.recipients._id;


--
-- Name: territories; Type: TABLE; Schema: territory; Owner: -
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
    surface bigint,
    geo public.geography,
    ui_status json
);


--
-- Name: territory_group__id_seq; Type: SEQUENCE; Schema: territory; Owner: -
--

CREATE SEQUENCE territory.territory_group__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: territory_group; Type: TABLE; Schema: territory; Owner: -
--

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


--
-- Name: territory_group_selector; Type: TABLE; Schema: territory; Owner: -
--

CREATE TABLE territory.territory_group_selector (
    territory_group_id integer NOT NULL,
    selector_type character varying NOT NULL,
    selector_value character varying NOT NULL
);


--
-- Name: tracking; Type: TABLE; Schema: honor; Owner: -
--

CREATE TABLE honor.tracking (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type character varying(32) NOT NULL,
    employer character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: tracking__id_seq; Type: SEQUENCE; Schema: honor; Owner: -
--

CREATE SEQUENCE honor.tracking__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tracking__id_seq; Type: SEQUENCE OWNED BY; Schema: honor; Owner: -
--

ALTER SEQUENCE honor.tracking__id_seq OWNED BY honor.tracking._id;


--
-- Name: operators__id_seq; Type: SEQUENCE; Schema: operator; Owner: -
--

CREATE SEQUENCE operator.operators__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: operators__id_seq; Type: SEQUENCE OWNED BY; Schema: operator; Owner: -
--

ALTER SEQUENCE operator.operators__id_seq OWNED BY operator.operators._id;


--
-- Name: thumbnails; Type: TABLE; Schema: operator; Owner: -
--

CREATE TABLE operator.thumbnails (
    _id integer NOT NULL,
    operator_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data bytea NOT NULL
);


--
-- Name: thumbnails__id_seq; Type: SEQUENCE; Schema: operator; Owner: -
--

CREATE SEQUENCE operator.thumbnails__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: thumbnails__id_seq; Type: SEQUENCE OWNED BY; Schema: operator; Owner: -
--

ALTER SEQUENCE operator.thumbnails__id_seq OWNED BY operator.thumbnails._id;


--
-- Name: incentives__id_seq; Type: SEQUENCE; Schema: policy; Owner: -
--

CREATE SEQUENCE policy.incentives__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incentives__id_seq; Type: SEQUENCE OWNED BY; Schema: policy; Owner: -
--

ALTER SEQUENCE policy.incentives__id_seq OWNED BY policy.incentives._id;


--
-- Name: lock; Type: TABLE; Schema: policy; Owner: -
--

CREATE TABLE policy.lock (
    _id integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    stopped_at timestamp with time zone,
    success boolean,
    data json
);


--
-- Name: lock__id_seq; Type: SEQUENCE; Schema: policy; Owner: -
--

CREATE SEQUENCE policy.lock__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lock__id_seq; Type: SEQUENCE OWNED BY; Schema: policy; Owner: -
--

ALTER SEQUENCE policy.lock__id_seq OWNED BY policy.lock._id;


--
-- Name: policies; Type: TABLE; Schema: policy; Owner: -
--

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
    max_amount bigint DEFAULT 0 NOT NULL,
    tz character varying(64) DEFAULT 'Europe/Paris'::character varying NOT NULL
);


--
-- Name: policies__id_seq; Type: SEQUENCE; Schema: policy; Owner: -
--

CREATE SEQUENCE policy.policies__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: policies__id_seq; Type: SEQUENCE OWNED BY; Schema: policy; Owner: -
--

ALTER SEQUENCE policy.policies__id_seq OWNED BY policy.policies._id;


--
-- Name: policy_metas; Type: TABLE; Schema: policy; Owner: -
--

CREATE TABLE policy.policy_metas (
    _id integer NOT NULL,
    policy_id integer NOT NULL,
    key character varying DEFAULT 'default'::character varying NOT NULL,
    value integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    datetime timestamp without time zone
);


--
-- Name: policy_metas__id_seq; Type: SEQUENCE; Schema: policy; Owner: -
--

CREATE SEQUENCE policy.policy_metas__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: policy_metas__id_seq; Type: SEQUENCE OWNED BY; Schema: policy; Owner: -
--

ALTER SEQUENCE policy.policy_metas__id_seq OWNED BY policy.policy_metas._id;


--
-- Name: territory_codes; Type: TABLE; Schema: territory; Owner: -
--

CREATE TABLE territory.territory_codes (
    _id integer NOT NULL,
    territory_id integer NOT NULL,
    type character varying(10) NOT NULL,
    value character varying(64) NOT NULL
);


--
-- Name: territory_relation; Type: TABLE; Schema: territory; Owner: -
--

CREATE TABLE territory.territory_relation (
    _id integer NOT NULL,
    parent_territory_id integer NOT NULL,
    child_territory_id integer NOT NULL
);


--
-- Name: insee; Type: TABLE; Schema: territory; Owner: -
--

CREATE TABLE territory.insee (
    _id character varying NOT NULL,
    territory_id integer NOT NULL
);


--
-- Name: territories__id_seq1; Type: SEQUENCE; Schema: territory; Owner: -
--

CREATE SEQUENCE territory.territories__id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: territories__id_seq1; Type: SEQUENCE OWNED BY; Schema: territory; Owner: -
--

ALTER SEQUENCE territory.territories__id_seq1 OWNED BY territory.territories._id;


--
-- Name: territory_codes__id_seq; Type: SEQUENCE; Schema: territory; Owner: -
--

CREATE SEQUENCE territory.territory_codes__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: territory_codes__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: -
--

ALTER SEQUENCE territory.territory_codes__id_seq OWNED BY territory.territory_codes._id;


--
-- Name: territory_operators_legacy; Type: TABLE; Schema: territory; Owner: -
--

CREATE TABLE territory.territory_operators_legacy (
    territory_id integer NOT NULL,
    operator_id integer NOT NULL
);


--
-- Name: territory_relation__id_seq; Type: SEQUENCE; Schema: territory; Owner: -
--

CREATE SEQUENCE territory.territory_relation__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: territory_relation__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: -
--

ALTER SEQUENCE territory.territory_relation__id_seq OWNED BY territory.territory_relation._id;


--
-- Name: applications _id; Type: DEFAULT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.applications ALTER COLUMN _id SET DEFAULT nextval('application.applications_new__id_seq'::regclass);


--
-- Name: users _id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users ALTER COLUMN _id SET DEFAULT nextval('auth.users__id_seq'::regclass);


--
-- Name: carpools _id; Type: DEFAULT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.carpools ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.carpools__id_seq'::regclass);


--
-- Name: geo _id; Type: DEFAULT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.geo ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.geo__id_seq'::regclass);


--
-- Name: operator_incentive_counterparts _id; Type: DEFAULT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.operator_incentive_counterparts ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.operator_incentive_counterparts__id_seq'::regclass);


--
-- Name: operator_incentives _id; Type: DEFAULT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.operator_incentives ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.operator_incentives__id_seq'::regclass);


--
-- Name: requests _id; Type: DEFAULT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.requests ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.requests__id_seq'::regclass);


--
-- Name: status _id; Type: DEFAULT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.status ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.status__id_seq'::regclass);


--
-- Name: terms_violation_error_labels _id; Type: DEFAULT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.terms_violation_error_labels ALTER COLUMN _id SET DEFAULT nextval('carpool_v2.terms_violation_error_labels__id_seq'::regclass);


--
-- Name: access_log _id; Type: DEFAULT; Schema: certificate; Owner: -
--

ALTER TABLE ONLY certificate.access_log ALTER COLUMN _id SET DEFAULT nextval('certificate.access_log__id_seq'::regclass);


--
-- Name: certificates _id; Type: DEFAULT; Schema: certificate; Owner: -
--

ALTER TABLE ONLY certificate.certificates ALTER COLUMN _id SET DEFAULT nextval('certificate.certificates__id_seq'::regclass);


--
-- Name: companies _id; Type: DEFAULT; Schema: company; Owner: -
--

ALTER TABLE ONLY company.companies ALTER COLUMN _id SET DEFAULT nextval('company.companies__id_seq'::regclass);


--
-- Name: exports _id; Type: DEFAULT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.exports ALTER COLUMN _id SET DEFAULT nextval('export.exports__id_seq'::regclass);


--
-- Name: logs _id; Type: DEFAULT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.logs ALTER COLUMN _id SET DEFAULT nextval('export.logs__id_seq'::regclass);


--
-- Name: recipients _id; Type: DEFAULT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.recipients ALTER COLUMN _id SET DEFAULT nextval('export.recipients__id_seq'::regclass);


--
-- Name: tracking _id; Type: DEFAULT; Schema: honor; Owner: -
--

ALTER TABLE ONLY honor.tracking ALTER COLUMN _id SET DEFAULT nextval('honor.tracking__id_seq'::regclass);


--
-- Name: operators _id; Type: DEFAULT; Schema: operator; Owner: -
--

ALTER TABLE ONLY operator.operators ALTER COLUMN _id SET DEFAULT nextval('operator.operators__id_seq'::regclass);


--
-- Name: thumbnails _id; Type: DEFAULT; Schema: operator; Owner: -
--

ALTER TABLE ONLY operator.thumbnails ALTER COLUMN _id SET DEFAULT nextval('operator.thumbnails__id_seq'::regclass);


--
-- Name: incentives _id; Type: DEFAULT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.incentives ALTER COLUMN _id SET DEFAULT nextval('policy.incentives__id_seq'::regclass);


--
-- Name: lock _id; Type: DEFAULT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.lock ALTER COLUMN _id SET DEFAULT nextval('policy.lock__id_seq'::regclass);


--
-- Name: policies _id; Type: DEFAULT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.policies ALTER COLUMN _id SET DEFAULT nextval('policy.policies__id_seq'::regclass);


--
-- Name: policy_metas _id; Type: DEFAULT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.policy_metas ALTER COLUMN _id SET DEFAULT nextval('policy.policy_metas__id_seq'::regclass);


--
-- Name: territories _id; Type: DEFAULT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territories ALTER COLUMN _id SET DEFAULT nextval('territory.territories__id_seq1'::regclass);


--
-- Name: territory_codes _id; Type: DEFAULT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_codes ALTER COLUMN _id SET DEFAULT nextval('territory.territory_codes__id_seq'::regclass);


--
-- Name: territory_relation _id; Type: DEFAULT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_relation ALTER COLUMN _id SET DEFAULT nextval('territory.territory_relation__id_seq'::regclass);


--
-- Name: applications applications_new_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.applications
    ADD CONSTRAINT applications_new_pkey PRIMARY KEY (_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (_id);


--
-- Name: carpools carpools_pkey; Type: CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.carpools
    ADD CONSTRAINT carpools_pkey PRIMARY KEY (_id);


--
-- Name: geo geo_pkey; Type: CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.geo
    ADD CONSTRAINT geo_pkey PRIMARY KEY (_id);


--
-- Name: operator_incentive_counterparts operator_incentive_counterparts_pkey; Type: CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.operator_incentive_counterparts
    ADD CONSTRAINT operator_incentive_counterparts_pkey PRIMARY KEY (_id);


--
-- Name: operator_incentives operator_incentives_pkey; Type: CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.operator_incentives
    ADD CONSTRAINT operator_incentives_pkey PRIMARY KEY (_id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (_id);


--
-- Name: status status_pkey; Type: CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (_id);


--
-- Name: terms_violation_error_labels terms_violation_error_labels_pkey; Type: CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.terms_violation_error_labels
    ADD CONSTRAINT terms_violation_error_labels_pkey PRIMARY KEY (_id);


--
-- Name: access_log access_log_pkey; Type: CONSTRAINT; Schema: certificate; Owner: -
--

ALTER TABLE ONLY certificate.access_log
    ADD CONSTRAINT access_log_pkey PRIMARY KEY (_id);


--
-- Name: certificates certificates_new_pkey; Type: CONSTRAINT; Schema: certificate; Owner: -
--

ALTER TABLE ONLY certificate.certificates
    ADD CONSTRAINT certificates_new_pkey PRIMARY KEY (_id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: company; Owner: -
--

ALTER TABLE ONLY company.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (_id);


--
-- Name: exports exports_pkey; Type: CONSTRAINT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.exports
    ADD CONSTRAINT exports_pkey PRIMARY KEY (_id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (_id);


--
-- Name: recipients recipients_pkey; Type: CONSTRAINT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.recipients
    ADD CONSTRAINT recipients_pkey PRIMARY KEY (_id);


--
-- Name: tracking tracking_pkey; Type: CONSTRAINT; Schema: honor; Owner: -
--

ALTER TABLE ONLY honor.tracking
    ADD CONSTRAINT tracking_pkey PRIMARY KEY (_id);


--
-- Name: operators operators_pkey; Type: CONSTRAINT; Schema: operator; Owner: -
--

ALTER TABLE ONLY operator.operators
    ADD CONSTRAINT operators_pkey PRIMARY KEY (_id);


--
-- Name: thumbnails thumbnails_pkey; Type: CONSTRAINT; Schema: operator; Owner: -
--

ALTER TABLE ONLY operator.thumbnails
    ADD CONSTRAINT thumbnails_pkey PRIMARY KEY (_id);


--
-- Name: incentives incentives_pkey; Type: CONSTRAINT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.incentives
    ADD CONSTRAINT incentives_pkey PRIMARY KEY (_id);


--
-- Name: lock lock_pkey; Type: CONSTRAINT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.lock
    ADD CONSTRAINT lock_pkey PRIMARY KEY (_id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (_id);


--
-- Name: policy_metas policy_metas_pkey; Type: CONSTRAINT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.policy_metas
    ADD CONSTRAINT policy_metas_pkey PRIMARY KEY (_id);


--
-- Name: insee insee_pkey; Type: CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.insee
    ADD CONSTRAINT insee_pkey PRIMARY KEY (_id);


--
-- Name: territories territories_pkey1; Type: CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_pkey1 PRIMARY KEY (_id);


--
-- Name: territory_codes territory_codes_pkey; Type: CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_pkey PRIMARY KEY (_id);


--
-- Name: territory_codes territory_codes_territory_id_type_value_key; Type: CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_territory_id_type_value_key UNIQUE (territory_id, type, value);


--
-- Name: territory_group territory_group_pkey; Type: CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_group
    ADD CONSTRAINT territory_group_pkey PRIMARY KEY (_id);


--
-- Name: territory_relation territory_relation_parent_territory_id_child_territory_id_key; Type: CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_parent_territory_id_child_territory_id_key UNIQUE (parent_territory_id, child_territory_id);


--
-- Name: territory_relation territory_relation_pkey; Type: CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_pkey PRIMARY KEY (_id);


--
-- Name: applications_owner_service_owner_id_idx; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX applications_owner_service_owner_id_idx ON application.applications USING btree (owner_service, owner_id);


--
-- Name: applications_uuid_idx; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX applications_uuid_idx ON application.applications USING btree (uuid);


--
-- Name: users_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_idx ON auth.users USING btree (email);


--
-- Name: carpool_created_at_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_created_at_idx ON carpool_v2.carpools USING btree (created_at);


--
-- Name: carpool_driver_identity_key_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_driver_identity_key_idx ON carpool_v2.carpools USING btree (driver_identity_key);


--
-- Name: carpool_driver_operator_user_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_driver_operator_user_id_idx ON carpool_v2.carpools USING btree (driver_operator_user_id);


--
-- Name: carpool_driver_phone_trunc_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_driver_phone_trunc_idx ON carpool_v2.carpools USING btree (driver_phone_trunc);


--
-- Name: carpool_geo_carpool_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE UNIQUE INDEX carpool_geo_carpool_id_idx ON carpool_v2.geo USING btree (carpool_id);


--
-- Name: carpool_geo_end_geo_code; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_geo_end_geo_code ON carpool_v2.geo USING btree (end_geo_code);


--
-- Name: carpool_geo_start_geo_code; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_geo_start_geo_code ON carpool_v2.geo USING btree (start_geo_code);


--
-- Name: carpool_incentives_carpool_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE UNIQUE INDEX carpool_incentives_carpool_id_idx ON carpool_v2.operator_incentives USING btree (carpool_id, idx);


--
-- Name: carpool_incentives_siret_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_incentives_siret_idx ON carpool_v2.operator_incentives USING btree (siret);


--
-- Name: carpool_legacy_id; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_legacy_id ON carpool_v2.carpools USING btree (legacy_id) WITH (deduplicate_items='true');


--
-- Name: carpool_operator_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_operator_id_idx ON carpool_v2.carpools USING btree (operator_id);


--
-- Name: carpool_operator_journey_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_operator_journey_id_idx ON carpool_v2.carpools USING btree (operator_journey_id);


--
-- Name: carpool_operator_operator_journey_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE UNIQUE INDEX carpool_operator_operator_journey_id_idx ON carpool_v2.carpools USING btree (operator_id, operator_journey_id);


--
-- Name: carpool_passenger_identity_key_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_passenger_identity_key_idx ON carpool_v2.carpools USING btree (passenger_identity_key);


--
-- Name: carpool_passenger_operator_user_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_passenger_operator_user_id_idx ON carpool_v2.carpools USING btree (passenger_operator_user_id);


--
-- Name: carpool_passenger_phone_trunc_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_passenger_phone_trunc_idx ON carpool_v2.carpools USING btree (passenger_phone_trunc);


--
-- Name: carpool_requests_carpool_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_requests_carpool_id_idx ON carpool_v2.requests USING btree (carpool_id);


--
-- Name: carpool_start_datetime_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_start_datetime_idx ON carpool_v2.carpools USING btree (start_datetime);


--
-- Name: carpool_status_acquisition_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_status_acquisition_idx ON carpool_v2.status USING btree (acquisition_status);


--
-- Name: carpool_status_anomaly_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_status_anomaly_idx ON carpool_v2.status USING btree (anomaly_status);


--
-- Name: carpool_status_carpool_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE UNIQUE INDEX carpool_status_carpool_id_idx ON carpool_v2.status USING btree (carpool_id);


--
-- Name: carpool_status_fraud_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpool_status_fraud_idx ON carpool_v2.status USING btree (fraud_status);


--
-- Name: carpool_terms_violation_error_labels_carpool_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE UNIQUE INDEX carpool_terms_violation_error_labels_carpool_id_idx ON carpool_v2.terms_violation_error_labels USING btree (carpool_id);


--
-- Name: carpool_v2_carpools_uuid_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE UNIQUE INDEX carpool_v2_carpools_uuid_idx ON carpool_v2.carpools USING btree (uuid);


--
-- Name: carpools_end_datetime_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpools_end_datetime_idx ON carpool_v2.carpools USING btree (end_datetime);


--
-- Name: carpools_operator_trip_id_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX carpools_operator_trip_id_idx ON carpool_v2.carpools USING btree (operator_trip_id);


--
-- Name: created_at_idx; Type: INDEX; Schema: carpool_v2; Owner: -
--

CREATE INDEX created_at_idx ON carpool_v2.requests USING btree (created_at) INCLUDE (created_at) WITH (deduplicate_items='true');


--
-- Name: access_log_certificate_id_idx; Type: INDEX; Schema: certificate; Owner: -
--

CREATE INDEX access_log_certificate_id_idx ON certificate.access_log USING btree (certificate_id);


--
-- Name: certificates_new_identity_uuid_operator_id_idx; Type: INDEX; Schema: certificate; Owner: -
--

CREATE INDEX certificates_new_identity_uuid_operator_id_idx ON certificate.certificates USING btree (identity_uuid, operator_id);


--
-- Name: certificates_new_uuid_idx; Type: INDEX; Schema: certificate; Owner: -
--

CREATE UNIQUE INDEX certificates_new_uuid_idx ON certificate.certificates USING btree (uuid);


--
-- Name: companies_siren_idx; Type: INDEX; Schema: company; Owner: -
--

CREATE INDEX companies_siren_idx ON company.companies USING btree (siren);


--
-- Name: companies_siret_idx; Type: INDEX; Schema: company; Owner: -
--

CREATE UNIQUE INDEX companies_siret_idx ON company.companies USING btree (siret);


--
-- Name: exports_status_idx; Type: INDEX; Schema: export; Owner: -
--

CREATE INDEX exports_status_idx ON export.exports USING btree (status) WHERE ((status)::text = 'pending'::text);


--
-- Name: exports_uuid_idx; Type: INDEX; Schema: export; Owner: -
--

CREATE UNIQUE INDEX exports_uuid_idx ON export.exports USING btree (uuid);


--
-- Name: logs_export_id_idx; Type: INDEX; Schema: export; Owner: -
--

CREATE INDEX logs_export_id_idx ON export.logs USING btree (export_id);


--
-- Name: recipients_export_id_email_idx; Type: INDEX; Schema: export; Owner: -
--

CREATE UNIQUE INDEX recipients_export_id_email_idx ON export.recipients USING btree (export_id, email);


--
-- Name: tracking_type_created_at_idx; Type: INDEX; Schema: honor; Owner: -
--

CREATE INDEX tracking_type_created_at_idx ON honor.tracking USING btree (type, created_at);


--
-- Name: operators_siret_idx; Type: INDEX; Schema: operator; Owner: -
--

CREATE INDEX operators_siret_idx ON operator.operators USING btree (siret);


--
-- Name: operators_uuid_idx; Type: INDEX; Schema: operator; Owner: -
--

CREATE INDEX operators_uuid_idx ON operator.operators USING btree (uuid);


--
-- Name: thumbnails_operator_id_idx; Type: INDEX; Schema: operator; Owner: -
--

CREATE INDEX thumbnails_operator_id_idx ON operator.thumbnails USING btree (operator_id);


--
-- Name: incentives_carpool_id_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX incentives_carpool_id_idx ON policy.incentives USING btree (carpool_id);


--
-- Name: incentives_datetime_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX incentives_datetime_idx ON policy.incentives USING btree (datetime);


--
-- Name: incentives_policy_id_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX incentives_policy_id_idx ON policy.incentives USING btree (policy_id);


--
-- Name: incentives_state_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX incentives_state_idx ON policy.incentives USING btree (state);


--
-- Name: incentives_status_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX incentives_status_idx ON policy.incentives USING btree (status);


--
-- Name: lock_stopped_at_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX lock_stopped_at_idx ON policy.lock USING btree (stopped_at);


--
-- Name: policies_territory_id_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX policies_territory_id_idx ON policy.policies USING btree (territory_id);


--
-- Name: policy_incentives_operator_operator_journey_id_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX policy_incentives_operator_operator_journey_id_idx ON policy.incentives USING btree (operator_id, operator_journey_id);


--
-- Name: policy_incentives_policy_operator_operator_journey_id_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE UNIQUE INDEX policy_incentives_policy_operator_operator_journey_id_idx ON policy.incentives USING btree (policy_id, operator_id, operator_journey_id);


--
-- Name: policy_meta_id_key; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX policy_meta_id_key ON policy.policy_metas USING btree (policy_id, key);


--
-- Name: policy_meta_incentive; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX policy_meta_incentive ON policy.policy_metas USING btree (datetime);


--
-- Name: policy_metas_policy_id_idx; Type: INDEX; Schema: policy; Owner: -
--

CREATE INDEX policy_metas_policy_id_idx ON policy.policy_metas USING btree (policy_id);


--
-- Name: insee_territory_id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX insee_territory_id_idx ON territory.insee USING btree (territory_id);


--
-- Name: territories__id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territories__id_idx ON territory.territories USING btree (_id);


--
-- Name: territories_geo_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territories_geo_idx ON territory.territories USING gist (geo);


--
-- Name: territory_codes_territory_id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_codes_territory_id_idx ON territory.territory_codes USING btree (territory_id);


--
-- Name: territory_codes_type_value_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_codes_type_value_idx ON territory.territory_codes USING btree (type, value);


--
-- Name: territory_group_deleted_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_group_deleted_idx ON territory.territory_group USING btree (deleted_at);


--
-- Name: territory_group_name_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_group_name_idx ON territory.territory_group USING btree (name);


--
-- Name: territory_group_selector_group_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_group_selector_group_idx ON territory.territory_group_selector USING btree (territory_group_id);


--
-- Name: territory_group_selector_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE UNIQUE INDEX territory_group_selector_idx ON territory.territory_group_selector USING btree (territory_group_id, selector_type, selector_value);


--
-- Name: territory_operators_operator_id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_operators_operator_id_idx ON territory.territory_operators_legacy USING btree (operator_id);


--
-- Name: territory_operators_territory_id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_operators_territory_id_idx ON territory.territory_operators_legacy USING btree (territory_id);


--
-- Name: territory_operators_territory_id_operator_id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE UNIQUE INDEX territory_operators_territory_id_operator_id_idx ON territory.territory_operators_legacy USING btree (territory_id, operator_id);


--
-- Name: territory_relation_child_territory_id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_relation_child_territory_id_idx ON territory.territory_relation USING btree (child_territory_id);


--
-- Name: territory_relation_parent_territory_id_idx; Type: INDEX; Schema: territory; Owner: -
--

CREATE INDEX territory_relation_parent_territory_id_idx ON territory.territory_relation USING btree (parent_territory_id);


--
-- Name: users touch_users_updated_at; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER touch_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: carpools touch_carpool_updated_at; Type: TRIGGER; Schema: carpool_v2; Owner: -
--

CREATE TRIGGER touch_carpool_updated_at BEFORE UPDATE ON carpool_v2.carpools FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: geo touch_geo_updated_at; Type: TRIGGER; Schema: carpool_v2; Owner: -
--

CREATE TRIGGER touch_geo_updated_at BEFORE UPDATE ON carpool_v2.geo FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: status touch_status_updated_at; Type: TRIGGER; Schema: carpool_v2; Owner: -
--

CREATE TRIGGER touch_status_updated_at BEFORE UPDATE ON carpool_v2.status FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: certificates touch_certificates_updated_at; Type: TRIGGER; Schema: certificate; Owner: -
--

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: exports touch_exports_updated_at; Type: TRIGGER; Schema: export; Owner: -
--

CREATE TRIGGER touch_exports_updated_at BEFORE UPDATE ON export.exports FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: operators touch_operators_updated_at; Type: TRIGGER; Schema: operator; Owner: -
--

CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: policies touch_policies_updated_at; Type: TRIGGER; Schema: policy; Owner: -
--

CREATE TRIGGER touch_policies_updated_at BEFORE UPDATE ON policy.policies FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: policy_metas touch_policy_meta_updated_at; Type: TRIGGER; Schema: policy; Owner: -
--

CREATE TRIGGER touch_policy_meta_updated_at BEFORE UPDATE ON policy.policy_metas FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: territories touch_territories_updated_at; Type: TRIGGER; Schema: territory; Owner: -
--

CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: territory_group touch_territory_group_updated_at; Type: TRIGGER; Schema: territory; Owner: -
--

CREATE TRIGGER touch_territory_group_updated_at BEFORE UPDATE ON territory.territory_group FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: carpools carpools_operator_id_fkey; Type: FK CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.carpools
    ADD CONSTRAINT carpools_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);


--
-- Name: geo geo_carpool_id_fkey; Type: FK CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.geo
    ADD CONSTRAINT geo_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);


--
-- Name: operator_incentive_counterparts operator_incentive_counterparts_carpool_id_fkey; Type: FK CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.operator_incentive_counterparts
    ADD CONSTRAINT operator_incentive_counterparts_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);


--
-- Name: operator_incentives operator_incentives_carpool_id_fkey; Type: FK CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.operator_incentives
    ADD CONSTRAINT operator_incentives_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);


--
-- Name: requests requests_carpool_id_fkey; Type: FK CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.requests
    ADD CONSTRAINT requests_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);


--
-- Name: requests requests_operator_id_fkey; Type: FK CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.requests
    ADD CONSTRAINT requests_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);


--
-- Name: status status_carpool_id_fkey; Type: FK CONSTRAINT; Schema: carpool_v2; Owner: -
--

ALTER TABLE ONLY carpool_v2.status
    ADD CONSTRAINT status_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id);


--
-- Name: logs logs_export_id_fkey; Type: FK CONSTRAINT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.logs
    ADD CONSTRAINT logs_export_id_fkey FOREIGN KEY (export_id) REFERENCES export.exports(_id) ON DELETE CASCADE;


--
-- Name: recipients recipients_export_id_fkey; Type: FK CONSTRAINT; Schema: export; Owner: -
--

ALTER TABLE ONLY export.recipients
    ADD CONSTRAINT recipients_export_id_fkey FOREIGN KEY (export_id) REFERENCES export.exports(_id) ON DELETE CASCADE;


--
-- Name: thumbnails thumbnails_operator_id_fkey; Type: FK CONSTRAINT; Schema: operator; Owner: -
--

ALTER TABLE ONLY operator.thumbnails
    ADD CONSTRAINT thumbnails_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id) ON DELETE CASCADE;


--
-- Name: incentives incentives_operator_id_fkey; Type: FK CONSTRAINT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.incentives
    ADD CONSTRAINT incentives_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);


--
-- Name: territories territories_company_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_company_id_fkey FOREIGN KEY (company_id) REFERENCES company.companies(_id) ON DELETE SET NULL;


--
-- Name: territory_codes territory_codes_territory_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_codes
    ADD CONSTRAINT territory_codes_territory_id_fkey FOREIGN KEY (territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;


--
-- Name: territory_group territory_group_company_fk; Type: FK CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_group
    ADD CONSTRAINT territory_group_company_fk FOREIGN KEY (company_id) REFERENCES company.companies(_id);


--
-- Name: territory_group_selector territory_group_selector_territory_fk; Type: FK CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_group_selector
    ADD CONSTRAINT territory_group_selector_territory_fk FOREIGN KEY (territory_group_id) REFERENCES territory.territory_group(_id);


--
-- Name: territory_relation territory_relation_child_territory_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_child_territory_id_fkey FOREIGN KEY (child_territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;


--
-- Name: territory_relation territory_relation_parent_territory_id_fkey; Type: FK CONSTRAINT; Schema: territory; Owner: -
--

ALTER TABLE ONLY territory.territory_relation
    ADD CONSTRAINT territory_relation_parent_territory_id_fkey FOREIGN KEY (parent_territory_id) REFERENCES territory.territories(_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

