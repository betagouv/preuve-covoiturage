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
-- Name: cee; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA cee;


--
-- Name: application_error_enum; Type: TYPE; Schema: cee; Owner: -
--

CREATE TYPE cee.application_error_enum AS ENUM (
    'validation',
    'date',
    'non-eligible',
    'conflict'
);


--
-- Name: journey_type_enum; Type: TYPE; Schema: cee; Owner: -
--

CREATE TYPE cee.journey_type_enum AS ENUM (
    'short',
    'long'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cee_application_errors; Type: TABLE; Schema: cee; Owner: -
--

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


--
-- Name: cee_applications; Type: TABLE; Schema: cee; Owner: -
--

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

--
-- Name: cee_deleted_applications; Type: TABLE; Schema: cee; Owner: -
--

CREATE TABLE cee.cee_deleted_applications (
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
    deleted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
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


--
-- Name: labels; Type: TABLE; Schema: cee; Owner: -
--

CREATE TABLE cee.labels (
    _id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cee_application_id uuid NOT NULL,
    label character varying NOT NULL
);


--
-- Name: labels__id_seq; Type: SEQUENCE; Schema: cee; Owner: -
--

CREATE SEQUENCE cee.labels__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: labels__id_seq; Type: SEQUENCE OWNED BY; Schema: cee; Owner: -
--

ALTER SEQUENCE cee.labels__id_seq OWNED BY cee.labels._id;


--
-- Name: labels _id; Type: DEFAULT; Schema: cee; Owner: -
--

ALTER TABLE ONLY cee.labels ALTER COLUMN _id SET DEFAULT nextval('cee.labels__id_seq'::regclass);


--
-- Name: cee_application_errors cee_application_errors_pkey; Type: CONSTRAINT; Schema: cee; Owner: -
--

ALTER TABLE ONLY cee.cee_application_errors
    ADD CONSTRAINT cee_application_errors_pkey PRIMARY KEY (_id);


--
-- Name: cee_applications cee_applications_pkey; Type: CONSTRAINT; Schema: cee; Owner: -
--

ALTER TABLE ONLY cee.cee_applications
    ADD CONSTRAINT cee_applications_pkey PRIMARY KEY (_id);


--
-- Name: cee_deleted_applications cee_deleted_applications_pkey; Type: CONSTRAINT; Schema: cee; Owner: -
--

ALTER TABLE ONLY cee.cee_deleted_applications
    ADD CONSTRAINT cee_deleted_applications_pkey PRIMARY KEY (_id);


--
-- Name: labels labels__id_key; Type: CONSTRAINT; Schema: cee; Owner: -
--

ALTER TABLE ONLY cee.labels
    ADD CONSTRAINT labels__id_key UNIQUE (_id);


--
-- Name: cee_application_id_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_application_id_idx ON cee.labels USING btree (cee_application_id);


--
-- Name: cee_atype_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_atype_idx ON cee.cee_applications USING btree (is_specific);


--
-- Name: cee_datetime_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_datetime_idx ON cee.cee_applications USING btree (datetime);


--
-- Name: cee_deleted_applications_datetime_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_deleted_applications_datetime_idx ON cee.cee_deleted_applications USING btree (datetime);


--
-- Name: cee_deleted_applications_driving_license_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_deleted_applications_driving_license_idx ON cee.cee_deleted_applications USING btree (driving_license);


--
-- Name: cee_deleted_applications_identity_key_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_deleted_applications_identity_key_idx ON cee.cee_deleted_applications USING btree (identity_key);


--
-- Name: cee_deleted_applications_is_specific_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_deleted_applications_is_specific_idx ON cee.cee_deleted_applications USING btree (is_specific);


--
-- Name: cee_deleted_applications_journey_type_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_deleted_applications_journey_type_idx ON cee.cee_deleted_applications USING btree (journey_type);


--
-- Name: cee_deleted_applications_operator_id_journey_type_last_name_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE UNIQUE INDEX cee_deleted_applications_operator_id_journey_type_last_name_idx ON cee.cee_deleted_applications USING btree (operator_id, journey_type, last_name_trunc, phone_trunc) WHERE (is_specific = true);


--
-- Name: cee_deleted_applications_operator_id_operator_journey_id_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE UNIQUE INDEX cee_deleted_applications_operator_id_operator_journey_id_idx ON cee.cee_deleted_applications USING btree (operator_id, operator_journey_id) WHERE ((is_specific = false) AND (journey_type = 'short'::cee.journey_type_enum));


--
-- Name: cee_deleted_applications_phone_trunc_last_name_trunc_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_deleted_applications_phone_trunc_last_name_trunc_idx ON cee.cee_deleted_applications USING btree (phone_trunc, last_name_trunc);


--
-- Name: cee_error_datetime_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_error_datetime_idx ON cee.cee_application_errors USING btree (created_at);


--
-- Name: cee_identity_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_identity_idx ON cee.cee_applications USING btree (phone_trunc, last_name_trunc);


--
-- Name: cee_identity_key_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_identity_key_idx ON cee.cee_applications USING btree (identity_key);


--
-- Name: cee_jtype_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_jtype_idx ON cee.cee_applications USING btree (journey_type);


--
-- Name: cee_license_idx; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX cee_license_idx ON cee.cee_applications USING btree (driving_license);


--
-- Name: cee_operator_id_journey_type_is_specific_uniqueness; Type: INDEX; Schema: cee; Owner: -
--

CREATE UNIQUE INDEX cee_operator_id_journey_type_is_specific_uniqueness ON cee.cee_applications USING btree (operator_id, journey_type, last_name_trunc, phone_trunc) WHERE (is_specific = true);


--
-- Name: cee_operator_id_operator_journey_id_on_short; Type: INDEX; Schema: cee; Owner: -
--

CREATE UNIQUE INDEX cee_operator_id_operator_journey_id_on_short ON cee.cee_applications USING btree (operator_id, operator_journey_id) WHERE ((is_specific = false) AND (journey_type = 'short'::cee.journey_type_enum));


--
-- Name: idx_cee_deleted_applications_deleted_at; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX idx_cee_deleted_applications_deleted_at ON cee.cee_deleted_applications USING btree (deleted_at);


--
-- Name: idx_cee_deleted_applications_uuid; Type: INDEX; Schema: cee; Owner: -
--

CREATE INDEX idx_cee_deleted_applications_uuid ON cee.cee_deleted_applications USING btree (_id);


--
-- Name: cee_applications touch_cee_updated_at; Type: TRIGGER; Schema: cee; Owner: -
--

CREATE TRIGGER touch_cee_updated_at BEFORE UPDATE ON cee.cee_applications FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: cee_application_errors cee_application_errors_operator_id_fkey; Type: FK CONSTRAINT; Schema: cee; Owner: -
--

ALTER TABLE ONLY cee.cee_application_errors
    ADD CONSTRAINT cee_application_errors_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);


--
-- Name: cee_applications cee_applications_operator_id_fkey; Type: FK CONSTRAINT; Schema: cee; Owner: -
--

ALTER TABLE ONLY cee.cee_applications
    ADD CONSTRAINT cee_applications_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES operator.operators(_id);


--
-- PostgreSQL database dump complete
--

