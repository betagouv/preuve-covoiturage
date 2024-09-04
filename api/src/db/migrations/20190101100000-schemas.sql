CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE SCHEMA IF NOT EXISTS acquisition;
CREATE SCHEMA IF NOT EXISTS anomaly;
CREATE SCHEMA IF NOT EXISTS application;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS carpool;
CREATE SCHEMA IF NOT EXISTS carpool_v2;
CREATE SCHEMA IF NOT EXISTS cee;
CREATE SCHEMA IF NOT EXISTS certificate;
CREATE SCHEMA IF NOT EXISTS common;
CREATE SCHEMA IF NOT EXISTS company;
CREATE SCHEMA IF NOT EXISTS export;
CREATE SCHEMA IF NOT EXISTS fraudcheck;
CREATE SCHEMA IF NOT EXISTS geo;
CREATE SCHEMA IF NOT EXISTS honor;
CREATE SCHEMA IF NOT EXISTS operator;
CREATE SCHEMA IF NOT EXISTS policy;
CREATE SCHEMA IF NOT EXISTS territory;
CREATE SCHEMA IF NOT EXISTS trip;
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
CREATE FUNCTION fraudcheck.json_to_result(_ti json) RETURNS fraudcheck.result
    LANGUAGE sql
    AS $_$
  select ROW(
    $1->>'method',
    ($1->>'status')::fraudcheck.status_enum,
    ($1->>'karma')::float,
    ($1->>'meta')::json)::fraudcheck.result;
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


CREATE FUNCTION common.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
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
SET default_tablespace = '';
SET default_table_access_method = heap;
CREATE TABLE acquisition.acquisitions (
    _id serial PRIMARY KEY,
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

CREATE TABLE carpool.carpools (
    _id serial PRIMARY KEY,
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

CREATE TABLE anomaly.labels (
  _id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  carpool_id integer REFERENCES carpool.carpools(_id) NOT NULL,
  label varchar NOT NULL,
  conflicting_carpool_id integer REFERENCES carpool.carpools(_id) NOT NULL,
  conflicting_operator_journey_id varchar NOT NULL,
  overlap_duration_ratio real
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
    _id serial PRIMARY KEY,
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
CREATE TABLE application.applications (
    _id serial PRIMARY KEY,
    uuid character varying DEFAULT public.uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    owner_id integer NOT NULL,
    owner_service character varying NOT NULL,
    permissions character varying[] DEFAULT ARRAY[]::character varying[]
);
CREATE TABLE auth.users (
    _id serial PRIMARY KEY,
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
CREATE TABLE carpool.identities (
    _id serial PRIMARY KEY,
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
    _id serial PRIMARY KEY,
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
CREATE TABLE carpool_v2.geo (
    _id serial PRIMARY KEY,
    carpool_id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_geo_code character varying(5),
    end_geo_code character varying(5),
    errors jsonb
);
CREATE TABLE carpool_v2.operator_incentive_counterparts (
    _id serial PRIMARY KEY,
    carpool_id integer NOT NULL,
    target_is_driver boolean NOT NULL,
    siret character varying(14) NOT NULL,
    amount integer NOT NULL
);
CREATE TABLE carpool_v2.operator_incentives (
    _id serial PRIMARY KEY,
    carpool_id integer NOT NULL,
    idx smallint NOT NULL,
    siret character varying(14) NOT NULL,
    amount integer NOT NULL
);
CREATE TABLE carpool_v2.requests (
    _id serial PRIMARY KEY,
    carpool_id integer NOT NULL,
    operator_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    operator_journey_id character varying NOT NULL,
    payload jsonb,
    api_version smallint NOT NULL,
    cancel_code character varying(32),
    cancel_message character varying(512)
);
CREATE TABLE carpool_v2.status (
    _id serial PRIMARY KEY,
    carpool_id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    acquisition_status carpool_v2.carpool_acquisition_status_enum DEFAULT 'received'::carpool_v2.carpool_acquisition_status_enum NOT NULL,
    fraud_status carpool_v2.carpool_fraud_status_enum DEFAULT 'pending'::carpool_v2.carpool_fraud_status_enum NOT NULL
);
CREATE TABLE cee.cee_application_errors (
    _id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    _id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    _id serial PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cee_application_id uuid NOT NULL,
    label character varying NOT NULL
);
CREATE TABLE certificate.access_log (
    _id serial PRIMARY KEY,
    certificate_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ip inet,
    user_agent character varying,
    user_id character varying,
    content_type character varying
);
CREATE TABLE certificate.certificates (
    _id serial PRIMARY KEY,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    identity_uuid uuid NOT NULL,
    operator_id integer NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL
);
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
    _id serial PRIMARY KEY,
    address_street character varying(255),
    address_postcode character varying(5),
    address_cedex character varying(128),
    address_city character varying(255)
);
CREATE TABLE export.exports (
    _id serial PRIMARY KEY,
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
CREATE TABLE export.logs (
    _id serial PRIMARY KEY,
    export_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    type character varying(255) NOT NULL,
    message text NOT NULL
);
CREATE TABLE export.recipients (
    _id serial PRIMARY KEY,
    export_id integer NOT NULL,
    scrambled_at timestamp with time zone,
    email character varying(255) NOT NULL,
    fullname character varying(255),
    message text
);
CREATE TABLE fraudcheck.labels (
    _id serial PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    carpool_id integer NOT NULL,
    label character varying NOT NULL,
    geo_code character varying(9)
);
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
CREATE TABLE honor.tracking (
    _id serial PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type character varying(32) NOT NULL,
    employer character varying(255) DEFAULT ''::character varying NOT NULL
);
CREATE TABLE operator.operators (
    _id serial PRIMARY KEY,
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
CREATE TABLE operator.thumbnails (
    _id serial PRIMARY KEY,
    operator_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data bytea NOT NULL
);
CREATE TABLE policy.incentives (
    _id serial PRIMARY KEY,
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
CREATE TABLE policy.lock (
    _id serial PRIMARY KEY,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    stopped_at timestamp with time zone,
    success boolean,
    data json
);
CREATE TABLE policy.policies (
    _id serial PRIMARY KEY,
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
CREATE TABLE policy.policy_metas (
    _id serial PRIMARY KEY,
    policy_id integer NOT NULL,
    key character varying DEFAULT 'default'::character varying NOT NULL,
    value integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    datetime timestamp without time zone
);
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
    _id serial PRIMARY KEY,
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
    _id serial PRIMARY KEY,
    territory_id integer NOT NULL,
    type character varying(10) NOT NULL,
    value character varying(64) NOT NULL
);
CREATE TABLE territory.territory_relation (
    _id serial PRIMARY KEY,
    parent_territory_id integer NOT NULL,
    child_territory_id integer NOT NULL
);
CREATE TABLE territory.insee (
    _id character varying NOT NULL,
    territory_id integer NOT NULL
);
CREATE TABLE territory.territory_group (
    _id serial PRIMARY KEY,
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

CREATE TABLE trip.stat_cache (
    hash character varying(32) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    data json NOT NULL
);
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
CREATE TRIGGER touch_identities_updated_at BEFORE UPDATE ON carpool.identities FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_carpool_updated_at BEFORE UPDATE ON carpool_v2.carpools FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_geo_updated_at BEFORE UPDATE ON carpool_v2.geo FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_status_updated_at BEFORE UPDATE ON carpool_v2.status FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_cee_updated_at BEFORE UPDATE ON cee.cee_applications FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_exports_updated_at BEFORE UPDATE ON export.exports FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();
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
