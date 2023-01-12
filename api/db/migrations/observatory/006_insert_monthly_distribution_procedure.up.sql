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
      WHERE year = '|| $1 ||'
      UNION ALL
      SELECT territory,
      l_territory,
      ''com'' as type
      FROM geo.perimeters_centroid
      WHERE year = '|| $1 ||'
      AND type = ''country''
      AND territory <>''XXXXX''
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
      FROM trip.list
      WHERE date_part(''year'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $1 ||'
      AND date_part(''month'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $2 ||'
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
      FROM trip.list
      WHERE date_part(''year'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $1 ||'
      AND date_part(''month'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $2 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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