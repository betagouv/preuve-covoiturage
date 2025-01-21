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

--
-- Name: anomaly; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA anomaly;


--
-- Name: fraud; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA fraud;


--
-- Name: fraudcheck; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA fraudcheck;


--
-- Name: status_enum; Type: TYPE; Schema: fraudcheck; Owner: -
--

CREATE TYPE fraudcheck.status_enum AS ENUM (
    'pending',
    'done',
    'error'
);


--
-- Name: result; Type: TYPE; Schema: fraudcheck; Owner: -
--

CREATE TYPE fraudcheck.result AS (
	method character varying(128),
	status fraudcheck.status_enum,
	karma double precision,
	meta json
);


--
-- Name: result_array_to_json(fraudcheck.result[]); Type: FUNCTION; Schema: fraudcheck; Owner: -
--

CREATE OR REPLACE FUNCTION fraudcheck.result_array_to_json(_ti fraudcheck.result[]) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_agg(fraudcheck.result_to_json(data)) FROM UNNEST($1) as data;
$_$;


--
-- Name: json_to_result_array(json); Type: FUNCTION; Schema: fraudcheck; Owner: -
--

CREATE OR REPLACE FUNCTION fraudcheck.json_to_result_array(_ti json) RETURNS fraudcheck.result[]
    LANGUAGE sql
    AS $_$
	select array_agg(fraudcheck.json_to_result(value)) from json_array_elements($1)
$_$;


--
-- Name: json_to_result(json); Type: FUNCTION; Schema: fraudcheck; Owner: -
--

CREATE OR REPLACE FUNCTION fraudcheck.json_to_result(_ti json) RETURNS fraudcheck.result
    LANGUAGE sql
    AS $_$
  select ROW(
    $1->>'method',
    ($1->>'status')::fraudcheck.status_enum,
    ($1->>'karma')::float,
    ($1->>'meta')::json)::fraudcheck.result;
$_$;


--
-- Name: result_to_json(fraudcheck.result); Type: FUNCTION; Schema: fraudcheck; Owner: -
--

CREATE OR REPLACE FUNCTION fraudcheck.result_to_json(_ti fraudcheck.result) RETURNS json
    LANGUAGE sql
    AS $_$
  select json_build_object(
    'method', $1.method
  , 'status', $1.status
  , 'karma', $1.karma
  , 'meta', $1.meta
  );
$_$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: labels; Type: TABLE; Schema: anomaly; Owner: -
--

CREATE TABLE anomaly.labels (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    carpool_id integer NOT NULL,
    label character varying NOT NULL,
    conflicting_carpool_id integer,
    conflicting_operator_journey_id character varying,
    overlap_duration_ratio real,
    operator_journey_id character varying
);


--
-- Name: labels__id_seq; Type: SEQUENCE; Schema: anomaly; Owner: -
--

CREATE SEQUENCE anomaly.labels__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: labels__id_seq; Type: SEQUENCE OWNED BY; Schema: anomaly; Owner: -
--

ALTER SEQUENCE anomaly.labels__id_seq OWNED BY anomaly.labels._id;


--
-- Name: users_intraday_role_change_stats; Type: TABLE; Schema: fraud; Owner: -
--

CREATE TABLE fraud.users_intraday_role_change_stats (
    user_identity_key character varying(64),
    total_traveled_days bigint,
    total_consecutives_intraday_role_changes numeric,
    avg_daily_consecutives_intraday_role_changes numeric,
    max_daily_consecutives_intraday_role_changes bigint
);


--
-- Name: users_statistics; Type: TABLE; Schema: fraud; Owner: -
--

CREATE TABLE fraud.users_statistics (
    user_identity_key character varying(64),
    num_trips bigint,
    num_trips_as_driver bigint,
    num_trips_as_passenger bigint,
    num_journeys bigint,
    num_journeys_as_driver bigint,
    num_journeys_as_passenger bigint,
    datetime_first_trip timestamp with time zone,
    datetime_first_trip_as_driver timestamp with time zone,
    datetime_first_trip_as_passenger timestamp with time zone,
    datetime_last_trip timestamp with time zone,
    datetime_last_trip_as_driver timestamp with time zone,
    datetime_last_trip_as_passenger timestamp with time zone,
    average_journey_duration interval,
    average_journey_duration_as_driver interval,
    average_journey_duration_as_passenger interval,
    average_journey_distance numeric,
    average_journey_distance_as_driver numeric,
    average_journey_distance_as_passenger numeric,
    min_journey_distance integer,
    min_journey_distance_as_driver integer,
    min_journey_distance_as_passenger integer,
    max_journey_distance integer,
    max_journey_distance_as_driver integer,
    max_journey_distance_as_passenger integer,
    total_traveled_days bigint,
    total_traveled_days_as_driver bigint,
    total_traveled_days_as_passenger bigint,
    num_unique_operators bigint,
    num_unique_operators_as_driver bigint,
    num_unique_operators_as_passenger bigint,
    list_distinct_operators integer[],
    list_distinct_operators_as_driver integer[],
    list_distinct_operators_as_passenger integer[],
    average_passenger_seats numeric,
    average_passenger_seats_as_driver numeric,
    average_passenger_seats_as_passenger numeric,
    num_nightime_22_5_trips bigint,
    num_nightime_22_5_trips_as_driver bigint,
    num_nightime_22_5_trips_as_passenger bigint,
    total_incentives_as_driver numeric,
    total_consecutives_intraday_role_changes numeric,
    avg_daily_consecutives_intraday_role_changes numeric,
    max_daily_consecutives_intraday_role_changes bigint
);


--
-- Name: labels; Type: TABLE; Schema: fraudcheck; Owner: -
--

CREATE TABLE fraudcheck.labels (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    carpool_id integer NOT NULL,
    label character varying NOT NULL,
    geo_code character varying(9)
);


--
-- Name: labels__id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: -
--

CREATE SEQUENCE fraudcheck.labels__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: labels__id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: -
--

ALTER SEQUENCE fraudcheck.labels__id_seq OWNED BY fraudcheck.labels._id;


--
-- Name: phone_insights; Type: TABLE; Schema: fraudcheck; Owner: -
--

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


--
-- Name: phone_insights_detailed; Type: TABLE; Schema: fraudcheck; Owner: -
--

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


--
-- Name: phone_insights_detailed_id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: -
--

CREATE SEQUENCE fraudcheck.phone_insights_detailed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: phone_insights_detailed_id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: -
--

ALTER SEQUENCE fraudcheck.phone_insights_detailed_id_seq OWNED BY fraudcheck.phone_insights_detailed.id;


--
-- Name: phone_insights_detailed_old; Type: TABLE; Schema: fraudcheck; Owner: -
--

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


--
-- Name: phone_insights_id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: -
--

CREATE SEQUENCE fraudcheck.phone_insights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: phone_insights_id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: -
--

ALTER SEQUENCE fraudcheck.phone_insights_id_seq OWNED BY fraudcheck.phone_insights.id;


--
-- Name: potential_triangular_patterns; Type: TABLE; Schema: fraudcheck; Owner: -
--

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


--
-- Name: potential_triangular_patterns_id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: -
--

CREATE SEQUENCE fraudcheck.potential_triangular_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: potential_triangular_patterns_id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: -
--

ALTER SEQUENCE fraudcheck.potential_triangular_patterns_id_seq OWNED BY fraudcheck.potential_triangular_patterns.id;


--
-- Name: triangular_patterns; Type: TABLE; Schema: fraudcheck; Owner: -
--

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


--
-- Name: triangular_patterns_id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: -
--

CREATE SEQUENCE fraudcheck.triangular_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: triangular_patterns_id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: -
--

ALTER SEQUENCE fraudcheck.triangular_patterns_id_seq OWNED BY fraudcheck.triangular_patterns.id;


--
-- Name: triangular_patterns_old; Type: TABLE; Schema: fraudcheck; Owner: -
--

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


--
-- Name: user_phone_change_history; Type: TABLE; Schema: fraudcheck; Owner: -
--

CREATE TABLE fraudcheck.user_phone_change_history (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    total_changes integer,
    year_month date
);


--
-- Name: user_phone_change_history_id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: -
--

CREATE SEQUENCE fraudcheck.user_phone_change_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_phone_change_history_id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: -
--

ALTER SEQUENCE fraudcheck.user_phone_change_history_id_seq OWNED BY fraudcheck.user_phone_change_history.id;


--
-- Name: users_3_months_patterns; Type: TABLE; Schema: fraudcheck; Owner: -
--

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


--
-- Name: users_3_months_patterns_id_seq; Type: SEQUENCE; Schema: fraudcheck; Owner: -
--

CREATE SEQUENCE fraudcheck.users_3_months_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_3_months_patterns_id_seq; Type: SEQUENCE OWNED BY; Schema: fraudcheck; Owner: -
--

ALTER SEQUENCE fraudcheck.users_3_months_patterns_id_seq OWNED BY fraudcheck.users_3_months_patterns.id;


--
-- Name: labels _id; Type: DEFAULT; Schema: anomaly; Owner: -
--

ALTER TABLE ONLY anomaly.labels ALTER COLUMN _id SET DEFAULT nextval('anomaly.labels__id_seq'::regclass);


--
-- Name: labels _id; Type: DEFAULT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.labels ALTER COLUMN _id SET DEFAULT nextval('fraudcheck.labels__id_seq'::regclass);


--
-- Name: phone_insights id; Type: DEFAULT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.phone_insights ALTER COLUMN id SET DEFAULT nextval('fraudcheck.phone_insights_id_seq'::regclass);


--
-- Name: phone_insights_detailed id; Type: DEFAULT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.phone_insights_detailed ALTER COLUMN id SET DEFAULT nextval('fraudcheck.phone_insights_detailed_id_seq'::regclass);


--
-- Name: potential_triangular_patterns id; Type: DEFAULT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.potential_triangular_patterns ALTER COLUMN id SET DEFAULT nextval('fraudcheck.potential_triangular_patterns_id_seq'::regclass);


--
-- Name: triangular_patterns id; Type: DEFAULT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.triangular_patterns ALTER COLUMN id SET DEFAULT nextval('fraudcheck.triangular_patterns_id_seq'::regclass);


--
-- Name: user_phone_change_history id; Type: DEFAULT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.user_phone_change_history ALTER COLUMN id SET DEFAULT nextval('fraudcheck.user_phone_change_history_id_seq'::regclass);


--
-- Name: users_3_months_patterns id; Type: DEFAULT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.users_3_months_patterns ALTER COLUMN id SET DEFAULT nextval('fraudcheck.users_3_months_patterns_id_seq'::regclass);


--
-- Name: labels labels_pkey; Type: CONSTRAINT; Schema: anomaly; Owner: -
--

ALTER TABLE ONLY anomaly.labels
    ADD CONSTRAINT labels_pkey PRIMARY KEY (_id);


--
-- Name: labels labels_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.labels
    ADD CONSTRAINT labels_pkey PRIMARY KEY (_id);


--
-- Name: phone_insights_detailed phone_insights_detailed_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.phone_insights_detailed
    ADD CONSTRAINT phone_insights_detailed_pkey PRIMARY KEY (id);


--
-- Name: phone_insights phone_insights_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.phone_insights
    ADD CONSTRAINT phone_insights_pkey PRIMARY KEY (id);


--
-- Name: potential_triangular_patterns potential_triangular_patterns_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.potential_triangular_patterns
    ADD CONSTRAINT potential_triangular_patterns_pkey PRIMARY KEY (id);


--
-- Name: triangular_patterns triangular_patterns_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.triangular_patterns
    ADD CONSTRAINT triangular_patterns_pkey PRIMARY KEY (id);


--
-- Name: user_phone_change_history user_phone_change_history_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.user_phone_change_history
    ADD CONSTRAINT user_phone_change_history_pkey PRIMARY KEY (id);


--
-- Name: users_3_months_patterns users_3_months_patterns_pkey; Type: CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.users_3_months_patterns
    ADD CONSTRAINT users_3_months_patterns_pkey PRIMARY KEY (id);


--
-- Name: labels_carpool_id_label_idx; Type: INDEX; Schema: anomaly; Owner: -
--

CREATE UNIQUE INDEX labels_carpool_id_label_idx ON anomaly.labels USING btree (carpool_id, label);


--
-- Name: ebb9c3d63a1b9a41aff9baaee23a0a76; Type: INDEX; Schema: fraud; Owner: -
--

CREATE UNIQUE INDEX ebb9c3d63a1b9a41aff9baaee23a0a76 ON fraud.users_intraday_role_change_stats USING btree (user_identity_key);


--
-- Name: ebf5c71f506cce7cea619fcb5b5a118b; Type: INDEX; Schema: fraud; Owner: -
--

CREATE UNIQUE INDEX ebf5c71f506cce7cea619fcb5b5a118b ON fraud.users_statistics USING btree (user_identity_key);


--
-- Name: labels_carpool_id_label_idx; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX labels_carpool_id_label_idx ON fraudcheck.labels USING btree (carpool_id, label);


--
-- Name: oui_departure_date_end_date_unique_index; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX oui_departure_date_end_date_unique_index ON fraudcheck.phone_insights_detailed USING btree (operator_user_id, departure_date, end_date) WITH (deduplicate_items='true');


--
-- Name: phone_insights_detailed_phone_trunc_departure_date_end_date_idx; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX phone_insights_detailed_phone_trunc_departure_date_end_date_idx ON fraudcheck.phone_insights_detailed USING btree (phone_trunc, departure_date, end_date) WITH (deduplicate_items='true');


--
-- Name: phone_insights_phone_trunc_departure_date_end_date_idx; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX phone_insights_phone_trunc_departure_date_end_date_idx ON fraudcheck.phone_insights USING btree (phone_trunc, departure_date, end_date);


--
-- Name: potential_triangular_patterns_id_groupe_phone_trunc_idx; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX potential_triangular_patterns_id_groupe_phone_trunc_idx ON fraudcheck.potential_triangular_patterns USING btree (id, groupe, phone_trunc);


--
-- Name: pt_departure_date_end_date_unique_index; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX pt_departure_date_end_date_unique_index ON fraudcheck.triangular_patterns USING btree (phone_trunc, departure_date, end_date) WITH (deduplicate_items='true');


--
-- Name: triangular_patterns_phone_trunc_departure_date_end_date_idx; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX triangular_patterns_phone_trunc_departure_date_end_date_idx ON fraudcheck.triangular_patterns USING btree (phone_trunc, departure_date, end_date);


--
-- Name: users_3_months_patterns_id_phone_trunc_idx; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX users_3_months_patterns_id_phone_trunc_idx ON fraudcheck.users_3_months_patterns USING btree (id, phone_trunc);


--
-- Name: year_month_unique_index; Type: INDEX; Schema: fraudcheck; Owner: -
--

CREATE UNIQUE INDEX year_month_unique_index ON fraudcheck.user_phone_change_history USING btree (year_month) WITH (deduplicate_items='true');


--
-- Name: labels labels_carpool_id_fkey; Type: FK CONSTRAINT; Schema: anomaly; Owner: -
--

ALTER TABLE ONLY anomaly.labels
    ADD CONSTRAINT labels_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id) NOT VALID;


--
-- Name: labels labels_carpool_id_fkey; Type: FK CONSTRAINT; Schema: fraudcheck; Owner: -
--

ALTER TABLE ONLY fraudcheck.labels
    ADD CONSTRAINT labels_carpool_id_fkey FOREIGN KEY (carpool_id) REFERENCES carpool_v2.carpools(_id) NOT VALID;


--
-- PostgreSQL database dump complete
--

