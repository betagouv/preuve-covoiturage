CREATE OR REPLACE PROCEDURE observatory.insert_monthly_flux(year int, month int) 
  LANGUAGE 'plpgsql' 
  AS $$
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
        WHERE year = '|| $1 ||'
        UNION
        SELECT territory,
        l_territory,
        ''com'' as type,
        ROUND(st_x(geom)::numeric,6) as lng,
        ROUND(st_y(geom)::numeric,6) as lat
        FROM geo.perimeters_centroid
        WHERE year = '|| $1 ||'
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
                        ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying)::trip.incentive AS value,
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
                        ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, ''incentive''::character varying)::trip.incentive AS value,
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
        LATERAL ( SELECT array_agg(json_array_elements.value::trip.incentive) AS incentive
              FROM json_array_elements(a.meta -> ''payments''::text) json_array_elements(value)) as f,
        LATERAL ( SELECT array_agg(json_array_elements.value::trip.incentive) AS incentive
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
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = '|| $1 ||'
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = '|| $1 ||'
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = '|| $1 ||'
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = '|| $1 ||'
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = '|| $1 ||'
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = '|| $1 ||'
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
        LEFT JOIN geo.perimeters b ON a.journey_start_insee=b.arr and b.year = '|| $1 ||'
        LEFT JOIN geo.perimeters c ON a.journey_end_insee=c.arr and c.year = '|| $1 ||'
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
  $$;