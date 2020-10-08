--
-- PostgreSQL database dump
--

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
-- Name: tablefunc; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA public;


--
-- Name: EXTENSION tablefunc; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION tablefunc IS 'functions that manipulate whole tables, including crosstab';


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
-- Name: territory_level_name; Type: TYPE; Schema: territory; Owner: postgres
--

CREATE TYPE territory.territory_level_name AS (
	level territory.territory_level_enum,
	name character varying(128)
);


ALTER TYPE territory.territory_level_name OWNER TO postgres;

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
-- Name: get_codes(integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_codes(ids integer[]) RETURNS TABLE(territory_id integer, insee character varying[], postcode character varying[], codedep character varying[])
    LANGUAGE plpgsql
    AS $$

    BEGIN

    RETURN QUERY SELECT
      codes.territory_id,
      array_remove(array_agg(codes.insee), null) AS insee,
      array_remove(array_agg(codes.postcode),null) AS postcode,
      array_remove(array_agg(codes.codedep),null) AS codedep 
    FROM crosstab(
      'SELECT territory_codes.territory_id, territory_codes.type, territory_codes.value FROM territory.territory_codes order by territory_codes.type asc',
      'SELECT distinct territory_codes.type FROM territory.territory_codes order by territory_codes.type asc'
    ) AS codes(territory_id int, "insee" varchar, "postcode" varchar, "codedep" varchar)
    WHERE codes.territory_id = ANY(ids)
    GROUP BY codes.territory_id;

    END;
$$;


ALTER FUNCTION public.get_codes(ids integer[]) OWNER TO postgres;

--
-- Name: get_territory_view_data(integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_territory_view_data(ids integer[]) RETURNS TABLE(_id integer, active boolean, activable boolean, level territory.territory_level_enum, parent integer, children integer[], ancestors integer[], descendants integer[], insee character varying[], postcode character varying[], codedep character varying[], breadcrumb territory.breadcrumb)
    LANGUAGE plpgsql
    AS $$ 
BEGIN

RETURN QUERY WITH RECURSIVE
  root AS (
    SELECT
      t._id,
      array_remove(
        array_agg(
          distinct tr.parent_territory_id
        ),
        t._id
      ) AS parents,
      array_remove(
        array_agg(
            distinct tr.child_territory_id
        ),
        t._id
      ) AS children 
    FROM territory.territories AS t 
    LEFT JOIN territory.territory_relation AS tr 
      ON t._id = tr.parent_territory_id 
      OR t._id = tr.child_territory_id

     where t._id = ANY(ids)
    GROUP BY t._id
   
  )
  ,codes AS (
    SELECT
    territory_id,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'insee'), null) AS insee,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'postcode'), null) AS postcode,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'codedep'), null) AS codedep
    
FROM territory.territory_codes tc WHERE tc.territory_id = ANY(ids) GROUP BY tc.territory_id
  )
  ,input AS (
    SELECT 
      r._id,
      r.parents,
      r.children,
      d.insee,
      d.postcode,
      d.codedep
    FROM root AS r 
    LEFT JOIN codes AS d 
      ON r._id = d.territory_id 
    ORDER BY coalesce(array_length(r.children,1),0) ASC
  )
  ,complete_parent AS (
    SELECT t._id, t.parents FROM input AS t 
    UNION ALL 
    SELECT
      c._id,
      t.parents AS parents
    FROM input AS t 
    JOIN complete_parent AS c ON t._id = any(c.parents)
  )
  ,complete_children AS (
    SELECT t._id, t.children,t.insee,t.postcode,t.codedep FROM input AS t 
    UNION ALL 
    SELECT 
      c._id,
      t.children AS children,
      t.insee,
      t.postcode,
      t.codedep
    FROM input AS t 
    JOIN complete_children AS c ON t._id = any(c.children)
  )
  ,complete as (
       SELECT 
        cc._id,
        cc.children,
        cc.insee,
        cc.postcode,
        cc.codedep,
        cp.parents 
        
        FROM complete_children AS cc
       LEFT JOIN complete_parent cp ON cp._id = cc._id
  )
  ,agg AS (
    SELECT
        c._id,
        array_remove(array_remove(array_agg(distinct p), null), c._id) AS ancestors,
        array_remove(array_remove(array_agg(distinct b), null), c._id) AS descendants,
        array_remove(array_agg(distinct ins), null) AS insee,
        array_remove(array_agg(distinct pos), null) AS postcode,
        array_remove(array_agg(distinct cdp), null) AS codedep,
        array_remove(array_agg(distinct tr.child_territory_id), null)  AS children
        
    FROM complete AS c
    left JOIN unnest(c.parents) AS p ON true
    left JOIN unnest(c.children) AS b ON true 
    left JOIN unnest(c.insee) AS ins ON true 
    left JOIN unnest(c.postcode) AS pos ON true
    left JOIN unnest(c.codedep) AS cdp ON true
    left JOIN territory.territory_relation AS tr ON (tr.parent_territory_id = c._id)

    GROUP BY c._id
  )
  
  ,bc_array AS (
    SELECT 
    agg._id as territory_id,
    agg.ancestors
    
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'country') as country
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'countrygroup') as countrygroup
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'district') as district
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'megalopolis') as megalopolis
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'other') as other
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'region') as region
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'state') as state
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'town') as town
    ,(SELECT array_agg(row(tt.name)) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'towngroup') as towngroup

    FROM agg
  )

    SELECT
        a._id::int,
        t.active::boolean,
        t.activable::boolean,
        t.level::territory.territory_level_enum,
        (a.ancestors[array_length(a.ancestors, 1)])::int as parent,
        a.children::int[],
        a.ancestors::int[],
        a.descendants::int[],
        a.insee::varchar[],
        a.postcode::varchar[],
        a.codedep::varchar[]
        ,row(
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

    FROM agg AS a
    LEFT JOIN territory.territories AS t ON t._id = a._id
    LEFT JOIN bc_array AS bc ON bc.territory_id = a._id;


END;
$$;


ALTER FUNCTION public.get_territory_view_data(ids integer[]) OWNER TO postgres;

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
-- Name: touch_territory_view_on_territory_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_territory_view_on_territory_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM territory.territories_view where _id = OLD._id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE territory.territories_view SET active = NEW.active,activable = NEW.activable ,level = NEW.level WHERE _id = NEW._id;
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO territory.territories_view(_id,active,activable,level) VALUES(NEW._id,NEW.active,NEW.activable,NEW.level);
        RETURN NEW;
    END IF;
    RETURN NULL; 
END;
$$;


ALTER FUNCTION public.touch_territory_view_on_territory_change() OWNER TO postgres;

--
-- Name: touch_territory_view_on_territory_code_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_territory_view_on_territory_code_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(territory_id) AS ids from codes_old_table 
  )
  SELECT NULL FROM changed_ids INTO r  LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
    
  RETURN NEW;
END
$$;


ALTER FUNCTION public.touch_territory_view_on_territory_code_delete() OWNER TO postgres;

--
-- Name: touch_territory_view_on_territory_code_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_territory_view_on_territory_code_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(territory_id) AS ids from codes_new_table 
  )
  SELECT NULL FROM changed_ids INTO r LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
    
  RETURN NEW;
END
$$;


ALTER FUNCTION public.touch_territory_view_on_territory_code_insert() OWNER TO postgres;

--
-- Name: touch_territory_view_on_territory_code_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_territory_view_on_territory_code_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  r RECORD;
BEGIN
  WITH codess as(
    (select * from codes_old_table) 
    UNION ALL
    (select * from codes_new_table)
  ),
  changed_ids as (
      select DISTINCT array_agg(territory_id) AS ids from codess 
  )
  
  SELECT NULL FROM changed_ids INTO r LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
      
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.touch_territory_view_on_territory_code_update() OWNER TO postgres;

--
-- Name: touch_territory_view_on_territory_relation_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_territory_view_on_territory_relation_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relation_old_table 
  )
  SELECT NULL FROM changed_ids INTO r  LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
    
  RETURN NEW;
END
$$;


ALTER FUNCTION public.touch_territory_view_on_territory_relation_delete() OWNER TO postgres;

--
-- Name: touch_territory_view_on_territory_relation_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_territory_view_on_territory_relation_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relation_new_table 
  )
  SELECT NULL FROM changed_ids INTO r LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
    
  RETURN NEW;
END
$$;


ALTER FUNCTION public.touch_territory_view_on_territory_relation_insert() OWNER TO postgres;

--
-- Name: touch_territory_view_on_territory_relation_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_territory_view_on_territory_relation_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  r RECORD;
BEGIN
  WITH relations as(
    (select * from relation_old_table) 
    UNION ALL
    (select * from relation_new_table)
  ),
  changed_ids as (
      select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relations 
  )
  
  SELECT NULL FROM changed_ids INTO r LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
      
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.touch_territory_view_on_territory_relation_update() OWNER TO postgres;

--
-- Name:  territory.update_territory_view_data(integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public. territory.update_territory_view_data(ids integer[]) RETURNS void
    LANGUAGE plpgsql
    AS $$ 
BEGIN
  WITH tv as (
    SELECT * from get_territory_view_data(ids) 
  )
  UPDATE territory.territories_view
    SET 
        parent = tv.ancestors[array_length(tv.ancestors, 1)],
        children = tv.children,
        ancestors = tv.ancestors,
        descendants = tv.descendants,
        active = tv.active,
        activable = tv.activable,
        level = tv.level,
        insee = tv.insee,
        postcode = tv.postcode,
        codedep = tv.codedep,
        breadcrumb = tv.breadcrumb
    FROM
    tv
    WHERE
    territory.territories_view._id = tv._id;

    RETURN;
END
$$;


ALTER FUNCTION public. territory.update_territory_view_data(ids integer[]) OWNER TO postgres;

--
-- Name: CAST (territory.breadcrumb AS json); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (territory.breadcrumb AS json) WITH FUNCTION public.breadcrumb_to_json(territory.breadcrumb) AS ASSIGNMENT;


--
-- Name: CAST (json AS territory.breadcrumb); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (json AS territory.breadcrumb) WITH FUNCTION public.json_to_breadcrumb(json) AS ASSIGNMENT;


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
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    _id integer NOT NULL
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
    uuid uuid NOT NULL DEFAULT public.uuid_generate_v4(),
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
-- Name: territories_breadcrumb; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territories_breadcrumb (
    _id integer NOT NULL,
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


ALTER TABLE territory.territories_breadcrumb OWNER TO postgres;

--
-- Name: territories_breadcrumb__id_seq; Type: SEQUENCE; Schema: territory; Owner: postgres
--

CREATE SEQUENCE territory.territories_breadcrumb__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE territory.territories_breadcrumb__id_seq OWNER TO postgres;

--
-- Name: territories_breadcrumb__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: postgres
--

ALTER SEQUENCE territory.territories_breadcrumb__id_seq OWNED BY territory.territories_breadcrumb._id;


--
-- Name: territories_view; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territories_view (
    _id integer NOT NULL,
    active boolean DEFAULT false NOT NULL,
    activable boolean DEFAULT false NOT NULL,
    level territory.territory_level_enum NOT NULL,
    parent integer,
    children integer[] DEFAULT ARRAY[]::integer[],
    ancestors integer[] DEFAULT ARRAY[]::integer[],
    descendants integer[] DEFAULT ARRAY[]::integer[],
    insee character varying[] DEFAULT ARRAY[]::character varying[],
    postcode character varying[] DEFAULT ARRAY[]::character varying[],
    codedep character varying[] DEFAULT ARRAY[]::character varying[],
    breadcrumb territory.breadcrumb
);


ALTER TABLE territory.territories_view OWNER TO postgres;

--
-- Name: territories_view__id_seq; Type: SEQUENCE; Schema: territory; Owner: postgres
--

CREATE SEQUENCE territory.territories_view__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE territory.territories_view__id_seq OWNER TO postgres;

--
-- Name: territories_view__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: postgres
--

ALTER SEQUENCE territory.territories_view__id_seq OWNED BY territory.territories_view._id;


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
-- Name: territories_view_test; Type: VIEW; Schema: territory; Owner: postgres
--

CREATE VIEW territory.territories_view_test AS
 WITH RECURSIVE root AS (
         SELECT t_1._id,
            array_remove(array_agg(DISTINCT tr.parent_territory_id), t_1._id) AS parents,
            array_remove(array_agg(DISTINCT tr.child_territory_id), t_1._id) AS children
           FROM (territory.territories t_1
             LEFT JOIN territory.territory_relation tr ON (((t_1._id = tr.parent_territory_id) OR (t_1._id = tr.child_territory_id))))
          GROUP BY t_1._id
        ), codes AS (
         SELECT crosstab.territory_id,
            array_remove(array_agg(crosstab.insee), NULL::character varying) AS insee,
            array_remove(array_agg(crosstab.postcode), NULL::character varying) AS postcode
           FROM public.crosstab('SELECT territory_id, type, value FROM territory.territory_codes order by type asc'::text, 'SELECT distinct type FROM territory.territory_codes order by type asc'::text) crosstab(territory_id integer, insee character varying, postcode character varying, codedep character varying)
          GROUP BY crosstab.territory_id
        ), input AS (
         SELECT r._id,
            r.parents,
            r.children,
            d.insee,
            d.postcode
           FROM (root r
             LEFT JOIN codes d ON ((r._id = d.territory_id)))
          ORDER BY COALESCE(array_length(r.children, 1), 0)
        ), complete_parent AS (
         SELECT t_1._id,
            t_1.parents
           FROM input t_1
        UNION ALL
         SELECT c._id,
            t_1.parents
           FROM (input t_1
             JOIN complete_parent c ON ((t_1._id = ANY (c.parents))))
        ), complete_children AS (
         SELECT t_1._id,
            t_1.children,
            t_1.insee,
            t_1.postcode
           FROM input t_1
        UNION ALL
         SELECT c._id,
            t_1.children,
            t_1.insee,
            t_1.postcode
           FROM (input t_1
             JOIN complete_children c ON ((t_1._id = ANY (c.children))))
        ), complete AS (
         SELECT cc._id,
            cc.children,
            cc.insee,
            cc.postcode,
            cp.parents
           FROM (complete_children cc
             LEFT JOIN complete_parent cp ON ((cp._id = cc._id)))
        ), agg AS (
         SELECT c._id,
            array_remove(array_remove(array_agg(DISTINCT p.p), NULL::integer), c._id) AS ancestors,
            array_remove(array_remove(array_agg(DISTINCT b.b), NULL::integer), c._id) AS descendants,
            array_remove(array_agg(DISTINCT ins.ins), NULL::character varying) AS insee,
            array_remove(array_agg(DISTINCT pos.pos), NULL::character varying) AS postcode,
            array_remove(array_agg(DISTINCT tr.child_territory_id), NULL::integer) AS children
           FROM (((((complete c
             LEFT JOIN LATERAL unnest(c.parents) p(p) ON (true))
             LEFT JOIN LATERAL unnest(c.children) b(b) ON (true))
             LEFT JOIN LATERAL unnest(c.insee) ins(ins) ON (true))
             LEFT JOIN LATERAL unnest(c.postcode) pos(pos) ON (true))
             LEFT JOIN territory.territory_relation tr ON ((tr.parent_territory_id = c._id)))
          GROUP BY c._id
        )
 SELECT a._id,
    t.active,
    t.level,
    a.ancestors[array_length(a.ancestors, 1)] AS parent,
    a.children,
    a.ancestors,
    a.descendants,
    a.insee,
    a.postcode
   FROM (agg a
     LEFT JOIN territory.territories t ON ((t._id = a._id)));


ALTER TABLE territory.territories_view_test OWNER TO postgres;

--
-- Name: territory_cache; Type: TABLE; Schema: territory; Owner: postgres
--

CREATE TABLE territory.territory_cache (
    _id integer NOT NULL,
    active boolean DEFAULT false NOT NULL,
    activable boolean DEFAULT false NOT NULL,
    level territory.territory_level_enum NOT NULL,
    parent integer,
    children integer[] DEFAULT ARRAY[]::integer[],
    ancestors integer[] DEFAULT ARRAY[]::integer[],
    descendants integer[] DEFAULT ARRAY[]::integer[],
    insee character varying[] DEFAULT ARRAY[]::character varying[],
    postcode character varying[] DEFAULT ARRAY[]::character varying[],
    codedep character varying[] DEFAULT ARRAY[]::character varying[]
);


ALTER TABLE territory.territory_cache OWNER TO postgres;

--
-- Name: territory_cache__id_seq; Type: SEQUENCE; Schema: territory; Owner: postgres
--

CREATE SEQUENCE territory.territory_cache__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE territory.territory_cache__id_seq OWNER TO postgres;

--
-- Name: territory_cache__id_seq; Type: SEQUENCE OWNED BY; Schema: territory; Owner: postgres
--

ALTER SEQUENCE territory.territory_cache__id_seq OWNED BY territory.territory_cache._id;


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
-- Name: companies _id; Type: DEFAULT; Schema: company; Owner: postgres
--

ALTER TABLE ONLY company.companies ALTER COLUMN _id SET DEFAULT nextval('company.companies__id_seq'::regclass);


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

ALTER TABLE ONLY territory.territories ALTER COLUMN _id SET DEFAULT nextval('territory.territories__id_seq1'::regclass);


--
-- Name: territories_breadcrumb _id; Type: DEFAULT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories_breadcrumb ALTER COLUMN _id SET DEFAULT nextval('territory.territories_breadcrumb__id_seq'::regclass);


--
-- Name: territories_view _id; Type: DEFAULT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories_view ALTER COLUMN _id SET DEFAULT nextval('territory.territories_view__id_seq'::regclass);


--
-- Name: territory_cache _id; Type: DEFAULT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_cache ALTER COLUMN _id SET DEFAULT nextval('territory.territory_cache__id_seq'::regclass);


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
    ADD CONSTRAINT companies_pkey PRIMARY KEY (_id);


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
-- Name: territories_breadcrumb territories_breadcrumb_pkey; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories_breadcrumb
    ADD CONSTRAINT territories_breadcrumb_pkey PRIMARY KEY (_id);


--
-- Name: territories territories_pkey1; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories
    ADD CONSTRAINT territories_pkey1 PRIMARY KEY (_id);


--
-- Name: territories_view territories_view_pkey; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territories_view
    ADD CONSTRAINT territories_view_pkey PRIMARY KEY (_id);


--
-- Name: territory_cache territory_cache_pkey; Type: CONSTRAINT; Schema: territory; Owner: postgres
--

ALTER TABLE ONLY territory.territory_cache
    ADD CONSTRAINT territory_cache_pkey PRIMARY KEY (_id);


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
-- Name: acquisitions_application_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX acquisitions_application_id_idx ON acquisition.acquisitions USING btree (application_id);


--
-- Name: acquisitions_operator_id_journey_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE UNIQUE INDEX acquisitions_operator_id_journey_id_idx ON acquisition.acquisitions USING btree (operator_id, journey_id);


--
-- Name: errors_operator_id_idx; Type: INDEX; Schema: acquisition; Owner: postgres
--

CREATE INDEX errors_operator_id_idx ON acquisition.errors USING btree (operator_id);


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
-- Name: companies_siret_idx; Type: INDEX; Schema: company; Owner: postgres
--

CREATE UNIQUE INDEX companies_siret_idx ON company.companies USING btree (siret);


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
-- Name: territories_breadcrumb__id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territories_breadcrumb__id_idx ON territory.territories_breadcrumb USING btree (_id);


--
-- Name: territories_geo_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territories_geo_idx ON territory.territories USING gist (geo);


--
-- Name: territories_view__id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territories_view__id_idx ON territory.territories_view USING btree (_id);


--
-- Name: territory_cache__id_idx; Type: INDEX; Schema: territory; Owner: postgres
--

CREATE INDEX territory_cache__id_idx ON territory.territory_cache USING btree (_id);


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
-- Name: stat_cache_is_public_territory_id_operator_id_idx; Type: INDEX; Schema: trip; Owner: postgres
--

CREATE UNIQUE INDEX stat_cache_is_public_territory_id_operator_id_idx ON trip.stat_cache USING btree (is_public, territory_id, operator_id);


--
-- Name: users touch_users_updated_at; Type: TRIGGER; Schema: auth; Owner: postgres
--

CREATE TRIGGER touch_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: identities touch_identities_updated_at; Type: TRIGGER; Schema: carpool; Owner: postgres
--

CREATE TRIGGER touch_identities_updated_at BEFORE UPDATE ON carpool.identities FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: certificates touch_certificates_updated_at; Type: TRIGGER; Schema: certificate; Owner: postgres
--

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: fraudchecks touch_fraudchecks_updated_at; Type: TRIGGER; Schema: fraudcheck; Owner: postgres
--

CREATE TRIGGER touch_fraudchecks_updated_at BEFORE UPDATE ON fraudcheck.fraudchecks FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: operators touch_operators_updated_at; Type: TRIGGER; Schema: operator; Owner: postgres
--

CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: policies touch_policies_updated_at; Type: TRIGGER; Schema: policy; Owner: postgres
--

CREATE TRIGGER touch_policies_updated_at BEFORE UPDATE ON policy.policies FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: policy_metas touch_policy_meta_updated_at; Type: TRIGGER; Schema: policy; Owner: postgres
--

CREATE TRIGGER touch_policy_meta_updated_at BEFORE UPDATE ON policy.policy_metas FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: territory_codes territory_codes_del; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER territory_codes_del AFTER DELETE ON territory.territory_codes REFERENCING OLD TABLE AS codes_old_table FOR EACH STATEMENT EXECUTE FUNCTION public.touch_territory_view_on_territory_code_delete();


--
-- Name: territory_codes territory_codes_ins; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER territory_codes_ins AFTER INSERT ON territory.territory_codes REFERENCING NEW TABLE AS codes_new_table FOR EACH STATEMENT EXECUTE FUNCTION public.touch_territory_view_on_territory_code_insert();


--
-- Name: territory_codes territory_codes_upd; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER territory_codes_upd AFTER UPDATE ON territory.territory_codes REFERENCING OLD TABLE AS codes_old_table NEW TABLE AS codes_new_table FOR EACH STATEMENT EXECUTE FUNCTION public.touch_territory_view_on_territory_code_update();


--
-- Name: territory_relation territory_relation_del; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER territory_relation_del AFTER DELETE ON territory.territory_relation REFERENCING OLD TABLE AS relation_old_table FOR EACH STATEMENT EXECUTE FUNCTION public.touch_territory_view_on_territory_relation_delete();


--
-- Name: territory_relation territory_relation_ins; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER territory_relation_ins AFTER INSERT ON territory.territory_relation REFERENCING NEW TABLE AS relation_new_table FOR EACH STATEMENT EXECUTE FUNCTION public.touch_territory_view_on_territory_relation_insert();


--
-- Name: territory_relation territory_relation_upd; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER territory_relation_upd AFTER UPDATE ON territory.territory_relation REFERENCING OLD TABLE AS relation_old_table NEW TABLE AS relation_new_table FOR EACH STATEMENT EXECUTE FUNCTION public.touch_territory_view_on_territory_relation_update();


--
-- Name: territories touch_territories_updated_at; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE FUNCTION common.touch_updated_at();


--
-- Name: territories touch_territory_view_on_territory_change; Type: TRIGGER; Schema: territory; Owner: postgres
--

CREATE TRIGGER touch_territory_view_on_territory_change AFTER INSERT OR DELETE OR UPDATE ON territory.territories FOR EACH ROW EXECUTE FUNCTION public.touch_territory_view_on_territory_change();


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

