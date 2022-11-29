CREATE OR REPLACE PROCEDURE observatory.insert_monthly_occupation(year int, month int) 
  LANGUAGE 'plpgsql' 
  AS $$
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
      FROM trip.list
      WHERE date_part(''year'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $1 ||'
      AND date_part(''month'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $2 ||'
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
      FROM trip.list
      WHERE date_part(''year'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $1 ||'
      AND date_part(''month'', journey_start_datetime::timestamptz AT TIME ZONE ''UTC'') = '|| $2 ||'
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
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||' and b.com is not null
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
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
      LEFT JOIN geo.perimeters b ON a.insee=b.arr and b.year = '|| $1 ||'
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
$$;