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
-- Name: dashboard_stats; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA dashboard_stats;


--
-- Name: geo_stats; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA geo_stats;


--
-- Name: observatoire_stats; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA observatoire_stats;


--
-- Name: observatory; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA observatory;


--
-- Name: monthly_distribution_direction_enum; Type: TYPE; Schema: observatory; Owner: -
--

CREATE TYPE observatory.monthly_distribution_direction_enum AS ENUM (
    'from',
    'to'
);


--
-- Name: monthly_distribution_type_enum; Type: TYPE; Schema: observatory; Owner: -
--

CREATE TYPE observatory.monthly_distribution_type_enum AS ENUM (
    'arr',
    'com',
    'epci',
    'aom',
    'dep',
    'reg',
    'country'
);


--
-- Name: monthly_flux_type_enum; Type: TYPE; Schema: observatory; Owner: -
--

CREATE TYPE observatory.monthly_flux_type_enum AS ENUM (
    'arr',
    'com',
    'epci',
    'aom',
    'dep',
    'reg',
    'country'
);


--
-- Name: monthly_occupation_type_enum; Type: TYPE; Schema: observatory; Owner: -
--

CREATE TYPE observatory.monthly_occupation_type_enum AS ENUM (
    'arr',
    'com',
    'epci',
    'aom',
    'dep',
    'reg',
    'country'
);


--
-- Name: fill_rate(text, text); Type: FUNCTION; Schema: observatoire_stats; Owner: -
--

CREATE OR REPLACE FUNCTION observatoire_stats.fill_rate(_schema_name text, _table_name text) RETURNS TABLE(out_column_name text, fill_rate numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    col RECORD;
    total_rows INTEGER;
    query TEXT;
BEGIN
    -- Compter le nombre total de lignes dans la table
    EXECUTE format('SELECT COUNT(*) FROM %I.%I', _schema_name, _table_name) INTO total_rows;

    -- Boucle sur chaque colonne nullable de la table
    FOR col IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = _schema_name
          AND table_name = _table_name
          AND is_nullable = 'YES'
    LOOP
        -- Construire une requête dynamique pour calculer le taux de remplissage pour chaque colonne
        query := format('
            SELECT %L AS out_column_name, 
                   (COUNT(%I) * 100.0 / %s) AS fill_rate
            FROM %I.%I', col.column_name, col.column_name, total_rows, _schema_name, _table_name);

        -- Exécuter la requête dynamique et retourner le résultat
        RETURN QUERY EXECUTE query;
    END LOOP;

    -- Si aucune colonne n'est trouvée, retourner une table vide
    RETURN;
END;
$$;


--
-- Name: first_fill_dates(text, text, text); Type: FUNCTION; Schema: observatoire_stats; Owner: -
--

CREATE OR REPLACE FUNCTION observatoire_stats.first_fill_dates(_schema_name text, _table_name text, _date_column text) RETURNS TABLE(out_column_name text, first_filled_date timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
DECLARE
    col RECORD;
    query TEXT;
    date_column_exists BOOLEAN;
BEGIN
    -- Vérifier que la colonne de date spécifiée existe dans la table
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = _schema_name
          AND table_name = _table_name
          AND column_name = _date_column
    ) INTO date_column_exists;

    IF NOT date_column_exists THEN
        RAISE EXCEPTION 'La colonne "%" est manquante dans la table %.%', _date_column, _schema_name, _table_name;
    END IF;

    -- Boucle sur chaque colonne nullable de la table
    FOR col IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = _schema_name
          AND table_name = _table_name
          AND is_nullable = 'YES'
    LOOP
        -- Construire une requête dynamique pour chaque colonne
        query := format('
            SELECT %L AS out_column_name, MIN(%I) AS first_filled_date
            FROM %I.%I
            WHERE %I IS NOT NULL', col.column_name, _date_column, _schema_name, _table_name, col.column_name);

        -- Exécuter la requête dynamique et retourner le résultat
        RETURN QUERY EXECUTE query;
    END LOOP;
END;
$$;


--
-- Name: insert_monthly_distribution(integer, integer); Type: PROCEDURE; Schema: observatory; Owner: -
--

CREATE PROCEDURE observatory.insert_monthly_distribution(IN year integer, IN month integer)
    LANGUAGE plpgsql
    AS $_$
  DECLARE
  sql text;
  BEGIN
  sql := '
  CREATE TEMP TABLE temp_distribution as (
    WITH perim as (
      SELECT territory,
      l_territory,
      type
      FROM geo.perimeters_centroid
      WHERE year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      UNION ALL
      SELECT territory,
      l_territory,
      ''com'' as type
      FROM geo.perimeters_centroid
      WHERE year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      AND type = ''country''
      AND territory <>''XXXXX''
    ),
    triplist as (
      SELECT 
      a.acquisition_id AS journey_id,
      a.trip_id,
      CASE WHEN a.start_geo_code ~ ''^97[1-2]'' THEN a.datetime::timestamptz AT TIME ZONE ''America/Guadeloupe''
        WHEN a.start_geo_code ~ ''^973'' THEN a.datetime::timestamptz AT TIME ZONE ''America/Guyana''
        WHEN a.start_geo_code ~ ''^974'' THEN a.datetime::timestamptz AT TIME ZONE ''Indian/Reunion''
        WHEN a.start_geo_code ~ ''^976'' THEN a.datetime::timestamptz AT TIME ZONE ''Indian/Mayotte''
        ELSE a.datetime::timestamptz AT TIME ZONE ''Europe/Paris'' 
      END AS journey_start_datetime,
      st_x(a.start_position::geometry)::numeric AS journey_start_lon,
      st_y(a.start_position::geometry)::numeric AS journey_start_lat,
      cts.arr AS journey_start_insee,
      CASE WHEN a.start_geo_code ~ ''^97[1-2]'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''America/Guadeloupe''
        WHEN a.start_geo_code ~ ''^973'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''America/Guyana''
        WHEN a.start_geo_code ~ ''^974'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Indian/Reunion''
        WHEN a.start_geo_code ~ ''^976'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Indian/Mayotte''
        ELSE (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Europe/Paris'' 
      END AS journey_end_datetime,
      st_x(a.end_position::geometry)::numeric AS journey_end_lon,
      st_y(a.end_position::geometry)::numeric AS journey_end_lat,
      cte.arr AS journey_end_insee,
      CASE
        WHEN a.distance IS NOT NULL THEN a.distance
        ELSE (a.meta ->> ''calc_distance''::text)::integer
      END AS journey_distance,
      CASE
        WHEN a.duration IS NOT NULL THEN a.duration
        ELSE (a.meta ->> ''calc_duration''::text)::integer
      END AS journey_duration,
      b.name AS operator,
      a.operator_class,
      a.seats AS passenger_seats,
      f.incentive AS passenger_incentive_raw,
      d.incentive_raw AS passenger_incentive_rpc_raw,
      g.incentive AS driver_incentive_raw,
      e.incentive_raw AS driver_incentive_rpc_raw
    FROM carpool.carpools a
      JOIN operator.operators b ON b._id = a.operator_id
      LEFT JOIN carpool.carpools c ON c.acquisition_id = a.acquisition_id AND c.is_driver = true
      LEFT JOIN geo.perimeters cts ON cts.arr::text = a.start_geo_code::text AND cts.year = geo.get_latest_millesime_or(date_part(''year''::text, a.datetime)::smallint)
      LEFT JOIN geo.perimeters cte ON cte.arr::text = a.end_geo_code::text AND cte.year = geo.get_latest_millesime_or(date_part(''year''::text, a.datetime)::smallint),
      LATERAL ( WITH data AS (
                  SELECT pi.policy_id,
                      sum(pi.amount) AS amount
                    FROM policy.incentives pi
                    WHERE pi.carpool_id = a._id AND pi.status = ''validated''::policy.incentive_status_enum
                    GROUP BY pi.policy_id
                  ), incentive AS (
                  SELECT data.policy_id,
                      ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying) AS value,
                      data.amount,
                          CASE
                              WHEN pp.unit = ''point''::policy.policy_unit_enum THEN false
                              ELSE true
                          END AS financial
                    FROM data
                      LEFT JOIN policy.policies pp ON pp._id = data.policy_id
                      LEFT JOIN territory.territories tt ON pp.territory_id = tt._id
                      LEFT JOIN company.companies cc ON cc._id = tt.company_id
                  )
          SELECT array_agg(incentive.value) AS incentive_raw,
              sum(incentive.amount) AS incentive_sum,
              sum(incentive.amount) FILTER (WHERE incentive.financial IS TRUE) AS incentive_financial_sum,
              array_agg(incentive.policy_id) AS policy_id
            FROM incentive) as d,
      LATERAL ( WITH data AS (
                  SELECT pi.policy_id,
                      sum(pi.amount) AS amount
                    FROM policy.incentives pi
                    WHERE pi.carpool_id = c._id AND pi.status = ''validated''::policy.incentive_status_enum
                    GROUP BY pi.policy_id
                  ), incentive AS (
                  SELECT data.policy_id,
                      ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying) AS value,
                      data.amount,
                          CASE
                              WHEN pp.unit = ''point''::policy.policy_unit_enum THEN false
                              ELSE true
                          END AS financial
                    FROM data
                      LEFT JOIN policy.policies pp ON pp._id = data.policy_id
                      LEFT JOIN territory.territories tt ON pp.territory_id = tt._id
                      LEFT JOIN company.companies cc ON cc._id = tt.company_id
                  )
          SELECT array_agg(incentive.value) AS incentive_raw,
              sum(incentive.amount) AS incentive_sum,
              sum(incentive.amount) FILTER (WHERE incentive.financial IS TRUE) AS incentive_financial_sum,
              array_agg(incentive.policy_id) AS policy_id
            FROM incentive) as e,
      LATERAL ( SELECT array_agg(json_array_elements.value) AS incentive
            FROM json_array_elements(a.meta -> ''payments''::text) json_array_elements(value)) as f,
      LATERAL ( SELECT array_agg(json_array_elements.value) AS incentive
            FROM json_array_elements(c.meta -> ''payments''::text) json_array_elements(value)) as g
      WHERE a.is_driver = false
      AND a.status = ''ok''
      AND date_part(''year'', a.datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $1 ||'
      AND date_part(''month'', a.datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $2 ||'
    ),
    journeys as (
      SELECT 
      journey_id,
      journey_start_insee as insee,
      ''from'' as direction,
      date_part(''hour'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') as hour,
      CASE WHEN journey_distance < 10000 then ''0-10''
        WHEN (journey_distance >= 10000 AND journey_distance < 20000) THEN ''10-20''
        WHEN (journey_distance >= 20000 AND journey_distance < 30000) THEN ''20-30''
        WHEN (journey_distance >= 30000 AND journey_distance < 40000) THEN ''30-40''
        WHEN (journey_distance >= 40000 AND journey_distance < 50000) THEN ''40-50''
      ELSE ''>50'' END as dist_classes
      FROM triplist
      UNION ALL
      SELECT
      journey_id,
      journey_end_insee as insee,
      ''to'' as direction,
      date_part(''hour'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') as hour,
      CASE WHEN journey_distance < 10000 then ''0-10''
        WHEN (journey_distance >= 10000 AND journey_distance < 20000) THEN ''10-20''
        WHEN (journey_distance >= 20000 AND journey_distance < 30000) THEN ''20-30''
        WHEN (journey_distance >= 30000 AND journey_distance < 40000) THEN ''30-40''
        WHEN (journey_distance >= 40000 AND journey_distance < 50000) THEN ''40-50''
      ELSE ''>50'' END as dist_classes
      FROM triplist
    ),
    sum_hours as(
      SELECT 
      territory,
      ''com'' as type,
      direction,
      json_agg(json_build_object(''hour'',hour,''journeys'',journeys)) as hours
      FROM (
        SELECT
        insee as territory,
        direction,
        hour,
        COUNT(*) AS journeys
        FROM	journeys
        GROUP BY insee,direction,hour
		HAVING insee IS NOT NULL
        ORDER BY insee,direction,hour
      ) t
      GROUP BY territory, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''hour'',hour,''journeys'',journeys)) as hours
      FROM (
        SELECT
        b.epci as territory,
        ''epci'' as type,
        a.direction,
        a.hour,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.epci, a.direction, a.hour
        HAVING b.epci IS NOT NULL
        ORDER BY b.epci, a.direction, a.hour
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''hour'',hour,''journeys'',journeys)) as hours
      FROM (
        SELECT
        b.aom as territory,
        ''aom'' as type,
        a.direction,
        a.hour,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.aom, a.direction, a.hour
        HAVING b.aom IS NOT NULL
        ORDER BY b.aom, a.direction, a.hour
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''hour'',hour,''journeys'',journeys)) as hours
      FROM (
        SELECT
        b.dep as territory,
        ''dep'' as type,
        a.direction,
        a.hour,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.dep, a.direction, a.hour
        HAVING b.dep IS NOT NULL
        ORDER BY b.dep, a.direction, a.hour
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''hour'',hour,''journeys'',journeys)) as hours
      FROM (
        SELECT
        b.reg as territory,
        ''reg'' as type,
        a.direction,
        a.hour,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.reg, a.direction, a.hour
        HAVING b.reg IS NOT NULL
        ORDER BY b.reg, a.direction, a.hour
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''hour'',hour,''journeys'',journeys)) as hours
      FROM (
        SELECT
        b.country as territory,
        ''country'' as type,
        a.direction,
        a.hour,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.country, a.direction, a.hour
        HAVING b.country IS NOT NULL
        ORDER BY b.country, a.direction, a.hour
      ) t
      GROUP BY territory, type, direction
    ),
    sum_distances as (
      SELECT 
      territory,
      ''com'' as type,
      direction,
      json_agg(json_build_object(''dist_classes'',dist_classes,''journeys'',journeys)) as distances
      FROM (
        SELECT
        insee as territory,
        direction,
        dist_classes,
        COUNT(*) AS journeys
        FROM	journeys
        GROUP BY insee,direction,dist_classes
        ORDER BY insee,direction,dist_classes
      ) t
      GROUP BY territory, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''dist_classes'',dist_classes,''journeys'',journeys)) as distances
      FROM (
        SELECT
        b.epci as territory,
        ''epci'' as type,
        a.direction,
        a.dist_classes,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.epci, a.direction, a.dist_classes
        HAVING b.epci IS NOT NULL
        ORDER BY b.epci, a.direction, a.dist_classes
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''dist_classes'',dist_classes,''journeys'',journeys)) as distances
      FROM (
        SELECT
        b.aom as territory,
        ''aom'' as type,
        a.direction,
        a.dist_classes,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.aom, a.direction, a.dist_classes
        HAVING b.aom IS NOT NULL
        ORDER BY b.aom, a.direction, a.dist_classes
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''dist_classes'',dist_classes,''journeys'',journeys)) as distances
      FROM (
        SELECT
        b.dep as territory,
        ''dep'' as type,
        a.direction,
        a.dist_classes,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.dep, a.direction, a.dist_classes
        HAVING b.dep IS NOT NULL
        ORDER BY b.dep, a.direction, a.dist_classes
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''dist_classes'',dist_classes,''journeys'',journeys)) as distances
      FROM (
        SELECT
        b.reg as territory,
        ''reg'' as type,
        a.direction,
        a.dist_classes,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.reg, a.direction, a.dist_classes
        HAVING b.reg IS NOT NULL
        ORDER BY b.reg, a.direction, a.dist_classes
      ) t
      GROUP BY territory, type, direction
      UNION ALL
      SELECT
      territory,
      type,
      direction,
      json_agg(json_build_object(''dist_classes'',dist_classes,''journeys'',journeys)) as distances
      FROM (
        SELECT
        b.country as territory,
        ''country'' as type,
        a.direction,
        a.dist_classes,
        COUNT(*) AS journeys
        FROM	journeys a
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY b.country, a.direction, a.dist_classes
        HAVING b.country IS NOT NULL
        ORDER BY b.country, a.direction, a.dist_classes
      ) t
      GROUP BY territory, type, direction
    )
    SELECT '|| $1 ||' as year,
      '|| $2 ||' as month,
      a.territory,
      c.l_territory,
      a.type::observatory.monthly_distribution_type_enum,
      a.direction::observatory.monthly_distribution_direction_enum,
      a.hours,
      b.distances
    FROM sum_hours a
    LEFT JOIN sum_distances b on a.territory = b.territory and a.direction = b.direction and a.type = b.type
    LEFT JOIN perim c on a.territory=c.territory and a.type=c.type
    );
  ';
  EXECUTE sql;
  INSERT INTO observatory.monthly_distribution (
    year,
    month,
    territory,
    l_territory,
    type,
    direction,
    hours,
    distances
  )
  SELECT * FROM temp_distribution
  ON CONFLICT 
  ON CONSTRAINT monthly_distribution_unique_key
  DO NOTHING;
  DROP TABLE temp_distribution;
  END
$_$;


--
-- Name: insert_monthly_flux(integer, integer); Type: PROCEDURE; Schema: observatory; Owner: -
--

CREATE PROCEDURE observatory.insert_monthly_flux(IN year integer, IN month integer)
    LANGUAGE plpgsql
    AS $_$
  DECLARE
  sql text;
  BEGIN
  sql := '
    CREATE TEMP TABLE temp_flux as (
      WITH perim as (
        SELECT territory,
        l_territory,
        type,
        ROUND(st_x(geom)::numeric,6) as lng,
        ROUND(st_y(geom)::numeric,6) as lat
        FROM geo.perimeters_centroid
        WHERE year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        UNION
        SELECT territory,
        l_territory,
        ''com'' as type,
        ROUND(st_x(geom)::numeric,6) as lng,
        ROUND(st_y(geom)::numeric,6) as lat
        FROM geo.perimeters_centroid
        WHERE year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        AND type = ''country''
        AND territory <>''XXXXX''
      ),
      triplist as (
        SELECT 
        a.acquisition_id AS journey_id,
        a.trip_id,
        CASE WHEN a.start_geo_code ~ ''^97[1-2]'' THEN a.datetime::timestamptz AT TIME ZONE ''America/Guadeloupe''
          WHEN a.start_geo_code ~ ''^973'' THEN a.datetime::timestamptz AT TIME ZONE ''America/Guyana''
          WHEN a.start_geo_code ~ ''^974'' THEN a.datetime::timestamptz AT TIME ZONE ''Indian/Reunion''
          WHEN a.start_geo_code ~ ''^976'' THEN a.datetime::timestamptz AT TIME ZONE ''Indian/Mayotte''
          ELSE a.datetime::timestamptz AT TIME ZONE ''Europe/Paris'' 
        END AS journey_start_datetime,
        st_x(a.start_position::geometry)::numeric AS journey_start_lon,
        st_y(a.start_position::geometry)::numeric AS journey_start_lat,
        cts.arr AS journey_start_insee,
        CASE WHEN a.start_geo_code ~ ''^97[1-2]'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''America/Guadeloupe''
          WHEN a.start_geo_code ~ ''^973'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''America/Guyana''
          WHEN a.start_geo_code ~ ''^974'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Indian/Reunion''
          WHEN a.start_geo_code ~ ''^976'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Indian/Mayotte''
          ELSE (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Europe/Paris'' 
        END AS journey_end_datetime,
        st_x(a.end_position::geometry)::numeric AS journey_end_lon,
        st_y(a.end_position::geometry)::numeric AS journey_end_lat,
        cte.arr AS journey_end_insee,
        CASE
          WHEN a.distance IS NOT NULL THEN a.distance
          ELSE (a.meta ->> ''calc_distance''::text)::integer
        END AS journey_distance,
        CASE
          WHEN a.duration IS NOT NULL THEN a.duration
          ELSE (a.meta ->> ''calc_duration''::text)::integer
        END AS journey_duration,
        b.name AS operator,
        a.operator_class,
        a.seats AS passenger_seats,
        f.incentive AS passenger_incentive_raw,
        d.incentive_raw AS passenger_incentive_rpc_raw,
        g.incentive AS driver_incentive_raw,
        e.incentive_raw AS driver_incentive_rpc_raw
      FROM carpool.carpools a
        JOIN operator.operators b ON b._id = a.operator_id
        LEFT JOIN carpool.carpools c ON c.acquisition_id = a.acquisition_id AND c.is_driver = true
        LEFT JOIN geo.perimeters cts ON cts.arr::text = a.start_geo_code::text AND cts.year = geo.get_latest_millesime_or(date_part(''year''::text, a.datetime)::smallint)
        LEFT JOIN geo.perimeters cte ON cte.arr::text = a.end_geo_code::text AND cte.year = geo.get_latest_millesime_or(date_part(''year''::text, a.datetime)::smallint),
        LATERAL ( WITH data AS (
                    SELECT pi.policy_id,
                        sum(pi.amount) AS amount
                      FROM policy.incentives pi
                      WHERE pi.carpool_id = a._id AND pi.status = ''validated''::policy.incentive_status_enum
                      GROUP BY pi.policy_id
                    ), incentive AS (
                    SELECT data.policy_id,
                        ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying) AS value,
                        data.amount,
                            CASE
                                WHEN pp.unit = ''point''::policy.policy_unit_enum THEN false
                                ELSE true
                            END AS financial
                      FROM data
                        LEFT JOIN policy.policies pp ON pp._id = data.policy_id
                        LEFT JOIN territory.territories tt ON pp.territory_id = tt._id
                        LEFT JOIN company.companies cc ON cc._id = tt.company_id
                    )
            SELECT array_agg(incentive.value) AS incentive_raw,
                sum(incentive.amount) AS incentive_sum,
                sum(incentive.amount) FILTER (WHERE incentive.financial IS TRUE) AS incentive_financial_sum,
                array_agg(incentive.policy_id) AS policy_id
              FROM incentive) as d,
        LATERAL ( WITH data AS (
                    SELECT pi.policy_id,
                        sum(pi.amount) AS amount
                      FROM policy.incentives pi
                      WHERE pi.carpool_id = c._id AND pi.status = ''validated''::policy.incentive_status_enum
                      GROUP BY pi.policy_id
                    ), incentive AS (
                    SELECT data.policy_id,
                        ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying) AS value,
                        data.amount,
                            CASE
                                WHEN pp.unit = ''point''::policy.policy_unit_enum THEN false
                                ELSE true
                            END AS financial
                      FROM data
                        LEFT JOIN policy.policies pp ON pp._id = data.policy_id
                        LEFT JOIN territory.territories tt ON pp.territory_id = tt._id
                        LEFT JOIN company.companies cc ON cc._id = tt.company_id
                    )
            SELECT array_agg(incentive.value) AS incentive_raw,
                sum(incentive.amount) AS incentive_sum,
                sum(incentive.amount) FILTER (WHERE incentive.financial IS TRUE) AS incentive_financial_sum,
                array_agg(incentive.policy_id) AS policy_id
              FROM incentive) as e,
        LATERAL ( SELECT array_agg(json_array_elements.value) AS incentive
              FROM json_array_elements(a.meta -> ''payments''::text) json_array_elements(value)) as f,
        LATERAL ( SELECT array_agg(json_array_elements.value) AS incentive
              FROM json_array_elements(c.meta -> ''payments''::text) json_array_elements(value)) as g
        WHERE a.is_driver = false
        AND a.status = ''ok''
        AND date_part(''year'', a.datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $1 ||'
        AND date_part(''month'', a.datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $2 ||'
      ),
      flux as ( 
        SELECT 
        '|| $1 ||' as year,
        '|| $2 ||' as month,
        ''com'' as type,
        LEAST(b.arr, c.arr) as territory_1,
        GREATEST(b.arr, c.arr) as territory_2,
        count(trip_id) as journeys,
        count(*) filter(
          where driver_incentive_raw is not null
          or driver_incentive_rpc_raw is not null
          or passenger_incentive_raw is not null
          or passenger_incentive_rpc_raw is not null
        ) as has_incentive,
        sum(passenger_seats) as passengers,
        round(sum(journey_distance)::numeric/1000,2) as distance,
        round(sum(journey_duration)::numeric/60,2) as duration
        FROM triplist a
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY LEAST(b.arr, c.arr), GREATEST(b.arr, c.arr)
        HAVING (LEAST(b.arr, c.arr)) IS NOT NULL OR (GREATEST(b.arr, c.arr)) IS NOT NULL
        UNION
        SELECT 
        '|| $1 ||' as year,
        '|| $2 ||' as month,
        ''epci'' as type,
        LEAST(b.epci, c.epci) as territory_1,
        GREATEST(b.epci, c.epci) as territory_2,
        count(trip_id) as journeys,
        count(*) filter(
          where driver_incentive_raw is not null
          or driver_incentive_rpc_raw is not null
          or passenger_incentive_raw is not null
          or passenger_incentive_rpc_raw is not null
        ) as has_incentive,
        sum(passenger_seats) as passengers,
        round(sum(journey_distance)::numeric/1000,2) as distance,
        round(sum(journey_duration)::numeric/60,2) as duration
        FROM triplist a
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY LEAST(b.epci, c.epci), GREATEST(b.epci, c.epci)
        HAVING (LEAST(b.epci, c.epci)) IS NOT NULL OR (GREATEST(b.epci, c.epci)) IS NOT NULL
        UNION
        SELECT 
        '|| $1 ||' as year,
        '|| $2 ||' as month,
        ''aom'' as type,
        LEAST(b.aom, c.aom) as territory_1,
        GREATEST(b.aom, c.aom) as territory_2,
        count(trip_id) as journeys,
        count(*) filter(
          where driver_incentive_raw is not null
          or driver_incentive_rpc_raw is not null
          or passenger_incentive_raw is not null
          or passenger_incentive_rpc_raw is not null
        ) as has_incentive,
        sum(passenger_seats) as passengers,
        round(sum(journey_distance)::numeric/1000,2) as distance,
        round(sum(journey_duration)::numeric/60,2) as duration
        FROM triplist a
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY LEAST(b.aom, c.aom), GREATEST(b.aom, c.aom)
        HAVING (LEAST(b.aom, c.aom)) IS NOT NULL OR (GREATEST(b.aom, c.aom)) IS NOT NULL
        UNION
        SELECT 
        '|| $1 ||' as year,
        '|| $2 ||' as month,
        ''dep'' as type,
        LEAST(b.dep, c.dep) as territory_1,
        GREATEST(b.dep, c.dep) as territory_2,
        count(trip_id) as journeys,
        count(*) filter(
          where driver_incentive_raw is not null
          or driver_incentive_rpc_raw is not null
          or passenger_incentive_raw is not null
          or passenger_incentive_rpc_raw is not null
        ) as has_incentive,
        sum(passenger_seats) as passengers,
        round(sum(journey_distance)::numeric/1000,2) as distance,
        round(sum(journey_duration)::numeric/60,2) as duration
        FROM triplist a
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY LEAST(b.dep, c.dep), GREATEST(b.dep, c.dep)
        HAVING (LEAST(b.dep, c.dep)) IS NOT NULL OR (GREATEST(b.dep, c.dep)) IS NOT NULL
        UNION
        SELECT 
        '|| $1 ||' as year,
        '|| $2 ||' as month,
        ''reg'' as type,
        LEAST(b.reg, c.reg) as territory_1,
        GREATEST(b.reg, c.reg) as territory_2,
        count(trip_id) as journeys,
        count(*) filter(
          where driver_incentive_raw is not null
          or driver_incentive_rpc_raw is not null
          or passenger_incentive_raw is not null
          or passenger_incentive_rpc_raw is not null
        ) as has_incentive,
        sum(passenger_seats) as passengers,
        round(sum(journey_distance)::numeric/1000,2) as distance,
        round(sum(journey_duration)::numeric/60,2) as duration
        FROM triplist a
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY LEAST(b.reg, c.reg), GREATEST(b.reg, c.reg)
        HAVING (LEAST(b.reg, c.reg)) IS NOT NULL OR (GREATEST(b.reg, c.reg)) IS NOT NULL
        UNION
        SELECT 
        '|| $1 ||' as year,
        '|| $2 ||' as month,
        ''country'' as type,
        LEAST(b.country, c.country) as territory_1,
        GREATEST(b.country, c.country) as territory_2,
        count(trip_id) as journeys,
        count(*) filter(
          where driver_incentive_raw is not null
          or driver_incentive_rpc_raw is not null
          or passenger_incentive_raw is not null
          or passenger_incentive_rpc_raw is not null
        ) as has_incentive,
        sum(passenger_seats) as passengers,
        round(sum(journey_distance)::numeric/1000,2) as distance,
        round(sum(journey_duration)::numeric/60,2) as duration
        FROM triplist a
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
        GROUP BY LEAST(b.country, c.country), GREATEST(b.country, c.country)
        HAVING (LEAST(b.country, c.country)) IS NOT NULL OR (GREATEST(b.country, c.country)) IS NOT NULL
      )
      SELECT a.year, a.month, a.type::observatory.monthly_flux_type_enum, a.territory_1, b.l_territory as l_territory_1, b.lng as lng_1, b.lat as lat_1, 
      a.territory_2, c.l_territory as l_territory_2,c.lng as lng_2, c.lat as lat_2, 
      a.journeys, a.has_incentive, a.passengers, a.distance, a.duration 
      FROM flux a
      LEFT JOIN perim b on concat(a.territory_1,a.type) = concat(b.territory,b.type) 
      LEFT JOIN perim c on concat(a.territory_2,a.type) = concat(c.territory,c.type)
      ORDER BY a.territory_1,a.territory_2
    );
  ';
  EXECUTE sql;
  INSERT INTO observatory.monthly_flux (
    year,
    month,
    type,
    territory_1,
    l_territory_1,
    lng_1,
    lat_1,
    territory_2,
    l_territory_2,
    lng_2,
    lat_2,
    journeys,
    has_incentive,
    passengers,
    distance,
    duration
  )
  SELECT * FROM temp_flux
  ON CONFLICT 
  ON CONSTRAINT monthly_flux_unique_key
  DO NOTHING;
  DROP TABLE temp_flux;
  END
  $_$;


--
-- Name: insert_monthly_occupation(integer, integer); Type: PROCEDURE; Schema: observatory; Owner: -
--

CREATE PROCEDURE observatory.insert_monthly_occupation(IN year integer, IN month integer)
    LANGUAGE plpgsql
    AS $_$
  DECLARE
  sql text;
  BEGIN
  sql := '
  CREATE TEMP TABLE temp_occupation as (
    WITH perim as (
      SELECT territory,
      l_territory,
      type,
      geom
      FROM geo.perimeters_centroid
      WHERE year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      UNION
      SELECT territory,
      l_territory,
      ''com'' as type,
      geom
      FROM geo.perimeters_centroid
      WHERE year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      AND type = ''country''
      AND territory <>''XXXXX''
    ),
    triplist as (
      SELECT 
      a.acquisition_id AS journey_id,
      a.trip_id,
      CASE WHEN a.start_geo_code ~ ''^97[1-2]'' THEN a.datetime::timestamptz AT TIME ZONE ''America/Guadeloupe''
        WHEN a.start_geo_code ~ ''^973'' THEN a.datetime::timestamptz AT TIME ZONE ''America/Guyana''
        WHEN a.start_geo_code ~ ''^974'' THEN a.datetime::timestamptz AT TIME ZONE ''Indian/Reunion''
        WHEN a.start_geo_code ~ ''^976'' THEN a.datetime::timestamptz AT TIME ZONE ''Indian/Mayotte''
        ELSE a.datetime::timestamptz AT TIME ZONE ''Europe/Paris'' 
      END AS journey_start_datetime,
      st_x(a.start_position::geometry)::numeric AS journey_start_lon,
      st_y(a.start_position::geometry)::numeric AS journey_start_lat,
      cts.arr AS journey_start_insee,
      CASE WHEN a.start_geo_code ~ ''^97[1-2]'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''America/Guadeloupe''
        WHEN a.start_geo_code ~ ''^973'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''America/Guyana''
        WHEN a.start_geo_code ~ ''^974'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Indian/Reunion''
        WHEN a.start_geo_code ~ ''^976'' THEN (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Indian/Mayotte''
        ELSE (a.datetime + ((a.duration || ''seconds''::text)::interval))::timestamptz AT TIME ZONE ''Europe/Paris'' 
      END AS journey_end_datetime,
      st_x(a.end_position::geometry)::numeric AS journey_end_lon,
      st_y(a.end_position::geometry)::numeric AS journey_end_lat,
      cte.arr AS journey_end_insee,
      CASE
        WHEN a.distance IS NOT NULL THEN a.distance
        ELSE (a.meta ->> ''calc_distance''::text)::integer
      END AS journey_distance,
      CASE
        WHEN a.duration IS NOT NULL THEN a.duration
        ELSE (a.meta ->> ''calc_duration''::text)::integer
      END AS journey_duration,
      b.name AS operator,
      a.operator_class,
      a.seats AS passenger_seats,
      f.incentive AS passenger_incentive_raw,
      d.incentive_raw AS passenger_incentive_rpc_raw,
      g.incentive AS driver_incentive_raw,
      e.incentive_raw AS driver_incentive_rpc_raw
    FROM carpool.carpools a
      JOIN operator.operators b ON b._id = a.operator_id
      LEFT JOIN carpool.carpools c ON c.acquisition_id = a.acquisition_id AND c.is_driver = true
      LEFT JOIN geo.perimeters cts ON cts.arr::text = a.start_geo_code::text AND cts.year = geo.get_latest_millesime_or(date_part(''year''::text, a.datetime)::smallint)
      LEFT JOIN geo.perimeters cte ON cte.arr::text = a.end_geo_code::text AND cte.year = geo.get_latest_millesime_or(date_part(''year''::text, a.datetime)::smallint),
      LATERAL ( WITH data AS (
                  SELECT pi.policy_id,
                      sum(pi.amount) AS amount
                    FROM policy.incentives pi
                    WHERE pi.carpool_id = a._id AND pi.status = ''validated''::policy.incentive_status_enum
                    GROUP BY pi.policy_id
                  ), incentive AS (
                  SELECT data.policy_id,
                      ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying) AS value,
                      data.amount,
                          CASE
                              WHEN pp.unit = ''point''::policy.policy_unit_enum THEN false
                              ELSE true
                          END AS financial
                    FROM data
                      LEFT JOIN policy.policies pp ON pp._id = data.policy_id
                      LEFT JOIN territory.territories tt ON pp.territory_id = tt._id
                      LEFT JOIN company.companies cc ON cc._id = tt.company_id
                  )
          SELECT array_agg(incentive.value) AS incentive_raw,
              sum(incentive.amount) AS incentive_sum,
              sum(incentive.amount) FILTER (WHERE incentive.financial IS TRUE) AS incentive_financial_sum,
              array_agg(incentive.policy_id) AS policy_id
            FROM incentive) as d,
      LATERAL ( WITH data AS (
                  SELECT pi.policy_id,
                      sum(pi.amount) AS amount
                    FROM policy.incentives pi
                    WHERE pi.carpool_id = c._id AND pi.status = ''validated''::policy.incentive_status_enum
                    GROUP BY pi.policy_id
                  ), incentive AS (
                  SELECT data.policy_id,
                      ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying) AS value,
                      data.amount,
                          CASE
                              WHEN pp.unit = ''point''::policy.policy_unit_enum THEN false
                              ELSE true
                          END AS financial
                    FROM data
                      LEFT JOIN policy.policies pp ON pp._id = data.policy_id
                      LEFT JOIN territory.territories tt ON pp.territory_id = tt._id
                      LEFT JOIN company.companies cc ON cc._id = tt.company_id
                  )
          SELECT array_agg(incentive.value) AS incentive_raw,
              sum(incentive.amount) AS incentive_sum,
              sum(incentive.amount) FILTER (WHERE incentive.financial IS TRUE) AS incentive_financial_sum,
              array_agg(incentive.policy_id) AS policy_id
            FROM incentive) as e,
      LATERAL ( SELECT array_agg(json_array_elements.value) AS incentive
            FROM json_array_elements(a.meta -> ''payments''::text) json_array_elements(value)) as f,
      LATERAL ( SELECT array_agg(json_array_elements.value) AS incentive
            FROM json_array_elements(c.meta -> ''payments''::text) json_array_elements(value)) as g
      WHERE a.is_driver = false
      AND a.status = ''ok''
      AND date_part(''year'', a.datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $1 ||'
      AND date_part(''month'', a.datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $2 ||'
    ),
    journeys as (
      SELECT 
      journey_id,
      trip_id,
      journey_start_insee as insee,
      ''origin'' as one_way,
      journey_distance,
      passenger_seats,
      CASE WHEN driver_incentive_raw is not null
        OR driver_incentive_rpc_raw is not null
        OR passenger_incentive_raw is not null
        OR passenger_incentive_rpc_raw is not null
      THEN true
      ELSE false END as has_incentive
      FROM triplist
      UNION ALL
      SELECT 
      journey_id,
      trip_id,
      journey_end_insee as insee,
      ''destination'' as one_way,
      journey_distance,
      passenger_seats,
      CASE WHEN driver_incentive_raw is not null
        OR driver_incentive_rpc_raw is not null
        OR passenger_incentive_raw is not null
        OR passenger_incentive_rpc_raw is not null
      THEN true
      ELSE false END as has_incentive
      FROM triplist
    ),
    distances as(
      SELECT 
      journey_id,
      trip_id,
      insee,
      (journey_distance * passenger_seats) as passengers_distance,
      CASE WHEN row_number() OVER (PARTITION BY(insee,trip_id) ORDER BY journey_distance desc) = 1 
      THEN journey_distance 
      ELSE 0 END as driver_distance,
      has_incentive
      from journeys
      ),
      sum_distances as (
      SELECT 
      ''com'' as type, 
      b.arr as territory,  
      count(distinct journey_id) as journeys,
      count(distinct trip_id) as trips,
      count(distinct journey_id) filter(where has_incentive = true) as has_incentive, 
      sum(passengers_distance) as passengers_distance,
      sum(driver_distance) as driver_distance
      FROM distances a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint) and b.com is not null
      GROUP BY b.arr
      HAVING b.arr IS NOT NULL
      UNION
      SELECT ''epci'' as type, 
      b.epci as territory, 
      count(distinct journey_id) as journeys,
      count(distinct trip_id) as trips,
      count(distinct journey_id) filter(where has_incentive = true) as has_incentive, 
      sum(passengers_distance) as passengers_distance,
      sum(driver_distance) as driver_distance
      FROM distances a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      GROUP BY b.epci, b.l_epci
      HAVING b.epci IS NOT NULL
      UNION
      SELECT ''aom'' as type, 
      b.aom as territory, 
      count(distinct journey_id) as journeys,
      count(distinct trip_id) as trips,
      count(distinct journey_id) filter(where has_incentive = true) as has_incentive, 
      sum(passengers_distance) as passengers_distance,
      sum(driver_distance) as driver_distance
      FROM distances a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      GROUP BY b.aom, b.l_aom
      HAVING b.aom IS NOT NULL
      UNION
      SELECT ''dep'' as type, 
      b.dep as territory,
      count(distinct journey_id) as journeys,
      count(distinct trip_id) as trips,
      count(distinct journey_id) filter(where has_incentive = true) as has_incentive, 
      sum(passengers_distance) as passengers_distance,
      sum(driver_distance) as driver_distance
      FROM distances a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      GROUP BY b.dep, b.l_dep
      HAVING b.dep IS NOT NULL
      UNION
      SELECT ''reg'' as type,
      b.reg as territory, 
      count(distinct journey_id) as journeys,
      count(distinct trip_id) as trips,
      count(distinct journey_id) filter(where has_incentive = true) as has_incentive,  
      sum(passengers_distance) as passengers_distance,
      sum(driver_distance) as driver_distance
      FROM distances a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      GROUP BY b.reg, b.l_reg
      HAVING b.reg IS NOT NULL
      UNION
      SELECT ''country'' as type, 
      b.country as territory, 
      count(distinct journey_id) as journeys,
      count(distinct trip_id) as trips,
      count(distinct journey_id) filter(where has_incentive = true) as has_incentive, 
      sum(passengers_distance) as passengers_distance,
      sum(driver_distance) as driver_distance
      FROM distances a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = geo.get_latest_millesime_or('|| $1 ||'::smallint)
      GROUP BY b.country, b.l_country
      HAVING b.country IS NOT NULL
    )
    SELECT '|| $1 ||' as year,
      '|| $2 ||' as month,
      a.type::observatory.monthly_occupation_type_enum,
      a.territory,
      b.l_territory,
      a.journeys,
      a.trips,
      a.has_incentive,
      round((a.passengers_distance + a.driver_distance)::numeric / a.driver_distance::numeric,2) as occupation_rate,
      ST_AsGeoJSON(b.geom,6)::json as geom 
      from sum_distances a
      LEFT JOIN perim b on a.territory=b.territory and a.type=b.type
      WHERE a.driver_distance <> 0
    );
  ';
  EXECUTE sql;
  INSERT INTO observatory.monthly_occupation (
    year,
    month,
    type,
    territory,
    l_territory,
    journeys,
    trips,
    has_incentive,
    occupation_rate,
    geom
  )
  SELECT * FROM temp_occupation
  ON CONFLICT 
  ON CONSTRAINT monthly_occupation_unique_key
  DO NOTHING;
  DROP TABLE temp_occupation;
  END
$_$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: carpools_by_day; Type: TABLE; Schema: dashboard_stats; Owner: -
--

CREATE TABLE dashboard_stats.carpools_by_day (
    "from" character varying,
    "to" character varying,
    start_date date,
    operator_id integer,
    operator_name character varying,
    journeys bigint,
    incented_journeys bigint,
    incentive_amount bigint
);


--
-- Name: operators_by_day; Type: TABLE; Schema: dashboard_stats; Owner: -
--

CREATE TABLE dashboard_stats.operators_by_day (
    territory_id integer NOT NULL,
    start_date date NOT NULL,
    direction text NOT NULL,
    operator_id integer NOT NULL,
    operator_name character varying,
    journeys numeric,
    incented_journeys numeric,
    incentive_amount numeric
);


--
-- Name: operators_by_month; Type: TABLE; Schema: dashboard_stats; Owner: -
--

CREATE TABLE dashboard_stats.operators_by_month (
    year integer NOT NULL,
    month integer NOT NULL,
    territory_id integer NOT NULL,
    direction text NOT NULL,
    operator_id integer NOT NULL,
    operator_name character varying,
    journeys numeric,
    incented_journeys numeric,
    incentive_amount numeric
);


--
-- Name: view_dashboard_carpools; Type: VIEW; Schema: dashboard_stats; Owner: -
--

CREATE VIEW dashboard_stats.view_dashboard_carpools AS
 SELECT a._id AS carpool_id,
    c.start_geo_code,
    c.end_geo_code,
    a.operator_id,
    d.name AS operator_name,
    COALESCE(e.amount, 0) AS incentive_amount,
        CASE
            WHEN ((c.start_geo_code)::text ~ '^97[1-2]'::text) THEN (a.start_datetime AT TIME ZONE 'America/Guadeloupe'::text)
            WHEN ((c.start_geo_code)::text ~ '^973'::text) THEN (a.start_datetime AT TIME ZONE 'America/Guyana'::text)
            WHEN ((c.start_geo_code)::text ~ '^974'::text) THEN (a.start_datetime AT TIME ZONE 'Indian/Reunion'::text)
            WHEN ((c.start_geo_code)::text ~ '^976'::text) THEN (a.start_datetime AT TIME ZONE 'Indian/Mayotte'::text)
            ELSE (a.start_datetime AT TIME ZONE 'Europe/Paris'::text)
        END AS start_datetime
   FROM ((((carpool_v2.carpools a
     LEFT JOIN carpool_v2.status b ON ((a._id = b.carpool_id)))
     LEFT JOIN carpool_v2.geo c ON ((a._id = c.carpool_id)))
     LEFT JOIN operator.operators d ON ((a.operator_id = d._id)))
     LEFT JOIN policy.incentives e ON ((a._id = e.carpool_id)))
  WHERE ((date_part('year'::text, a.start_datetime) >= (2020)::double precision) AND (a.start_datetime < (now() - '2 days'::interval day)) AND (b.acquisition_status = 'processed'::carpool_v2.carpool_acquisition_status_enum) AND (b.fraud_status = 'passed'::carpool_v2.carpool_fraud_status_enum) AND (b.anomaly_status = 'passed'::carpool_v2.carpool_anomaly_status_enum));


--
-- Name: perimeters_aggregate; Type: TABLE; Schema: geo_stats; Owner: -
--

CREATE TABLE geo_stats.perimeters_aggregate (
    year smallint,
    type text,
    code character varying,
    libelle character varying(256),
    geom public.geometry
);


--
-- Name: view_evolution_com; Type: VIEW; Schema: geo_stats; Owner: -
--

CREATE VIEW geo_stats.view_evolution_com AS
 SELECT a.arr AS arr_2020,
    COALESCE(b.new_com, a.arr) AS arr_2021,
    COALESCE(c.new_com, a.arr) AS arr_2022,
    COALESCE(d.new_com, a.arr) AS arr_2023
   FROM (((geo.perimeters a
     LEFT JOIN geo.com_evolution b ON ((((a.arr)::text = (b.old_com)::text) AND (b.year = 2021))))
     LEFT JOIN geo.com_evolution c ON ((((a.arr)::text = (c.old_com)::text) AND (c.year = 2022))))
     LEFT JOIN geo.com_evolution d ON ((((a.arr)::text = (d.old_com)::text) AND (d.year = 2023))))
  WHERE (a.year = 2020)
  ORDER BY a.arr;


--
-- Name: view_perimeters_territories; Type: VIEW; Schema: geo_stats; Owner: -
--

CREATE VIEW geo_stats.view_perimeters_territories AS
 SELECT DISTINCT d.arr,
    d.l_arr,
    a._id AS territory_id,
    a.name AS l_territory
   FROM (((territory.territories a
     JOIN territory.territory_group b ON ((b.company_id = a.company_id)))
     JOIN territory.territory_group_selector c ON ((c.territory_group_id = b._id)))
     JOIN geo.perimeters d ON (((((c.selector_value)::text = (d.arr)::text) OR ((c.selector_value)::text = (d.epci)::text) OR ((c.selector_value)::text = (d.aom)::text) OR ((c.selector_value)::text = (d.dep)::text) OR ((c.selector_value)::text = (d.reg)::text)) AND (d.year = 2023))))
  ORDER BY d.arr;


--
-- Name: aires_covoiturage; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.aires_covoiturage (
    id integer NOT NULL,
    id_local character varying,
    nom_lieu character varying,
    ad_lieu character varying,
    com_lieu character varying,
    insee character varying,
    type character varying,
    date_maj date,
    ouvert boolean,
    source character varying,
    xlong character varying,
    ylat character varying,
    nbre_pl character varying,
    nbre_pmr character varying,
    duree character varying,
    horaires character varying,
    proprio character varying,
    lumiere character varying,
    comm character varying,
    geom public.geometry(Point,4326),
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL
);


--
-- Name: aires_covoiturage_old; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.aires_covoiturage_old (
    id integer NOT NULL,
    id_local character varying,
    nom_lieu character varying,
    ad_lieu character varying,
    com_lieu character varying,
    insee character varying,
    type character varying,
    date_maj date,
    ouvert boolean,
    source character varying,
    xlong character varying,
    ylat character varying,
    nbre_pl character varying,
    nbre_pmr character varying,
    duree character varying,
    horaires character varying,
    proprio character varying,
    lumiere character varying,
    comm character varying,
    geom public.geometry(Point,4326),
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL
);


--
-- Name: aires_covoiturage_id_seq; Type: SEQUENCE; Schema: observatoire_stats; Owner: -
--

CREATE SEQUENCE observatoire_stats.aires_covoiturage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aires_covoiturage_id_seq; Type: SEQUENCE OWNED BY; Schema: observatoire_stats; Owner: -
--

ALTER SEQUENCE observatoire_stats.aires_covoiturage_id_seq OWNED BY observatoire_stats.aires_covoiturage_old.id;


--
-- Name: aires_covoiturage_id_seq1; Type: SEQUENCE; Schema: observatoire_stats; Owner: -
--

CREATE SEQUENCE observatoire_stats.aires_covoiturage_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aires_covoiturage_id_seq1; Type: SEQUENCE OWNED BY; Schema: observatoire_stats; Owner: -
--

ALTER SEQUENCE observatoire_stats.aires_covoiturage_id_seq1 OWNED BY observatoire_stats.aires_covoiturage.id;


--
-- Name: carpool_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.carpool_by_day (
    "from" character varying(5) NOT NULL,
    "to" character varying(5) NOT NULL,
    start_date date NOT NULL,
    journeys bigint,
    drivers bigint,
    passengers bigint,
    passenger_seats bigint,
    distance bigint,
    duration interval
);


--
-- Name: carpool_incentive_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.carpool_incentive_by_day (
    "from" character varying(5) NOT NULL,
    "to" character varying(5) NOT NULL,
    start_date date NOT NULL,
    collectivite bigint,
    operateur bigint,
    autres bigint
);


--
-- Name: carpool_newcomer_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.carpool_newcomer_by_day (
    "from" character varying(5) NOT NULL,
    "to" character varying(5) NOT NULL,
    start_date date NOT NULL,
    new_drivers bigint,
    new_passengers bigint
);


--
-- Name: dataset_migration; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.dataset_migration (
    key character varying(128) NOT NULL,
    millesime smallint DEFAULT (EXTRACT(year FROM now()))::smallint NOT NULL,
    datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: directions_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.directions_by_day (
    code character varying NOT NULL,
    type text NOT NULL,
    start_date date NOT NULL,
    direction text NOT NULL,
    journeys numeric,
    intra_journeys numeric,
    drivers numeric,
    passengers numeric,
    passenger_seats numeric,
    distance numeric
);


--
-- Name: directions_incentive_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.directions_incentive_by_day (
    code character varying NOT NULL,
    type text NOT NULL,
    start_date date NOT NULL,
    direction text NOT NULL,
    collectivite numeric,
    intra_collectivite numeric,
    operateur numeric,
    autres numeric
);


--
-- Name: directions_newcomer_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.directions_newcomer_by_day (
    code character varying NOT NULL,
    type text NOT NULL,
    start_date date NOT NULL,
    direction text NOT NULL,
    new_drivers numeric,
    new_passengers numeric
);


--
-- Name: distribution_by_month; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.distribution_by_month (
    year numeric NOT NULL,
    month numeric NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    hours json,
    distances json
);


--
-- Name: distribution_by_semester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.distribution_by_semester (
    year numeric NOT NULL,
    semester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    hours json,
    distances json
);


--
-- Name: distribution_by_trimester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.distribution_by_trimester (
    year numeric NOT NULL,
    trimester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    hours json,
    distances json
);


--
-- Name: distribution_by_year; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.distribution_by_year (
    year numeric NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    hours json,
    distances json
);


--
-- Name: distribution_distances_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.distribution_distances_by_day (
    code character varying NOT NULL,
    type text NOT NULL,
    start_date date NOT NULL,
    dist_classes text NOT NULL,
    direction text NOT NULL,
    journeys numeric,
    intra_journeys numeric
);


--
-- Name: distribution_hours_by_day; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.distribution_hours_by_day (
    code character varying NOT NULL,
    type text NOT NULL,
    start_date date NOT NULL,
    hour numeric NOT NULL,
    direction text NOT NULL,
    journeys numeric,
    intra_journeys numeric
);


--
-- Name: flux_by_month; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.flux_by_month (
    year integer NOT NULL,
    month integer NOT NULL,
    type text NOT NULL,
    territory_1 character varying NOT NULL,
    l_territory_1 character varying,
    territory_2 character varying NOT NULL,
    l_territory_2 character varying,
    journeys numeric,
    passengers numeric,
    distance numeric,
    duration numeric,
    lng_1 double precision,
    lat_1 double precision,
    lng_2 double precision,
    lat_2 double precision
);


--
-- Name: flux_by_semester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.flux_by_semester (
    year integer NOT NULL,
    semester integer NOT NULL,
    type text NOT NULL,
    territory_1 character varying NOT NULL,
    l_territory_1 character varying,
    territory_2 character varying NOT NULL,
    l_territory_2 character varying,
    journeys numeric,
    passengers numeric,
    distance numeric,
    duration numeric,
    lng_1 double precision,
    lat_1 double precision,
    lng_2 double precision,
    lat_2 double precision
);


--
-- Name: flux_by_trimester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.flux_by_trimester (
    year integer NOT NULL,
    trimester integer NOT NULL,
    type text NOT NULL,
    territory_1 character varying NOT NULL,
    l_territory_1 character varying,
    territory_2 character varying NOT NULL,
    l_territory_2 character varying,
    journeys numeric,
    passengers numeric,
    distance numeric,
    duration numeric,
    lng_1 double precision,
    lat_1 double precision,
    lng_2 double precision,
    lat_2 double precision
);


--
-- Name: flux_by_year; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.flux_by_year (
    year integer NOT NULL,
    type text NOT NULL,
    territory_1 character varying NOT NULL,
    l_territory_1 character varying,
    territory_2 character varying NOT NULL,
    l_territory_2 character varying,
    journeys numeric,
    passengers numeric,
    distance numeric,
    duration numeric,
    lng_1 double precision,
    lat_1 double precision,
    lng_2 double precision,
    lat_2 double precision
);


--
-- Name: incentive_by_month; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.incentive_by_month (
    year integer NOT NULL,
    month integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    collectivite numeric,
    operateur numeric,
    autres numeric
);


--
-- Name: incentive_by_semester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.incentive_by_semester (
    year integer NOT NULL,
    semester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    collectivite numeric,
    operateur numeric,
    autres numeric
);


--
-- Name: incentive_by_trimester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.incentive_by_trimester (
    year integer NOT NULL,
    trimester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    collectivite numeric,
    operateur numeric,
    autres numeric
);


--
-- Name: incentive_by_year; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.incentive_by_year (
    year integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    collectivite numeric,
    operateur numeric,
    autres numeric
);


--
-- Name: incentive_campaigns; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.incentive_campaigns (
    id integer NOT NULL,
    collectivite character varying,
    derniere_maj character varying,
    email character varying,
    type character varying,
    code character varying,
    premiere_campagne character varying,
    budget_incitations character varying,
    date_debut character varying,
    date_fin character varying,
    conducteur_montant_max_par_passager character varying,
    conducteur_montant_max_par_mois character varying,
    conducteur_montant_min_par_passager character varying,
    conducteur_trajets_max_par_mois character varying,
    passager_trajets_max_par_mois character varying,
    passager_gratuite character varying,
    passager_eligible_gratuite character varying,
    passager_reduction_ticket character varying,
    passager_eligibilite_reduction character varying,
    passager_montant_ticket character varying,
    zone_sens_des_trajets character varying,
    zone_exclusion character varying,
    si_zone_exclue_liste character varying,
    autre_exclusion character varying,
    trajet_longueur_min character varying,
    trajet_longueur_max character varying,
    trajet_classe_de_preuve character varying,
    operateurs character varying,
    autres_informations character varying,
    zone_sens_des_trajets_litteral character varying,
    lien character varying,
    nom_plateforme character varying
);


--
-- Name: incentive_campaigns_old; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.incentive_campaigns_old (
    id integer NOT NULL,
    collectivite character varying,
    derniere_maj character varying,
    email character varying,
    type character varying,
    code character varying,
    premiere_campagne character varying,
    budget_incitations character varying,
    date_debut character varying,
    date_fin character varying,
    conducteur_montant_max_par_passager character varying,
    conducteur_montant_max_par_mois character varying,
    conducteur_montant_min_par_passager character varying,
    conducteur_trajets_max_par_mois character varying,
    passager_trajets_max_par_mois character varying,
    passager_gratuite character varying,
    passager_eligible_gratuite character varying,
    passager_reduction_ticket character varying,
    passager_eligibilite_reduction character varying,
    passager_montant_ticket character varying,
    zone_sens_des_trajets character varying,
    zone_exclusion character varying,
    si_zone_exclue_liste character varying,
    autre_exclusion character varying,
    trajet_longueur_min character varying,
    trajet_longueur_max character varying,
    trajet_classe_de_preuve character varying,
    operateurs character varying,
    autres_informations character varying,
    zone_sens_des_trajets_litteral character varying,
    lien character varying,
    nom_plateforme character varying
);


--
-- Name: incentive_campaigns_id_seq; Type: SEQUENCE; Schema: observatoire_stats; Owner: -
--

CREATE SEQUENCE observatoire_stats.incentive_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incentive_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: observatoire_stats; Owner: -
--

ALTER SEQUENCE observatoire_stats.incentive_campaigns_id_seq OWNED BY observatoire_stats.incentive_campaigns_old.id;


--
-- Name: incentive_campaigns_id_seq1; Type: SEQUENCE; Schema: observatoire_stats; Owner: -
--

CREATE SEQUENCE observatoire_stats.incentive_campaigns_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incentive_campaigns_id_seq1; Type: SEQUENCE OWNED BY; Schema: observatoire_stats; Owner: -
--

ALTER SEQUENCE observatoire_stats.incentive_campaigns_id_seq1 OWNED BY observatoire_stats.incentive_campaigns.id;


--
-- Name: newcomer_by_month; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.newcomer_by_month (
    year integer NOT NULL,
    month integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    new_drivers numeric,
    new_passengers numeric
);


--
-- Name: newcomer_by_semester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.newcomer_by_semester (
    year integer NOT NULL,
    semester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    new_drivers numeric,
    new_passengers numeric
);


--
-- Name: newcomer_by_trimester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.newcomer_by_trimester (
    year integer NOT NULL,
    trimester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    new_drivers numeric,
    new_passengers numeric
);


--
-- Name: newcomer_by_year; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.newcomer_by_year (
    year integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    new_drivers numeric,
    new_passengers numeric
);


--
-- Name: occupation_by_month; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.occupation_by_month (
    year integer NOT NULL,
    month integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    journeys integer,
    occupation_rate double precision,
    geom json
);


--
-- Name: occupation_by_semester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.occupation_by_semester (
    year integer NOT NULL,
    semester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    journeys integer,
    occupation_rate double precision,
    geom json
);


--
-- Name: occupation_by_trimester; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.occupation_by_trimester (
    year integer NOT NULL,
    trimester integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    journeys integer,
    occupation_rate double precision,
    geom json
);


--
-- Name: occupation_by_year; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.occupation_by_year (
    year integer NOT NULL,
    code character varying NOT NULL,
    libelle character varying,
    type text NOT NULL,
    direction text NOT NULL,
    journeys integer,
    occupation_rate double precision,
    geom json
);


--
-- Name: perimeters_aggregate; Type: TABLE; Schema: observatoire_stats; Owner: -
--

CREATE TABLE observatoire_stats.perimeters_aggregate (
    id integer NOT NULL,
    year integer NOT NULL,
    territory character varying NOT NULL,
    l_territory character varying NOT NULL,
    type character varying NOT NULL,
    geom public.geometry(MultiPolygon,4326) NOT NULL
);


--
-- Name: perimeters_aggregate_id_seq; Type: SEQUENCE; Schema: observatoire_stats; Owner: -
--

CREATE SEQUENCE observatoire_stats.perimeters_aggregate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: perimeters_aggregate_id_seq; Type: SEQUENCE OWNED BY; Schema: observatoire_stats; Owner: -
--

ALTER SEQUENCE observatoire_stats.perimeters_aggregate_id_seq OWNED BY observatoire_stats.perimeters_aggregate.id;


--
-- Name: view_carpool; Type: VIEW; Schema: observatoire_stats; Owner: -
--

CREATE VIEW observatoire_stats.view_carpool AS
 SELECT a._id AS carpool_id,
    c.start_geo_code,
    c.end_geo_code,
    a.operator_id,
    a.distance,
    a.driver_revenue,
    a.passenger_seats,
    a.passenger_contribution,
    a.passenger_payments,
    b.acquisition_status,
    b.fraud_status,
        CASE
            WHEN ((c.start_geo_code)::text ~ '^97[1-2]'::text) THEN (a.start_datetime AT TIME ZONE 'America/Guadeloupe'::text)
            WHEN ((c.start_geo_code)::text ~ '^973'::text) THEN (a.start_datetime AT TIME ZONE 'America/Guyana'::text)
            WHEN ((c.start_geo_code)::text ~ '^974'::text) THEN (a.start_datetime AT TIME ZONE 'Indian/Reunion'::text)
            WHEN ((c.start_geo_code)::text ~ '^976'::text) THEN (a.start_datetime AT TIME ZONE 'Indian/Mayotte'::text)
            ELSE (a.start_datetime AT TIME ZONE 'Europe/Paris'::text)
        END AS start_datetime,
        CASE
            WHEN ((c.end_geo_code)::text ~ '^97[1-2]'::text) THEN (a.end_datetime AT TIME ZONE 'America/Guadeloupe'::text)
            WHEN ((c.end_geo_code)::text ~ '^973'::text) THEN (a.end_datetime AT TIME ZONE 'America/Guyana'::text)
            WHEN ((c.end_geo_code)::text ~ '^974'::text) THEN (a.end_datetime AT TIME ZONE 'Indian/Reunion'::text)
            WHEN ((c.end_geo_code)::text ~ '^976'::text) THEN (a.end_datetime AT TIME ZONE 'Indian/Mayotte'::text)
            ELSE (a.end_datetime AT TIME ZONE 'Europe/Paris'::text)
        END AS end_datetime,
    (a.end_datetime - a.start_datetime) AS duration,
    COALESCE(a.driver_identity_key, a.driver_operator_user_id, a.driver_phone, a.driver_phone_trunc) AS driver_id,
    COALESCE(a.passenger_identity_key, a.passenger_operator_user_id, a.passenger_phone, a.passenger_phone_trunc) AS passenger_id
   FROM ((carpool_v2.carpools a
     LEFT JOIN carpool_v2.status b ON ((a._id = b.carpool_id)))
     LEFT JOIN carpool_v2.geo c ON ((a._id = c.carpool_id)))
  WHERE ((c.start_geo_code IS NOT NULL) AND (c.end_geo_code IS NOT NULL) AND (date_part('year'::text, a.start_datetime) >= (2020)::double precision) AND (a.start_datetime < (now() - '8 days'::interval day)));


--
-- Name: view_distribution; Type: VIEW; Schema: observatoire_stats; Owner: -
--

CREATE VIEW observatoire_stats.view_distribution AS
 SELECT COALESCE(b.new_com, a.start_geo_code) AS start,
    COALESCE(c.new_com, a.end_geo_code) AS "end",
    (a.start_datetime)::date AS start_date,
    EXTRACT(hour FROM a.start_datetime) AS hour,
        CASE
            WHEN (a.distance < 10000) THEN '0-10'::text
            WHEN ((a.distance >= 10000) AND (a.distance < 20000)) THEN '10-20'::text
            WHEN ((a.distance >= 20000) AND (a.distance < 30000)) THEN '20-30'::text
            WHEN ((a.distance >= 30000) AND (a.distance < 40000)) THEN '30-40'::text
            WHEN ((a.distance >= 40000) AND (a.distance < 50000)) THEN '40-50'::text
            ELSE '>50'::text
        END AS dist_classes
   FROM ((observatoire_stats.view_carpool a
     LEFT JOIN ( SELECT com_evolution.year,
            com_evolution.mod,
            com_evolution.old_com,
            com_evolution.new_com,
            com_evolution.l_mod
           FROM geo.com_evolution
          WHERE (com_evolution.year >= 2020)) b ON (((a.start_geo_code)::text = (b.old_com)::text)))
     LEFT JOIN ( SELECT com_evolution.year,
            com_evolution.mod,
            com_evolution.old_com,
            com_evolution.new_com,
            com_evolution.l_mod
           FROM geo.com_evolution
          WHERE (com_evolution.year >= 2020)) c ON (((a.end_geo_code)::text = (c.old_com)::text)))
  WHERE ((a.acquisition_status = 'processed'::carpool_v2.carpool_acquisition_status_enum) AND (a.fraud_status = 'passed'::carpool_v2.carpool_fraud_status_enum));


--
-- Name: view_first_date_driver; Type: VIEW; Schema: observatoire_stats; Owner: -
--

CREATE VIEW observatoire_stats.view_first_date_driver AS
 SELECT DISTINCT ON (view_carpool.driver_id) view_carpool.driver_id,
    (min(view_carpool.start_datetime))::date AS first_date
   FROM observatoire_stats.view_carpool
  WHERE ((view_carpool.acquisition_status = 'processed'::carpool_v2.carpool_acquisition_status_enum) AND (view_carpool.fraud_status = 'passed'::carpool_v2.carpool_fraud_status_enum))
  GROUP BY view_carpool.driver_id;


--
-- Name: view_first_date_passenger; Type: VIEW; Schema: observatoire_stats; Owner: -
--

CREATE VIEW observatoire_stats.view_first_date_passenger AS
 SELECT DISTINCT ON (view_carpool.passenger_id) view_carpool.passenger_id,
    (min(view_carpool.start_datetime))::date AS first_date
   FROM observatoire_stats.view_carpool
  WHERE ((view_carpool.acquisition_status = 'processed'::carpool_v2.carpool_acquisition_status_enum) AND (view_carpool.fraud_status = 'passed'::carpool_v2.carpool_fraud_status_enum))
  GROUP BY view_carpool.passenger_id;


--
-- Name: view_location; Type: VIEW; Schema: observatoire_stats; Owner: -
--

CREATE VIEW observatoire_stats.view_location AS
 SELECT a._id AS carpool_id,
    COALESCE(d.new_com, c.start_geo_code) AS start_geo_code,
    COALESCE(e.new_com, c.end_geo_code) AS end_geo_code,
        CASE
            WHEN ((c.start_geo_code)::text ~ '^97[1-2]'::text) THEN (a.start_datetime AT TIME ZONE 'America/Guadeloupe'::text)
            WHEN ((c.start_geo_code)::text ~ '^973'::text) THEN (a.start_datetime AT TIME ZONE 'America/Guyana'::text)
            WHEN ((c.start_geo_code)::text ~ '^974'::text) THEN (a.start_datetime AT TIME ZONE 'Indian/Reunion'::text)
            WHEN ((c.start_geo_code)::text ~ '^976'::text) THEN (a.start_datetime AT TIME ZONE 'Indian/Mayotte'::text)
            ELSE (a.start_datetime AT TIME ZONE 'Europe/Paris'::text)
        END AS start_datetime,
    public.st_y((a.start_position)::public.geometry) AS start_lat,
    public.st_x((a.start_position)::public.geometry) AS start_lon,
    public.st_y((a.end_position)::public.geometry) AS end_lat,
    public.st_x((a.end_position)::public.geometry) AS end_lon
   FROM ((((carpool_v2.carpools a
     LEFT JOIN carpool_v2.status b ON ((a._id = b.carpool_id)))
     LEFT JOIN carpool_v2.geo c ON ((a._id = c.carpool_id)))
     LEFT JOIN ( SELECT com_evolution.year,
            com_evolution.mod,
            com_evolution.old_com,
            com_evolution.new_com,
            com_evolution.l_mod
           FROM geo.com_evolution
          WHERE (com_evolution.year >= 2020)) d ON (((c.start_geo_code)::text = (d.old_com)::text)))
     LEFT JOIN ( SELECT com_evolution.year,
            com_evolution.mod,
            com_evolution.old_com,
            com_evolution.new_com,
            com_evolution.l_mod
           FROM geo.com_evolution
          WHERE (com_evolution.year >= 2020)) e ON (((c.end_geo_code)::text = (e.old_com)::text)))
  WHERE ((date_part('year'::text, a.start_datetime) >= (2020)::double precision) AND (a.start_datetime < (now() - '8 days'::interval day)) AND (b.acquisition_status = 'processed'::carpool_v2.carpool_acquisition_status_enum) AND (b.fraud_status = 'passed'::carpool_v2.carpool_fraud_status_enum));


--
-- Name: aires_covoiturage; Type: TABLE; Schema: observatory; Owner: -
--

CREATE TABLE observatory.aires_covoiturage (
    id integer NOT NULL,
    id_lieu character varying,
    nom_lieu character varying,
    ad_lieu character varying,
    com_lieu character varying,
    insee character varying,
    type character varying,
    date_maj date,
    ouvert boolean,
    source character varying,
    xlong character varying,
    ylat character varying,
    nbre_pl character varying,
    nbre_pmr character varying,
    duree character varying,
    horaires character varying,
    proprio character varying,
    lumiere character varying,
    comm character varying,
    geom public.geometry(Point,4326)
);


--
-- Name: aires_covoiturage_id_seq; Type: SEQUENCE; Schema: observatory; Owner: -
--

CREATE SEQUENCE observatory.aires_covoiturage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aires_covoiturage_id_seq; Type: SEQUENCE OWNED BY; Schema: observatory; Owner: -
--

ALTER SEQUENCE observatory.aires_covoiturage_id_seq OWNED BY observatory.aires_covoiturage.id;


--
-- Name: incentive_campaigns; Type: TABLE; Schema: observatory; Owner: -
--

CREATE TABLE observatory.incentive_campaigns (
    id integer NOT NULL,
    collectivite character varying,
    derniere_maj character varying,
    email character varying,
    type character varying,
    code character varying,
    premiere_campagne character varying,
    budget_incitations character varying,
    date_debut character varying,
    date_fin character varying,
    conducteur_montant_max_par_passager character varying,
    conducteur_montant_max_par_mois character varying,
    conducteur_montant_min_par_passager character varying,
    conducteur_trajets_max_par_mois character varying,
    passager_trajets_max_par_mois character varying,
    passager_gratuite character varying,
    passager_eligible_gratuite character varying,
    passager_reduction_ticket character varying,
    passager_eligibilite_reduction character varying,
    passager_montant_ticket character varying,
    zone_sens_des_trajets character varying,
    zone_exclusion character varying,
    si_zone_exclue_liste character varying,
    autre_exclusion character varying,
    trajet_longueur_min character varying,
    trajet_longueur_max character varying,
    trajet_classe_de_preuve character varying,
    operateurs character varying,
    autres_informations character varying,
    zone_sens_des_trajets_litteral character varying
);


--
-- Name: incentive_campaigns_id_seq; Type: SEQUENCE; Schema: observatory; Owner: -
--

CREATE SEQUENCE observatory.incentive_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incentive_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: observatory; Owner: -
--

ALTER SEQUENCE observatory.incentive_campaigns_id_seq OWNED BY observatory.incentive_campaigns.id;


--
-- Name: monthly_distribution; Type: TABLE; Schema: observatory; Owner: -
--

CREATE TABLE observatory.monthly_distribution (
    id integer NOT NULL,
    year smallint NOT NULL,
    month smallint NOT NULL,
    territory character varying(9) NOT NULL,
    l_territory character varying NOT NULL,
    type observatory.monthly_distribution_type_enum NOT NULL,
    direction observatory.monthly_distribution_direction_enum NOT NULL,
    hours json NOT NULL,
    distances json NOT NULL
);


--
-- Name: monthly_distribution_id_seq; Type: SEQUENCE; Schema: observatory; Owner: -
--

CREATE SEQUENCE observatory.monthly_distribution_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: monthly_distribution_id_seq; Type: SEQUENCE OWNED BY; Schema: observatory; Owner: -
--

ALTER SEQUENCE observatory.monthly_distribution_id_seq OWNED BY observatory.monthly_distribution.id;


--
-- Name: monthly_flux; Type: TABLE; Schema: observatory; Owner: -
--

CREATE TABLE observatory.monthly_flux (
    id integer NOT NULL,
    year smallint NOT NULL,
    month smallint NOT NULL,
    type observatory.monthly_flux_type_enum NOT NULL,
    territory_1 character varying(9) NOT NULL,
    l_territory_1 character varying NOT NULL,
    lng_1 double precision NOT NULL,
    lat_1 double precision NOT NULL,
    territory_2 character varying(9) NOT NULL,
    l_territory_2 character varying NOT NULL,
    lng_2 double precision NOT NULL,
    lat_2 double precision NOT NULL,
    journeys integer NOT NULL,
    has_incentive integer NOT NULL,
    passengers integer NOT NULL,
    distance double precision NOT NULL,
    duration double precision NOT NULL
);


--
-- Name: monthly_flux_id_seq; Type: SEQUENCE; Schema: observatory; Owner: -
--

CREATE SEQUENCE observatory.monthly_flux_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: monthly_flux_id_seq; Type: SEQUENCE OWNED BY; Schema: observatory; Owner: -
--

ALTER SEQUENCE observatory.monthly_flux_id_seq OWNED BY observatory.monthly_flux.id;


--
-- Name: monthly_occupation; Type: TABLE; Schema: observatory; Owner: -
--

CREATE TABLE observatory.monthly_occupation (
    id integer NOT NULL,
    year smallint NOT NULL,
    month smallint NOT NULL,
    type observatory.monthly_occupation_type_enum NOT NULL,
    territory character varying(9) NOT NULL,
    l_territory character varying NOT NULL,
    journeys integer NOT NULL,
    trips integer NOT NULL,
    has_incentive integer NOT NULL,
    occupation_rate double precision NOT NULL,
    geom json NOT NULL
);


--
-- Name: monthly_occupation_id_seq; Type: SEQUENCE; Schema: observatory; Owner: -
--

CREATE SEQUENCE observatory.monthly_occupation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: monthly_occupation_id_seq; Type: SEQUENCE OWNED BY; Schema: observatory; Owner: -
--

ALTER SEQUENCE observatory.monthly_occupation_id_seq OWNED BY observatory.monthly_occupation.id;


--
-- Name: perimeters_aggregate; Type: TABLE; Schema: observatory; Owner: -
--

CREATE TABLE observatory.perimeters_aggregate (
    id integer NOT NULL,
    year integer NOT NULL,
    territory character varying NOT NULL,
    l_territory character varying NOT NULL,
    type character varying NOT NULL,
    geom public.geometry(MultiPolygon,4326) NOT NULL
);


--
-- Name: perimeters_aggregate_id_seq; Type: SEQUENCE; Schema: observatory; Owner: -
--

CREATE SEQUENCE observatory.perimeters_aggregate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: perimeters_aggregate_id_seq; Type: SEQUENCE OWNED BY; Schema: observatory; Owner: -
--

ALTER SEQUENCE observatory.perimeters_aggregate_id_seq OWNED BY observatory.perimeters_aggregate.id;


--
-- Name: aires_covoiturage id; Type: DEFAULT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.aires_covoiturage ALTER COLUMN id SET DEFAULT nextval('observatoire_stats.aires_covoiturage_id_seq1'::regclass);


--
-- Name: aires_covoiturage_old id; Type: DEFAULT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.aires_covoiturage_old ALTER COLUMN id SET DEFAULT nextval('observatoire_stats.aires_covoiturage_id_seq'::regclass);


--
-- Name: incentive_campaigns id; Type: DEFAULT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_campaigns ALTER COLUMN id SET DEFAULT nextval('observatoire_stats.incentive_campaigns_id_seq1'::regclass);


--
-- Name: incentive_campaigns_old id; Type: DEFAULT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_campaigns_old ALTER COLUMN id SET DEFAULT nextval('observatoire_stats.incentive_campaigns_id_seq'::regclass);


--
-- Name: perimeters_aggregate id; Type: DEFAULT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.perimeters_aggregate ALTER COLUMN id SET DEFAULT nextval('observatoire_stats.perimeters_aggregate_id_seq'::regclass);


--
-- Name: aires_covoiturage id; Type: DEFAULT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.aires_covoiturage ALTER COLUMN id SET DEFAULT nextval('observatory.aires_covoiturage_id_seq'::regclass);


--
-- Name: incentive_campaigns id; Type: DEFAULT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.incentive_campaigns ALTER COLUMN id SET DEFAULT nextval('observatory.incentive_campaigns_id_seq'::regclass);


--
-- Name: monthly_distribution id; Type: DEFAULT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_distribution ALTER COLUMN id SET DEFAULT nextval('observatory.monthly_distribution_id_seq'::regclass);


--
-- Name: monthly_flux id; Type: DEFAULT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_flux ALTER COLUMN id SET DEFAULT nextval('observatory.monthly_flux_id_seq'::regclass);


--
-- Name: monthly_occupation id; Type: DEFAULT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_occupation ALTER COLUMN id SET DEFAULT nextval('observatory.monthly_occupation_id_seq'::regclass);


--
-- Name: perimeters_aggregate id; Type: DEFAULT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.perimeters_aggregate ALTER COLUMN id SET DEFAULT nextval('observatory.perimeters_aggregate_id_seq'::regclass);


--
-- Name: operators_by_day operators_by_day_pkey; Type: CONSTRAINT; Schema: dashboard_stats; Owner: -
--

ALTER TABLE ONLY dashboard_stats.operators_by_day
    ADD CONSTRAINT operators_by_day_pkey PRIMARY KEY (territory_id, direction, start_date, operator_id);


--
-- Name: operators_by_month operators_by_month_pkey; Type: CONSTRAINT; Schema: dashboard_stats; Owner: -
--

ALTER TABLE ONLY dashboard_stats.operators_by_month
    ADD CONSTRAINT operators_by_month_pkey PRIMARY KEY (year, month, territory_id, direction, operator_id);


--
-- Name: aires_covoiturage_old aires_covoiturage_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.aires_covoiturage_old
    ADD CONSTRAINT aires_covoiturage_pkey PRIMARY KEY (id);


--
-- Name: aires_covoiturage aires_covoiturage_pkey1; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.aires_covoiturage
    ADD CONSTRAINT aires_covoiturage_pkey1 PRIMARY KEY (id);


--
-- Name: carpool_by_day carpool_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.carpool_by_day
    ADD CONSTRAINT carpool_by_day_pkey PRIMARY KEY ("from", "to", start_date);


--
-- Name: carpool_incentive_by_day carpool_incentive_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.carpool_incentive_by_day
    ADD CONSTRAINT carpool_incentive_by_day_pkey PRIMARY KEY ("from", "to", start_date);


--
-- Name: carpool_newcomer_by_day carpool_newcomer_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.carpool_newcomer_by_day
    ADD CONSTRAINT carpool_newcomer_by_day_pkey PRIMARY KEY ("from", "to", start_date);


--
-- Name: dataset_migration dataset_migration_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.dataset_migration
    ADD CONSTRAINT dataset_migration_pkey PRIMARY KEY (key);


--
-- Name: directions_by_day directions_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.directions_by_day
    ADD CONSTRAINT directions_by_day_pkey PRIMARY KEY (code, type, direction, start_date);


--
-- Name: directions_incentive_by_day directions_incentive_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.directions_incentive_by_day
    ADD CONSTRAINT directions_incentive_by_day_pkey PRIMARY KEY (code, type, direction, start_date);


--
-- Name: directions_newcomer_by_day directions_newcomer_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.directions_newcomer_by_day
    ADD CONSTRAINT directions_newcomer_by_day_pkey PRIMARY KEY (code, type, direction, start_date);


--
-- Name: distribution_by_month distribution_by_month_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.distribution_by_month
    ADD CONSTRAINT distribution_by_month_pkey PRIMARY KEY (year, month, code, type, direction);


--
-- Name: distribution_by_semester distribution_by_semester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.distribution_by_semester
    ADD CONSTRAINT distribution_by_semester_pkey PRIMARY KEY (year, semester, code, type, direction);


--
-- Name: distribution_by_trimester distribution_by_trimester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.distribution_by_trimester
    ADD CONSTRAINT distribution_by_trimester_pkey PRIMARY KEY (year, trimester, code, type, direction);


--
-- Name: distribution_by_year distribution_by_year_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.distribution_by_year
    ADD CONSTRAINT distribution_by_year_pkey PRIMARY KEY (year, code, type, direction);


--
-- Name: distribution_distances_by_day distribution_distances_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.distribution_distances_by_day
    ADD CONSTRAINT distribution_distances_by_day_pkey PRIMARY KEY (code, type, direction, start_date, dist_classes);


--
-- Name: distribution_hours_by_day distribution_hours_by_day_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.distribution_hours_by_day
    ADD CONSTRAINT distribution_hours_by_day_pkey PRIMARY KEY (code, type, direction, start_date, hour);


--
-- Name: flux_by_month flux_by_month_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.flux_by_month
    ADD CONSTRAINT flux_by_month_pkey PRIMARY KEY (type, year, month, territory_1, territory_2);


--
-- Name: flux_by_semester flux_by_semester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.flux_by_semester
    ADD CONSTRAINT flux_by_semester_pkey PRIMARY KEY (year, semester, type, territory_1, territory_2);


--
-- Name: flux_by_trimester flux_by_trimester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.flux_by_trimester
    ADD CONSTRAINT flux_by_trimester_pkey PRIMARY KEY (year, trimester, type, territory_1, territory_2);


--
-- Name: flux_by_year flux_by_year_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.flux_by_year
    ADD CONSTRAINT flux_by_year_pkey PRIMARY KEY (year, type, territory_1, territory_2);


--
-- Name: incentive_by_month incentive_by_month_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_by_month
    ADD CONSTRAINT incentive_by_month_pkey PRIMARY KEY (year, month, code, type, direction);


--
-- Name: incentive_by_semester incentive_by_semester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_by_semester
    ADD CONSTRAINT incentive_by_semester_pkey PRIMARY KEY (year, semester, type, code, direction);


--
-- Name: incentive_by_trimester incentive_by_trimester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_by_trimester
    ADD CONSTRAINT incentive_by_trimester_pkey PRIMARY KEY (year, trimester, type, code, direction);


--
-- Name: incentive_by_year incentive_by_year_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_by_year
    ADD CONSTRAINT incentive_by_year_pkey PRIMARY KEY (year, type, code, direction);


--
-- Name: incentive_campaigns_old incentive_campaigns_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_campaigns_old
    ADD CONSTRAINT incentive_campaigns_pkey PRIMARY KEY (id);


--
-- Name: incentive_campaigns incentive_campaigns_pkey1; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.incentive_campaigns
    ADD CONSTRAINT incentive_campaigns_pkey1 PRIMARY KEY (id);


--
-- Name: newcomer_by_month newcomer_by_month_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.newcomer_by_month
    ADD CONSTRAINT newcomer_by_month_pkey PRIMARY KEY (year, month, code, type, direction);


--
-- Name: newcomer_by_semester newcomer_by_semester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.newcomer_by_semester
    ADD CONSTRAINT newcomer_by_semester_pkey PRIMARY KEY (year, semester, code, type, direction);


--
-- Name: newcomer_by_trimester newcomer_by_trimester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.newcomer_by_trimester
    ADD CONSTRAINT newcomer_by_trimester_pkey PRIMARY KEY (year, trimester, code, type, direction);


--
-- Name: newcomer_by_year newcomer_by_year_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.newcomer_by_year
    ADD CONSTRAINT newcomer_by_year_pkey PRIMARY KEY (year, code, type, direction);


--
-- Name: occupation_by_month occupation_by_month_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.occupation_by_month
    ADD CONSTRAINT occupation_by_month_pkey PRIMARY KEY (year, month, code, type, direction);


--
-- Name: occupation_by_semester occupation_by_semester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.occupation_by_semester
    ADD CONSTRAINT occupation_by_semester_pkey PRIMARY KEY (year, semester, code, type, direction);


--
-- Name: occupation_by_trimester occupation_by_trimester_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.occupation_by_trimester
    ADD CONSTRAINT occupation_by_trimester_pkey PRIMARY KEY (year, trimester, code, type, direction);


--
-- Name: occupation_by_year occupation_by_year_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.occupation_by_year
    ADD CONSTRAINT occupation_by_year_pkey PRIMARY KEY (year, code, type, direction);


--
-- Name: perimeters_aggregate perimeters_aggregate_pkey; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.perimeters_aggregate
    ADD CONSTRAINT perimeters_aggregate_pkey PRIMARY KEY (id);


--
-- Name: perimeters_aggregate perimeters_aggregate_unique_key; Type: CONSTRAINT; Schema: observatoire_stats; Owner: -
--

ALTER TABLE ONLY observatoire_stats.perimeters_aggregate
    ADD CONSTRAINT perimeters_aggregate_unique_key UNIQUE (year, territory, type);


--
-- Name: aires_covoiturage aires_covoiturage_id_lieu_key; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.aires_covoiturage
    ADD CONSTRAINT aires_covoiturage_id_lieu_key UNIQUE (id_lieu);


--
-- Name: aires_covoiturage aires_covoiturage_pkey; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.aires_covoiturage
    ADD CONSTRAINT aires_covoiturage_pkey PRIMARY KEY (id);


--
-- Name: incentive_campaigns incentive_campaigns_pkey; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.incentive_campaigns
    ADD CONSTRAINT incentive_campaigns_pkey PRIMARY KEY (id);


--
-- Name: monthly_distribution monthly_distribution_pkey; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_distribution
    ADD CONSTRAINT monthly_distribution_pkey PRIMARY KEY (id);


--
-- Name: monthly_distribution monthly_distribution_unique_key; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_distribution
    ADD CONSTRAINT monthly_distribution_unique_key UNIQUE (year, month, territory, type, direction);


--
-- Name: monthly_flux monthly_flux_pkey; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_flux
    ADD CONSTRAINT monthly_flux_pkey PRIMARY KEY (id);


--
-- Name: monthly_flux monthly_flux_unique_key; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_flux
    ADD CONSTRAINT monthly_flux_unique_key UNIQUE (year, month, type, territory_1, territory_2);


--
-- Name: monthly_occupation monthly_occupation_pkey; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_occupation
    ADD CONSTRAINT monthly_occupation_pkey PRIMARY KEY (id);


--
-- Name: monthly_occupation monthly_occupation_unique_key; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.monthly_occupation
    ADD CONSTRAINT monthly_occupation_unique_key UNIQUE (year, month, type, territory);


--
-- Name: perimeters_aggregate perimeters_aggregate_pkey; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.perimeters_aggregate
    ADD CONSTRAINT perimeters_aggregate_pkey PRIMARY KEY (id);


--
-- Name: perimeters_aggregate perimeters_aggregate_unique_key; Type: CONSTRAINT; Schema: observatory; Owner: -
--

ALTER TABLE ONLY observatory.perimeters_aggregate
    ADD CONSTRAINT perimeters_aggregate_unique_key UNIQUE (year, territory, type);


--
-- Name: carpools_by_day_idx; Type: INDEX; Schema: dashboard_stats; Owner: -
--

CREATE INDEX carpools_by_day_idx ON dashboard_stats.carpools_by_day USING btree ("from", "to", start_date, operator_id);


--
-- Name: operators_by_day_idx; Type: INDEX; Schema: dashboard_stats; Owner: -
--

CREATE INDEX operators_by_day_idx ON dashboard_stats.operators_by_day USING btree (territory_id, direction, start_date, operator_id);


--
-- Name: operators_by_month_idx; Type: INDEX; Schema: dashboard_stats; Owner: -
--

CREATE INDEX operators_by_month_idx ON dashboard_stats.operators_by_month USING btree (year, month, territory_id, direction, operator_id);


--
-- Name: perimeters_aggregate_idx; Type: INDEX; Schema: geo_stats; Owner: -
--

CREATE INDEX perimeters_aggregate_idx ON geo_stats.perimeters_aggregate USING btree (year, type, code);


--
-- Name: carpool_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX carpool_by_day_idx ON observatoire_stats.carpool_by_day USING btree ("from", "to", start_date);


--
-- Name: carpool_incentive_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX carpool_incentive_by_day_idx ON observatoire_stats.carpool_incentive_by_day USING btree ("from", "to", start_date);


--
-- Name: carpool_newcomer_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX carpool_newcomer_by_day_idx ON observatoire_stats.carpool_newcomer_by_day USING btree ("from", "to", start_date);


--
-- Name: directions_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX directions_by_day_idx ON observatoire_stats.directions_by_day USING btree (code, type, direction, start_date);


--
-- Name: directions_incentive_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX directions_incentive_by_day_idx ON observatoire_stats.directions_incentive_by_day USING btree (code, type, direction, start_date);


--
-- Name: directions_newcomer_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX directions_newcomer_by_day_idx ON observatoire_stats.directions_newcomer_by_day USING btree (code, type, direction, start_date);


--
-- Name: distribution_by_month_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX distribution_by_month_idx ON observatoire_stats.distribution_by_month USING btree (year, month, code, type, direction);


--
-- Name: distribution_by_semester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX distribution_by_semester_idx ON observatoire_stats.distribution_by_semester USING btree (year, semester, code, type, direction);


--
-- Name: distribution_by_trimester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX distribution_by_trimester_idx ON observatoire_stats.distribution_by_trimester USING btree (year, trimester, code, type, direction);


--
-- Name: distribution_by_year_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX distribution_by_year_idx ON observatoire_stats.distribution_by_year USING btree (year, code, type, direction);


--
-- Name: distribution_distances_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX distribution_distances_by_day_idx ON observatoire_stats.distribution_distances_by_day USING btree (code, type, direction, start_date, dist_classes);


--
-- Name: distribution_hours_by_day_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX distribution_hours_by_day_idx ON observatoire_stats.distribution_hours_by_day USING btree (code, type, direction, start_date, hour);


--
-- Name: flux_by_month_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX flux_by_month_idx ON observatoire_stats.flux_by_month USING btree (year, month, type, territory_1, territory_2);


--
-- Name: flux_by_semester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX flux_by_semester_idx ON observatoire_stats.flux_by_semester USING btree (year, semester, type, territory_1, territory_2);


--
-- Name: flux_by_trimester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX flux_by_trimester_idx ON observatoire_stats.flux_by_trimester USING btree (year, trimester, type, territory_1, territory_2);


--
-- Name: flux_by_year_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX flux_by_year_idx ON observatoire_stats.flux_by_year USING btree (year, type, territory_1, territory_2);


--
-- Name: incentive_by_month_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX incentive_by_month_idx ON observatoire_stats.incentive_by_month USING btree (year, month, code, type, direction);


--
-- Name: incentive_by_semester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX incentive_by_semester_idx ON observatoire_stats.incentive_by_semester USING btree (year, semester, type, code, direction);


--
-- Name: incentive_by_trimester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX incentive_by_trimester_idx ON observatoire_stats.incentive_by_trimester USING btree (year, trimester, type, code, direction);


--
-- Name: incentive_by_year_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX incentive_by_year_idx ON observatoire_stats.incentive_by_year USING btree (year, type, code, direction);


--
-- Name: newcomer_by_month_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX newcomer_by_month_idx ON observatoire_stats.newcomer_by_month USING btree (year, month, code, type, direction);


--
-- Name: newcomer_by_semester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX newcomer_by_semester_idx ON observatoire_stats.newcomer_by_semester USING btree (year, semester, code, type, direction);


--
-- Name: newcomer_by_trimester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX newcomer_by_trimester_idx ON observatoire_stats.newcomer_by_trimester USING btree (year, trimester, code, type, direction);


--
-- Name: newcomer_by_year_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX newcomer_by_year_idx ON observatoire_stats.newcomer_by_year USING btree (year, code, type, direction);


--
-- Name: observatoire_stats_aires_covoiturage_geom_index; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX observatoire_stats_aires_covoiturage_geom_index ON observatoire_stats.aires_covoiturage_old USING gist (geom);


--
-- Name: observatoire_stats_aires_covoiturage_id_index; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX observatoire_stats_aires_covoiturage_id_index ON observatoire_stats.aires_covoiturage_old USING btree (id);


--
-- Name: observatoire_stats_incentive_campaigns_id_index; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX observatoire_stats_incentive_campaigns_id_index ON observatoire_stats.incentive_campaigns_old USING btree (id);


--
-- Name: observatoire_stats_perimeters_aggregate_geom_index; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX observatoire_stats_perimeters_aggregate_geom_index ON observatoire_stats.perimeters_aggregate USING gist (geom);


--
-- Name: observatoire_stats_perimeters_aggregate_id_index; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX observatoire_stats_perimeters_aggregate_id_index ON observatoire_stats.perimeters_aggregate USING btree (id);


--
-- Name: occupation_by_month_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX occupation_by_month_idx ON observatoire_stats.occupation_by_month USING btree (year, month, code, type, direction);


--
-- Name: occupation_by_semester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX occupation_by_semester_idx ON observatoire_stats.occupation_by_semester USING btree (year, semester, code, type, direction);


--
-- Name: occupation_by_trimester_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX occupation_by_trimester_idx ON observatoire_stats.occupation_by_trimester USING btree (year, trimester, code, type, direction);


--
-- Name: occupation_by_year_idx; Type: INDEX; Schema: observatoire_stats; Owner: -
--

CREATE INDEX occupation_by_year_idx ON observatoire_stats.occupation_by_year USING btree (year, code, type, direction);


--
-- Name: monthly_distribution_id_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX monthly_distribution_id_index ON observatory.monthly_distribution USING btree (id);


--
-- Name: monthly_flux_id_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX monthly_flux_id_index ON observatory.monthly_flux USING btree (id);


--
-- Name: monthly_occupation_id_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX monthly_occupation_id_index ON observatory.monthly_occupation USING btree (id);


--
-- Name: observatory_aires_covoiturage_geom_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX observatory_aires_covoiturage_geom_index ON observatory.aires_covoiturage USING gist (geom);


--
-- Name: observatory_aires_covoiturage_id_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX observatory_aires_covoiturage_id_index ON observatory.aires_covoiturage USING btree (id);


--
-- Name: observatory_incentive_campaigns_id_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX observatory_incentive_campaigns_id_index ON observatory.incentive_campaigns USING btree (id);


--
-- Name: observatory_perimeters_aggregate_geom_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX observatory_perimeters_aggregate_geom_index ON observatory.perimeters_aggregate USING gist (geom);


--
-- Name: observatory_perimeters_aggregate_id_index; Type: INDEX; Schema: observatory; Owner: -
--

CREATE INDEX observatory_perimeters_aggregate_id_index ON observatory.perimeters_aggregate USING btree (id);


--
-- PostgreSQL database dump complete
--

