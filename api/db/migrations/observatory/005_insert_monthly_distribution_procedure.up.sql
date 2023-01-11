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
      type,
      geom
      FROM geo.perimeters_centroid
      WHERE year = '|| $1 ||'
      UNION
      SELECT territory,
      l_territory,
      ''com'' as type,
      geom
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
    distribution as(
      SELECT 
      insee,
      direction,
      count(journey_id) FILTER (WHERE hour=0) AS h0,
      count(journey_id) FILTER (WHERE hour=1) AS h1,
      count(journey_id) FILTER (WHERE hour=2) AS h2,
      count(journey_id) FILTER (WHERE hour=3) AS h3,
      count(journey_id) FILTER (WHERE hour=4) AS h4,
      count(journey_id) FILTER (WHERE hour=5) AS h5,
      count(journey_id) FILTER (WHERE hour=6) AS h6,
      count(journey_id) FILTER (WHERE hour=7) AS h7,
      count(journey_id) FILTER (WHERE hour=8) AS h8,
      count(journey_id) FILTER (WHERE hour=9) AS h9,
      count(journey_id) FILTER (WHERE hour=10) AS h10,
      count(journey_id) FILTER (WHERE hour=11) AS h11,
      count(journey_id) FILTER (WHERE hour=12) AS h12,
      count(journey_id) FILTER (WHERE hour=13) AS h13,
      count(journey_id) FILTER (WHERE hour=14) AS h14,
      count(journey_id) FILTER (WHERE hour=15) AS h15,
      count(journey_id) FILTER (WHERE hour=16) AS h16,
      count(journey_id) FILTER (WHERE hour=17) AS h17,
      count(journey_id) FILTER (WHERE hour=18) AS h18,
      count(journey_id) FILTER (WHERE hour=19) AS h19,
      count(journey_id) FILTER (WHERE hour=20) AS h20,
      count(journey_id) FILTER (WHERE hour=21) AS h21,
      count(journey_id) FILTER (WHERE hour=22) AS h22,
      count(journey_id) FILTER (WHERE hour=23) AS h23,
      count(journey_id) FILTER (WHERE dist_classes=''0-10'') AS dist_0_10,
      count(journey_id) FILTER (WHERE dist_classes=''10-20'') AS dist_10_20,
      count(journey_id) FILTER (WHERE dist_classes=''20-30'') AS dist_20_30,
      count(journey_id) FILTER (WHERE dist_classes=''30-40'') AS dist_30_40,
      count(journey_id) FILTER (WHERE dist_classes=''40-50'') AS dist_40_50,
      count(journey_id) FILTER (WHERE dist_classes=''>50'') AS dist_more50
      FROM journeys
      GROUP BY insee,direction
      ),
      sum_distribution as (
      SELECT 
      ''com'' as type, 
      a.direction,
      b.arr as territory,  
      sum(h0) as h0,
      sum(h1) as h1,
      sum(h2) as h2,
      sum(h3) as h3,
      sum(h4) as h4,
      sum(h5) as h5,
      sum(h6) as h6,
      sum(h7) as h7,
      sum(h8) as h8,
      sum(h9) as h9,
      sum(h10) as h10,
      sum(h11) as h11,
      sum(h12) as h12,
      sum(h13) as h13,
      sum(h14) as h14,
      sum(h15) as h15,
      sum(h16) as h16,
      sum(h17) as h17,
      sum(h18) as h18,
      sum(h19) as h19,
      sum(h20) as h20,
      sum(h21) as h21,
      sum(h22) as h22,
      sum(h23) as h23,
      sum(dist_0_10) as dist_0_10,
      sum(dist_10_20) as dist_10_20,
      sum(dist_20_30) as dist_20_30,
      sum(dist_30_40) as dist_30_40,
      sum(dist_40_50) as dist_40_50,
      sum(dist_more50) as dist_more50
      FROM distribution a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||' and b.com is not null
      GROUP BY a.direction, b.arr
      HAVING b.arr IS NOT NULL
      UNION
      SELECT ''epci'' as type, 
      a.direction,
      b.epci as territory, 
      sum(h0) as h0,
      sum(h1) as h1,
      sum(h2) as h2,
      sum(h3) as h3,
      sum(h4) as h4,
      sum(h5) as h5,
      sum(h6) as h6,
      sum(h7) as h7,
      sum(h8) as h8,
      sum(h9) as h9,
      sum(h10) as h10,
      sum(h11) as h11,
      sum(h12) as h12,
      sum(h13) as h13,
      sum(h14) as h14,
      sum(h15) as h15,
      sum(h16) as h16,
      sum(h17) as h17,
      sum(h18) as h18,
      sum(h19) as h19,
      sum(h20) as h20,
      sum(h21) as h21,
      sum(h22) as h22,
      sum(h23) as h23,
      sum(dist_0_10) as dist_0_10,
      sum(dist_10_20) as dist_10_20,
      sum(dist_20_30) as dist_20_30,
      sum(dist_30_40) as dist_30_40,
      sum(dist_40_50) as dist_40_50,
      sum(dist_more50) as dist_more50
      FROM distribution a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
      GROUP BY a.direction, b.epci, b.l_epci
      HAVING b.epci IS NOT NULL
      UNION
      SELECT ''aom'' as type,
      a.direction, 
      b.aom as territory, 
      sum(h0) as h0,
      sum(h1) as h1,
      sum(h2) as h2,
      sum(h3) as h3,
      sum(h4) as h4,
      sum(h5) as h5,
      sum(h6) as h6,
      sum(h7) as h7,
      sum(h8) as h8,
      sum(h9) as h9,
      sum(h10) as h10,
      sum(h11) as h11,
      sum(h12) as h12,
      sum(h13) as h13,
      sum(h14) as h14,
      sum(h15) as h15,
      sum(h16) as h16,
      sum(h17) as h17,
      sum(h18) as h18,
      sum(h19) as h19,
      sum(h20) as h20,
      sum(h21) as h21,
      sum(h22) as h22,
      sum(h23) as h23,
      sum(dist_0_10) as dist_0_10,
      sum(dist_10_20) as dist_10_20,
      sum(dist_20_30) as dist_20_30,
      sum(dist_30_40) as dist_30_40,
      sum(dist_40_50) as dist_40_50,
      sum(dist_more50) as dist_more50
      FROM distribution a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
      GROUP BY a.direction, b.aom, b.l_aom
      HAVING b.aom IS NOT NULL
      UNION
      SELECT ''dep'' as type,
      a.direction, 
      b.dep as territory,
      sum(h0) as h0,
      sum(h1) as h1,
      sum(h2) as h2,
      sum(h3) as h3,
      sum(h4) as h4,
      sum(h5) as h5,
      sum(h6) as h6,
      sum(h7) as h7,
      sum(h8) as h8,
      sum(h9) as h9,
      sum(h10) as h10,
      sum(h11) as h11,
      sum(h12) as h12,
      sum(h13) as h13,
      sum(h14) as h14,
      sum(h15) as h15,
      sum(h16) as h16,
      sum(h17) as h17,
      sum(h18) as h18,
      sum(h19) as h19,
      sum(h20) as h20,
      sum(h21) as h21,
      sum(h22) as h22,
      sum(h23) as h23,
      sum(dist_0_10) as dist_0_10,
      sum(dist_10_20) as dist_10_20,
      sum(dist_20_30) as dist_20_30,
      sum(dist_30_40) as dist_30_40,
      sum(dist_40_50) as dist_40_50,
      sum(dist_more50) as dist_more50
      FROM distribution a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
      GROUP BY a.direction, b.dep, b.l_dep
      HAVING b.dep IS NOT NULL
      UNION
      SELECT ''reg'' as type,
      a.direction,
      b.reg as territory, 
      sum(h0) as h0,
      sum(h1) as h1,
      sum(h2) as h2,
      sum(h3) as h3,
      sum(h4) as h4,
      sum(h5) as h5,
      sum(h6) as h6,
      sum(h7) as h7,
      sum(h8) as h8,
      sum(h9) as h9,
      sum(h10) as h10,
      sum(h11) as h11,
      sum(h12) as h12,
      sum(h13) as h13,
      sum(h14) as h14,
      sum(h15) as h15,
      sum(h16) as h16,
      sum(h17) as h17,
      sum(h18) as h18,
      sum(h19) as h19,
      sum(h20) as h20,
      sum(h21) as h21,
      sum(h22) as h22,
      sum(h23) as h23,
      sum(dist_0_10) as dist_0_10,
      sum(dist_10_20) as dist_10_20,
      sum(dist_20_30) as dist_20_30,
      sum(dist_30_40) as dist_30_40,
      sum(dist_40_50) as dist_40_50,
      sum(dist_more50) as dist_more50
      FROM distribution a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
      GROUP BY a.direction, b.reg, b.l_reg
      HAVING b.reg IS NOT NULL
      UNION
      SELECT ''country'' as type,
      a.direction, 
      b.country as territory, 
      sum(h0) as h0,
      sum(h1) as h1,
      sum(h2) as h2,
      sum(h3) as h3,
      sum(h4) as h4,
      sum(h5) as h5,
      sum(h6) as h6,
      sum(h7) as h7,
      sum(h8) as h8,
      sum(h9) as h9,
      sum(h10) as h10,
      sum(h11) as h11,
      sum(h12) as h12,
      sum(h13) as h13,
      sum(h14) as h14,
      sum(h15) as h15,
      sum(h16) as h16,
      sum(h17) as h17,
      sum(h18) as h18,
      sum(h19) as h19,
      sum(h20) as h20,
      sum(h21) as h21,
      sum(h22) as h22,
      sum(h23) as h23,
      sum(dist_0_10) as dist_0_10,
      sum(dist_10_20) as dist_10_20,
      sum(dist_20_30) as dist_20_30,
      sum(dist_30_40) as dist_30_40,
      sum(dist_40_50) as dist_40_50,
      sum(dist_more50) as dist_more50
      FROM distribution a
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
      GROUP BY a.direction, b.country, b.l_country
      HAVING b.country IS NOT NULL
    )
    SELECT '|| $1 ||' as year,
      '|| $2 ||' as month,
      a.territory,
      b.l_territory,
      a.type::observatory.monthly_distribution_type_enum,
      a.direction::observatory.monthly_distribution_direction_enum,
      a.h0,
      a.h1,
      a.h2,
      a.h3,
      a.h4,
      a.h5,
      a.h6,
      a.h7,
      a.h8,
      a.h9,
      a.h10,
      a.h11,
      a.h12,
      a.h13,
      a.h14,
      a.h15,
      a.h16,
      a.h17,
      a.h18,
      a.h19,
      a.h20,
      a.h21,
      a.h22,
      a.h23,
      a.dist_0_10,
      a.dist_10_20,
      a.dist_20_30,
      a.dist_30_40,
      a.dist_40_50,
      a.dist_more50
      from sum_distribution a
      LEFT JOIN perim b on a.territory=b.territory and a.type=b.type
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
    h0,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    h7,
    h8,
    h9,
    h10,
    h11,
    h12,
    h13,
    h14,
    h15,
    h16,
    h17,
    h18,
    h19,
    h20,
    h21,
    h22,
    h23,
    dist_0_10,
    dist_10_20,
    dist_20_30,
    dist_30_40,
    dist_40_50,
    dist_more50 
  )
  SELECT * FROM temp_distribution
  ON CONFLICT 
  ON CONSTRAINT monthly_distribution_unique_key
  DO NOTHING;
  DROP TABLE temp_distribution;
  END
$$;