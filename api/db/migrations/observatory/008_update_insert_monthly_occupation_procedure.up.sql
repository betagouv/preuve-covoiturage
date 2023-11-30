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
$$;