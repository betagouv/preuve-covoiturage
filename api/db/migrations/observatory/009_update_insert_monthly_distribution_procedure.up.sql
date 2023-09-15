CREATE OR REPLACE PROCEDURE observatory.insert_monthly_distribution(year int, month int) 
  LANGUAGE 'plpgsql' 
  AS $$
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
      ts_ceil(a.datetime, 600) AS journey_start_datetime,
      st_x(a.start_position::geometry)::numeric AS journey_start_lon,
      st_y(a.start_position::geometry)::numeric AS journey_start_lat,
      cts.arr AS journey_start_insee,
      ts_ceil(a.datetime + ((a.duration || ''seconds''::text)::interval), 600) AS journey_end_datetime,
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
$$;