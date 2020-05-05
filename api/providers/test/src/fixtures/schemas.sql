--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-2.pgdg90+1)
-- Dumped by pg_dump version 11.7 (Ubuntu 11.7-0ubuntu0.19.10.1)

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
-- Name: intarray; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS intarray WITH SCHEMA public;


--
-- Name: EXTENSION intarray; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION intarray IS 'functions, operators, and index support for 1-D arrays of integers';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track execution statistics of all SQL statements executed';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
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
    'canceled'
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

SET default_tablespace = '';

SET default_with_oids = false;

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
    start_insee character varying,
    end_position public.geography,
    end_insee character varying,
    distance integer,
    seats integer DEFAULT 1,
    identity_id integer NOT NULL,
    operator_journey_id character varying,
    cost integer DEFAULT 0 NOT NULL,
    meta json,
    status carpool.carpool_status_enum DEFAULT 'ok'::carpool.carpool_status_enum NOT NULL
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
    ui_status json
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
    identity_uuid character varying NOT NULL,
    operator_uuid character varying NOT NULL,
    territory_uuid character varying NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
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
-- Name: carpools; Type: VIEW; Schema: common; Owner: postgres
--

CREATE VIEW common.carpools AS
 SELECT carpools._id,
    carpools.created_at,
    carpools.acquisition_id,
    carpools.operator_id,
    carpools.trip_id,
    carpools.operator_trip_id,
    carpools.is_driver,
    carpools.operator_class,
    carpools.datetime,
    carpools.duration,
    carpools.start_position,
    carpools.start_insee,
    carpools.end_position,
    carpools.end_insee,
    carpools.distance,
    carpools.seats,
    carpools.identity_id,
    carpools.operator_journey_id,
    carpools.cost,
    carpools.meta
   FROM carpool.carpools;


ALTER TABLE common.carpools OWNER TO postgres;

--
-- Name: insee; Type: TABLE; Schema: common; Owner: postgres
--

CREATE TABLE common.insee (
    _id character varying NOT NULL,
    town character varying(64),
    country character varying,
    density integer,
    postcodes character varying(10)[],
    geo public.geography
);


ALTER TABLE common.insee OWNER TO postgres;

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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE company.companies OWNER TO postgres;

--
-- Name: fraudchecks; Type: TABLE; Schema: fraudcheck; Owner: postgres
--

CREATE TABLE fraudcheck.fraudchecks (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    acquisition_id character varying NOT NULL,
    method character varying(128) NOT NULL,
    status fraudcheck.status_enum DEFAULT 'pending'::fraudcheck.status_enum NOT NULL,
    karma integer DEFAULT 0,
    meta json
);


ALTER TABLE fraudcheck.fraudchecks OWNER TO postgres;

--
-- Name: fraudchecks__id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: postgres
--

CREATE SEQUENCE fraudcheck.fraudchecks__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE fraudcheck.fraudchecks__id_seq OWNER TO postgres;

--
-- Name: fraudchecks__id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: postgres
--

ALTER SEQUENCE fraudcheck.fraudchecks__id_seq OWNED BY fraudcheck.fraudchecks._id;


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
    contacts json NOT NULL
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
-- Name: fevrier; Type: VIEW; Schema: policy; Owner: postgres
--

CREATE VIEW policy.fevrier AS
 SELECT to_char(date_trunc('day'::text, cc.datetime), 'YYYY-MM-DD'::text) AS day,
    ((sum(pi.amount))::double precision / (100)::double precision) AS total,
    oo.name AS operator,
    count(*) AS trips,
    (((sum(pi.amount))::double precision / (100)::double precision) / (count(*))::double precision) AS avg_per_trip
   FROM ((policy.incentives pi
     JOIN carpool.carpools cc ON ((pi.carpool_id = cc._id)))
     JOIN operator.operators oo ON ((cc.operator_id = oo._id)))
  GROUP BY (to_char(date_trunc('day'::text, cc.datetime), 'YYYY-MM-DD'::text)), oo.name
  ORDER BY (to_char(date_trunc('day'::text, cc.datetime), 'YYYY-MM-DD'::text)), oo.name;


ALTER TABLE policy.fevrier OWNER TO postgres;

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
-- Name: insee; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.insee (
    _id character varying NOT NULL,
    territory_id integer NOT NULL
);


ALTER TABLE territory.insee OWNER TO postgres;

--
-- Name: trips; Type: MATERIALIZED VIEW; Schema: policy; Owner: postgres
--

CREATE MATERIALIZED VIEW policy.trips AS
 SELECT cp._id AS carpool_id,
    cp.status AS carpool_status,
    cp.trip_id,
    cp.start_insee,
    cp.end_insee,
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
    tis.territory_id AS start_territory_id,
    tie.territory_id AS end_territory_id,
    ap.applicable_policies,
    pp.processed_policies,
    (ap.applicable_policies OPERATOR(public.-) pp.processed_policies) AS processable_policies
   FROM carpool.carpools cp,
    LATERAL ( SELECT COALESCE(array_agg(ti.territory_id), ARRAY[]::integer[]) AS territory_id
           FROM territory.insee ti
          WHERE ((ti._id)::text = (cp.start_insee)::text)) tis,
    LATERAL ( SELECT COALESCE(array_agg(ti.territory_id), ARRAY[]::integer[]) AS territory_id
           FROM territory.insee ti
          WHERE ((ti._id)::text = (cp.end_insee)::text)) tie,
    LATERAL ( SELECT COALESCE(array_agg(pp_1._id), ARRAY[]::integer[]) AS applicable_policies
           FROM policy.policies pp_1
          WHERE (((pp_1.territory_id = ANY (tis.territory_id)) OR (pp_1.territory_id = ANY (tie.territory_id))) AND (pp_1.start_date <= cp.datetime) AND (pp_1.end_date >= cp.datetime) AND (pp_1.status = 'active'::policy.policy_status_enum))) ap,
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
-- Name: territories; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territories (
    _id integer NOT NULL,
    parent_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    siret character varying NOT NULL,
    name character varying NOT NULL,
    shortname character varying,
    cgu_accepted_at timestamp with time zone,
    cgu_accepted_by character varying,
    company json NOT NULL,
    address json NOT NULL,
    contacts json NOT NULL
);


ALTER TABLE territory.territories OWNER TO postgres;

--
-- Name: territories__id_seq; Type: SEQUENCE; Schema: territory; Owner: postgres
--

CREATE SEQUENCE territory.territories__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE territory.territories__id_seq OWNER TO postgres;

--
-- Name: territories__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: postgres
--

ALTER SEQUENCE territory.territories__id_seq OWNED BY territory.territories._id;


--
-- Name: territory_operators; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territory_operators (
    territory_id integer NOT NULL,
    operator_id integer NOT NULL
);


ALTER TABLE territory.territory_operators OWNER TO postgres;

--
-- Name: export; Type: MATERIALIZED VIEW; Schema: trip; Owner: postgres
--

CREATE MATERIALIZED VIEW trip.export AS
 SELECT cpp.operator_id,
    ope.name AS operator_name,
    tis.territory_id AS start_territory_id,
    tie.territory_id AS end_territory_id,
    (cpp.acquisition_id)::character varying AS journey_id,
    cpp.trip_id,
    cpp.datetime AS journey_start_datetime,
    trunc((public.st_x((cpp.start_position)::public.geometry))::numeric, (round((log(((5 - cis.density))::double precision) + (2)::double precision)))::integer) AS journey_start_lon,
    trunc((public.st_y((cpp.start_position)::public.geometry))::numeric, (round((log(((5 - cis.density))::double precision) + (2)::double precision)))::integer) AS journey_start_lat,
    cpp.start_insee AS journey_start_insee,
    cis.postcodes[1] AS journey_start_postcode,
    cis.town AS journey_start_town,
    NULL::text AS journey_start_epci,
    cis.country AS journey_start_country,
    (cpp.datetime + ((cpp.duration || ' seconds'::text))::interval) AS journey_end_datetime,
    trunc((public.st_x((cpp.end_position)::public.geometry))::numeric, (round((log(((5 - cie.density))::double precision) + (2)::double precision)))::integer) AS journey_end_lon,
    trunc((public.st_y((cpp.end_position)::public.geometry))::numeric, (round((log(((5 - cie.density))::double precision) + (2)::double precision)))::integer) AS journey_end_lat,
    cpp.end_insee AS journey_end_insee,
    cie.postcodes[1] AS journey_end_postcode,
    cie.town AS journey_end_town,
    NULL::text AS journey_end_epci,
    cie.country AS journey_end_country,
        CASE
            WHEN (cpp.distance IS NOT NULL) THEN cpp.distance
            ELSE ((cpp.meta ->> 'calc_distance'::text))::integer
        END AS journey_distance,
        CASE
            WHEN (cpp.duration IS NOT NULL) THEN cpp.duration
            ELSE ((cpp.meta ->> 'calc_duration'::text))::integer
        END AS journey_duration,
    (
        CASE
            WHEN (cid.travel_pass_name IS NOT NULL) THEN '1'::text
            ELSE '0'::text
        END)::boolean AS driver_card,
    (
        CASE
            WHEN (cip.travel_pass_name IS NOT NULL) THEN '1'::text
            ELSE '0'::text
        END)::boolean AS passenger_card,
    cpp.operator_class,
    cip.over_18 AS passenger_over_18,
    cpp.seats AS passenger_seats
   FROM ((((((((carpool.carpools cpp
     JOIN operator.operators ope ON ((ope._id = cpp.operator_id)))
     JOIN territory.insee tis ON (((tis._id)::text = (cpp.start_insee)::text)))
     JOIN territory.insee tie ON (((tie._id)::text = (cpp.end_insee)::text)))
     JOIN common.insee cis ON (((cis._id)::text = (cpp.start_insee)::text)))
     JOIN common.insee cie ON (((cie._id)::text = (cpp.end_insee)::text)))
     JOIN carpool.carpools cpd ON (((cpd.acquisition_id = cpp.acquisition_id) AND (cpd.is_driver = true) AND (cpd.status = 'ok'::carpool.carpool_status_enum))))
     JOIN carpool.identities cip ON ((cip._id = cpp.identity_id)))
     JOIN carpool.identities cid ON ((cid._id = cpd.identity_id)))
  WHERE ((cpp.is_driver = false) AND (cpp.status = 'ok'::carpool.carpool_status_enum))
  WITH NO DATA;


ALTER TABLE trip.export OWNER TO postgres;

--
-- Name: list; Type: MATERIALIZED VIEW; Schema: trip; Owner: postgres
--

CREATE MATERIALIZED VIEW trip.list AS
 SELECT cp.trip_id,
    cp.start_insee,
    cp.end_insee,
    cp.operator_id,
    cp.operator_class,
    cp.datetime,
    date_part('isodow'::text, cp.datetime) AS weekday,
    date_part('hour'::text, cp.datetime) AS dayhour,
    cp.seats,
    cp.is_driver,
    cis.town AS start_town,
    tis.territory_id AS start_territory_id,
    cie.town AS end_town,
    tie.territory_id AS end_territory_id,
        CASE
            WHEN (cp.distance IS NOT NULL) THEN cp.distance
            ELSE ((cp.meta ->> 'calc_distance'::text))::integer
        END AS distance
   FROM ((((carpool.carpools cp
     JOIN common.insee cis ON (((cp.start_insee)::text = (cis._id)::text)))
     JOIN common.insee cie ON (((cp.end_insee)::text = (cie._id)::text)))
     JOIN territory.insee tis ON (((cp.start_insee)::text = (tis._id)::text)))
     JOIN territory.insee tie ON (((cp.end_insee)::text = (tie._id)::text)))
  WHERE (cp.status = 'ok'::carpool.carpool_status_enum)
  WITH NO DATA;


ALTER TABLE trip.list OWNER TO postgres;

--
-- Name: stat_cache; Type: TABLE; Schema: trip; Owner: postgres
--

CREATE TABLE trip.stat_cache (
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    territory_id integer,
    operator_id integer,
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
-- Name: fraudchecks _id; Type: DEFAULT; Schema: fraudcheck; Owner: postgres
--

ALTER TABLE ONLY fraudcheck.fraudchecks ALTER COLUMN _id SET DEFAULT nextval('fraudcheck.fraudchecks__id_seq'::regclass);


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

ALTER TABLE ONLY territory.territories ALTER COLUMN _id SET DEFAULT nextval('territory.territories__id_seq'::regclass);


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
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: certificate; Owner: postgres
--

ALTER TABLE ONLY certificate.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (_id);


--
-- Name: insee insee_pkey; Type: CONSTRAINT; Schema: common; Owner: postgres
--

ALTER TABLE ONLY common.insee
    ADD CONSTRAINT insee_pkey PRIMARY KEY (_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: common; Owner: postgres
--

ALTER TABLE ONLY common.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (slug);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: company; Owner: postgres
--

ALTER TABLE ONLY company.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (siret);


--
-- Name: fraudchecks fraudchecks_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: postgres
--

ALTER TABLE ONLY fraudcheck.fraudchecks
    ADD CONSTRAINT fraudchecks_pkey PRIMARY KEY (_id);


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
-- Name: territories territories_pkey; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_pkey PRIMARY KEY (_id);


--
-- Name: acquisitions_journey_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_journey_id_idx ON acquisition.acquisitions USING btree (journey_id);


--
-- Name: acquisitions_journey_id_idx1; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_journey_id_idx1 ON acquisition.acquisitions USING btree (journey_id);


--
-- Name: acquisitions_journey_id_idx2; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_journey_id_idx2 ON acquisition.acquisitions USING btree (journey_id);


--
-- Name: acquisitions_journey_id_idx3; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_journey_id_idx3 ON acquisition.acquisitions USING btree (journey_id);


--
-- Name: acquisitions_operator_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_operator_id_idx ON acquisition.acquisitions USING btree (operator_id);


--
-- Name: acquisitions_operator_id_idx1; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_operator_id_idx1 ON acquisition.acquisitions USING btree (operator_id);


--
-- Name: acquisitions_operator_id_idx2; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_operator_id_idx2 ON acquisition.acquisitions USING btree (operator_id);


--
-- Name: acquisitions_operator_id_idx3; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_operator_id_idx3 ON acquisition.acquisitions USING btree (operator_id);


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
-- Name: carpools_end_insee_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_end_insee_idx ON carpool.carpools USING btree (end_insee);


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
-- Name: carpools_start_insee_idx; Type: INDEX; Schema: carpool; Owner: postgres
--

CREATE INDEX carpools_start_insee_idx ON carpool.carpools USING btree (start_insee);


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
-- Name: certificates_uuid_idx; Type: INDEX; Schema: certificate; Owner: postgres
--

CREATE UNIQUE INDEX certificates_uuid_idx ON certificate.certificates USING btree (uuid);


--
-- Name: insee_geo_idx; Type: INDEX; Schema: common; Owner: postgres
--

CREATE INDEX insee_geo_idx ON common.insee USING gist (geo);


--
-- Name: companies_siren_idx; Type: INDEX; Schema: company; Owner: postgres
--

CREATE INDEX companies_siren_idx ON company.companies USING btree (siren);


--
-- Name: fraudchecks_acquisition_id_idx; Type: INDEX; Schema: fraudcheck; Owner: postgres
--

CREATE INDEX fraudchecks_acquisition_id_idx ON fraudcheck.fraudchecks USING btree (acquisition_id);


--
-- Name: fraudchecks_acquisition_id_method_idx; Type: INDEX; Schema: fraudcheck; Owner: postgres
--

CREATE UNIQUE INDEX fraudchecks_acquisition_id_method_idx ON fraudcheck.fraudchecks USING btree (acquisition_id, method);


--
-- Name: fraudchecks_method_idx; Type: INDEX; Schema: fraudcheck; Owner: postgres
--

CREATE INDEX fraudchecks_method_idx ON fraudcheck.fraudchecks USING btree (method);


--
-- Name: fraudchecks_status_idx; Type: INDEX; Schema: fraudcheck; Owner: postgres
--

CREATE INDEX fraudchecks_status_idx ON fraudcheck.fraudchecks USING btree (status);


--
-- Name: operators_siret_idx; Type: INDEX; Schema: operator; Owner: postgres
--

CREATE INDEX operators_siret_idx ON operator.operators USING btree (siret);


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
-- Name: territories_siret_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territories_siret_idx ON territory.territories USING btree (siret);


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
-- Name: export_end_territory_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX export_end_territory_id_idx ON trip.export USING btree (end_territory_id);


--
-- Name: export_journey_start_datetime_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX export_journey_start_datetime_idx ON trip.export USING btree (journey_start_datetime);


--
-- Name: export_operator_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX export_operator_id_idx ON trip.export USING btree (operator_id);


--
-- Name: export_start_territory_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX export_start_territory_id_idx ON trip.export USING btree (start_territory_id);


--
-- Name: list_datetime_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_datetime_idx ON trip.list USING btree (datetime);


--
-- Name: list_dayhour_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_dayhour_idx ON trip.list USING btree (dayhour);


--
-- Name: list_distance_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_distance_idx ON trip.list USING btree (distance);


--
-- Name: list_end_territory_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_end_territory_id_idx ON trip.list USING btree (end_territory_id);


--
-- Name: list_is_driver_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_is_driver_idx ON trip.list USING btree (is_driver);


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
-- Name: list_weekday_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE INDEX list_weekday_idx ON trip.list USING btree (weekday);


--
-- Name: stat_cache_is_public_territory_id_operator_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE UNIQUE INDEX stat_cache_is_public_territory_id_operator_id_idx ON trip.stat_cache USING btree (is_public, territory_id, operator_id);


--
-- Name: users touch_users_updated_at; Type: TRIGGER; Schema: auth; Owner: postgres
--

CREATE TRIGGER touch_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- Name: identities touch_identities_updated_at; Type: TRIGGER; Schema: carpool; Owner: postgres
--

CREATE TRIGGER touch_identities_updated_at BEFORE UPDATE ON carpool.identities FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- Name: certificates touch_certificates_updated_at; Type: TRIGGER; Schema: certificate; Owner: postgres
--

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- Name: fraudchecks touch_fraudchecks_updated_at; Type: TRIGGER; Schema: fraudcheck; Owner: postgres
--

CREATE TRIGGER touch_fraudchecks_updated_at BEFORE UPDATE ON fraudcheck.fraudchecks FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- Name: operators touch_operators_updated_at; Type: TRIGGER; Schema: operator; Owner: postgres
--

CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- Name: policies touch_policies_updated_at; Type: TRIGGER; Schema: policy; Owner: postgres
--

CREATE TRIGGER touch_policies_updated_at BEFORE UPDATE ON policy.policies FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- Name: policy_metas touch_policy_meta_updated_at; Type: TRIGGER; Schema: policy; Owner: postgres
--

CREATE TRIGGER touch_policy_meta_updated_at BEFORE UPDATE ON policy.policy_metas FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- Name: territories touch_territories_updated_at; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();


--
-- PostgreSQL database dump complete
--

