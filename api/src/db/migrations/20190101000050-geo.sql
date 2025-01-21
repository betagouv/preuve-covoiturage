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
-- Name: geo; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA geo;


--
-- Name: get_by_code(character varying, smallint); Type: FUNCTION; Schema: geo; Owner: -
--

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


--
-- Name: get_by_point(double precision, double precision, smallint); Type: FUNCTION; Schema: geo; Owner: -
--

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


--
-- Name: get_closest_com(double precision, double precision, integer); Type: FUNCTION; Schema: geo; Owner: -
--

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


--
-- Name: get_closest_country(double precision, double precision); Type: FUNCTION; Schema: geo; Owner: -
--

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


--
-- Name: get_latest_by_code(character varying); Type: FUNCTION; Schema: geo; Owner: -
--

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


--
-- Name: get_latest_by_point(double precision, double precision); Type: FUNCTION; Schema: geo; Owner: -
--

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


--
-- Name: get_latest_millesime(); Type: FUNCTION; Schema: geo; Owner: -
--

CREATE FUNCTION geo.get_latest_millesime() RETURNS smallint
    LANGUAGE sql
    AS $$
      SELECT 
        max(year)
      FROM geo.perimeters
    $$;


--
-- Name: get_latest_millesime_or(smallint); Type: FUNCTION; Schema: geo; Owner: -
--

CREATE FUNCTION geo.get_latest_millesime_or(l smallint) RETURNS smallint
    LANGUAGE sql
    AS $_$
      SELECT max(year) as year FROM geo.perimeters WHERE year = $1
      UNION ALL
      SELECT max(year) as year FROM geo.perimeters
      ORDER BY year
      LIMIT 1
    $_$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: com_evolution; Type: TABLE; Schema: geo; Owner: -
--

CREATE TABLE geo.com_evolution (
    year smallint NOT NULL,
    mod smallint NOT NULL,
    old_com character varying(5),
    new_com character varying(5),
    l_mod character varying
);


--
-- Name: dataset_migration; Type: TABLE; Schema: geo; Owner: -
--

CREATE TABLE geo.dataset_migration (
    key character varying(128) NOT NULL,
    datetime timestamp without time zone DEFAULT now() NOT NULL,
    millesime smallint DEFAULT (date_part('year'::text, now()))::smallint NOT NULL
);


--
-- Name: perimeters; Type: TABLE; Schema: geo; Owner: -
--

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


--
-- Name: perimeters_centroid; Type: TABLE; Schema: geo; Owner: -
--

CREATE TABLE geo.perimeters_centroid (
    id integer NOT NULL,
    year integer NOT NULL,
    territory character varying NOT NULL,
    l_territory character varying NOT NULL,
    type character varying NOT NULL,
    geom public.geometry(Point,4326) NOT NULL
);


--
-- Name: perimeters_centroid_id_seq; Type: SEQUENCE; Schema: geo; Owner: -
--

CREATE SEQUENCE geo.perimeters_centroid_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: perimeters_centroid_id_seq; Type: SEQUENCE OWNED BY; Schema: geo; Owner: -
--

ALTER SEQUENCE geo.perimeters_centroid_id_seq OWNED BY geo.perimeters_centroid.id;


--
-- Name: perimeters_id_seq; Type: SEQUENCE; Schema: geo; Owner: -
--

CREATE SEQUENCE geo.perimeters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: perimeters_id_seq; Type: SEQUENCE OWNED BY; Schema: geo; Owner: -
--

ALTER SEQUENCE geo.perimeters_id_seq OWNED BY geo.perimeters.id;


--
-- Name: perimeters id; Type: DEFAULT; Schema: geo; Owner: -
--

ALTER TABLE ONLY geo.perimeters ALTER COLUMN id SET DEFAULT nextval('geo.perimeters_id_seq'::regclass);


--
-- Name: perimeters_centroid id; Type: DEFAULT; Schema: geo; Owner: -
--

ALTER TABLE ONLY geo.perimeters_centroid ALTER COLUMN id SET DEFAULT nextval('geo.perimeters_centroid_id_seq'::regclass);


--
-- Name: dataset_migration dataset_migration_pkey; Type: CONSTRAINT; Schema: geo; Owner: -
--

ALTER TABLE ONLY geo.dataset_migration
    ADD CONSTRAINT dataset_migration_pkey PRIMARY KEY (key);


--
-- Name: perimeters_centroid perimeters_centroid_pkey; Type: CONSTRAINT; Schema: geo; Owner: -
--

ALTER TABLE ONLY geo.perimeters_centroid
    ADD CONSTRAINT perimeters_centroid_pkey PRIMARY KEY (id);


--
-- Name: perimeters_centroid perimeters_centroid_unique_key; Type: CONSTRAINT; Schema: geo; Owner: -
--

ALTER TABLE ONLY geo.perimeters_centroid
    ADD CONSTRAINT perimeters_centroid_unique_key UNIQUE (year, territory, type);


--
-- Name: perimeters perimeters_pkey; Type: CONSTRAINT; Schema: geo; Owner: -
--

ALTER TABLE ONLY geo.perimeters
    ADD CONSTRAINT perimeters_pkey PRIMARY KEY (id);


--
-- Name: geo_com_evolution_mod_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_com_evolution_mod_index ON geo.com_evolution USING btree (mod);


--
-- Name: geo_com_evolution_new_com_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_com_evolution_new_com_index ON geo.com_evolution USING btree (new_com);


--
-- Name: geo_com_evolution_old_com_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_com_evolution_old_com_index ON geo.com_evolution USING btree (old_com);


--
-- Name: geo_perimeters_aom_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_aom_idx ON geo.perimeters USING btree (aom);


--
-- Name: geo_perimeters_arr_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_arr_idx ON geo.perimeters USING btree (arr);


--
-- Name: geo_perimeters_centroid_geom_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_centroid_geom_index ON geo.perimeters_centroid USING gist (geom);


--
-- Name: geo_perimeters_centroid_id_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_centroid_id_index ON geo.perimeters_centroid USING btree (id);


--
-- Name: geo_perimeters_centroid_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_centroid_index ON geo.perimeters USING gist (centroid);


--
-- Name: geo_perimeters_dep_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_dep_idx ON geo.perimeters USING btree (dep);


--
-- Name: geo_perimeters_epci_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_epci_idx ON geo.perimeters USING btree (epci);


--
-- Name: geo_perimeters_geom_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_geom_index ON geo.perimeters USING gist (geom);


--
-- Name: geo_perimeters_geom_simple_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_geom_simple_index ON geo.perimeters USING gist (geom_simple);


--
-- Name: geo_perimeters_id_index; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_id_index ON geo.perimeters USING btree (id);


--
-- Name: geo_perimeters_reg_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_reg_idx ON geo.perimeters USING btree (reg);


--
-- Name: geo_perimeters_surface_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_surface_idx ON geo.perimeters USING btree (surface);


--
-- Name: geo_perimeters_year_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX geo_perimeters_year_idx ON geo.perimeters USING btree (year);


--
-- Name: perimeters_com_idx; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX perimeters_com_idx ON geo.perimeters USING btree (com);


--
-- Name: tmp_country; Type: INDEX; Schema: geo; Owner: -
--

CREATE INDEX tmp_country ON geo.perimeters USING btree (country);


--
-- PostgreSQL database dump complete
--

