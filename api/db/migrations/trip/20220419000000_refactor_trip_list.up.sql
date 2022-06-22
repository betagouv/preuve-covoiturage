ALTER TABLE trip.list
  DROP COLUMN IF EXISTS start_territory_id,
  DROP COLUMN IF EXISTS end_territory_id,
  DROP COLUMN IF EXISTS journey_start_postalcode,
  DROP COLUMN IF EXISTS journey_end_postalcode;

DROP VIEW IF EXISTS trip.list_view;
CREATE VIEW trip.list_view AS (
  SELECT
  -- THIS IS FOR AUTH AND SEARCH ONLY --
    cpp.operator_id as operator_id,
    COALESCE((pip.policy_id || pid.policy_id)::int[], ARRAY[]::int[]) as applied_policies,

    -- DATA --
    cpp.acquisition_id as journey_id,
    cpp.trip_id as trip_id,

    ts_ceil(cpp.datetime, 600) as journey_start_datetime,
    extract(isodow from cpp.datetime) as journey_start_weekday,
    extract(hour from cpp.datetime) as journey_start_dayhour,

    trunc(
      ST_X(cpp.start_position::geometry)::numeric,
      CASE WHEN (
        cts.surface > 0 AND 
        (cts.pop::float / (cts.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_start_lon,
    trunc(
      ST_Y(cpp.start_position::geometry)::numeric,
      CASE WHEN (
        cts.surface > 0 AND 
        (cts.pop::float / (cts.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_start_lat,

    cts.com as journey_start_insee,
    cts.dep as journey_start_department,
    cts.l_com as journey_start_town,
    cts.l_epci as journey_start_towngroup,
    cts.l_country as journey_start_country,

    ts_ceil((cpp.datetime + (cpp.duration || ' seconds')::interval), 600) as journey_end_datetime,

    trunc(
      ST_X(cpp.end_position::geometry)::numeric,
      CASE WHEN (
        cte.surface > 0 AND 
        (cte.pop::float / (cte.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_end_lon,
    trunc(
      ST_Y(cpp.end_position::geometry)::numeric,
      CASE WHEN (
        cte.surface > 0 AND 
        (cte.pop::float / (cte.surface::float / 100)) > 40
      )
      THEN 3 
      ELSE 2
      END
    ) as journey_end_lat,

    cte.com as journey_end_insee,
    cte.dep as journey_end_department,
    cte.l_com journey_end_town,
    cte.l_epci as journey_end_towngroup,
    cte.l_country as journey_end_country,

    (CASE WHEN cpp.distance IS NOT NULL THEN cpp.distance ELSE (cpp.meta::json->>'calc_distance')::int END) as journey_distance,
    cpp.distance as journey_distance_anounced,
    (cpp.meta::json->>'calc_distance')::int as journey_distance_calculated,

    (CASE WHEN cpp.duration IS NOT NULL THEN cpp.duration ELSE (cpp.meta::json->>'calc_duration')::int END) as journey_duration,
    cpp.duration as journey_duration_anounced,
    (cpp.meta::json->>'calc_duration')::int as journey_duration_calculated,

    ope.name as operator,
    cpp.operator_class as operator_class,
    cpp.operator_journey_id as operator_journey_id,
    cip.operator_user_id as operator_passenger_id,
    cid.operator_user_id as operator_driver_id,

    cip.uuid as passenger_id,
    (CASE WHEN cip.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as passenger_card,
    cip.over_18 as passenger_over_18,
    cpp.seats as passenger_seats,

    abs(cpp.cost) as passenger_contribution,
    cpip.incentive::trip.incentive[] as passenger_incentive_raw,
    pip.incentive_raw::trip.incentive[] as passenger_incentive_rpc_raw,
    pip.incentive_financial_sum as passenger_incentive_rpc_financial_sum,
    pip.incentive_sum as passenger_incentive_rpc_sum,

    cid.uuid as driver_id,
    (CASE WHEN cid.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as driver_card,

    abs(cpd.cost) as driver_revenue,
    cpid.incentive::trip.incentive[] as driver_incentive_raw,
    pid.incentive_raw::trip.incentive[] as driver_incentive_rpc_raw,
    pid.incentive_financial_sum as driver_incentive_rpc_financial_sum,
    pid.incentive_sum as driver_incentive_rpc_sum,

    cpp.status as status
    -- status_message
  FROM carpool.carpools as cpp
  JOIN operator.operators as ope ON ope._id = cpp.operator_id::int
  LEFT JOIN carpool.carpools AS cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true
  LEFT JOIN carpool.identities AS cip ON cip._id = cpp.identity_id
  LEFT JOIN carpool.identities AS cid ON cid._id = cpd.identity_id
  LEFT JOIN geo.perimeters AS cts ON
    cts.arr = cpp.start_geo_code AND 
    cts.year = geo.get_latest_millesime_or(EXTRACT(YEAR FROM cpp.datetime)::smallint)
  LEFT JOIN geo.perimeters AS cte ON
    cte.arr = cpp.end_geo_code AND 
    cte.year = geo.get_latest_millesime_or(EXTRACT(YEAR FROM cpp.datetime)::smallint),
  LATERAL (
    WITH data AS (
      SELECT
        pi.policy_id,
        sum(pi.amount) as amount
      FROM policy.incentives as pi
      WHERE pi.carpool_id = cpp._id
      AND pi.status = 'validated'::policy.incentive_status_enum
      GROUP BY pi.policy_id
    ),
    incentive AS (
      SELECT
        data.policy_id as policy_id,
        ROW(
          cc.siret,
          data.amount,
          pp.unit::varchar,
          data.policy_id,
          pp.name::varchar,
          'incentive'
        )::trip.incentive as value,
        data.amount as amount,
        CASE WHEN pp.unit = 'point'::policy.policy_unit_enum THEN false ELSE true END as financial
      FROM data
      LEFT JOIN policy.policies as pp on pp._id = data.policy_id
      LEFT JOIN territory.territories as tt on pp.territory_id = tt._id
      LEFT JOIN company.companies as cc on cc._id = tt.company_id
    )
    SELECT
      array_agg(
        incentive.value
      ) as incentive_raw,
      sum(incentive.amount) as incentive_sum,
      sum(incentive.amount) FILTER (WHERE incentive.financial IS true) as incentive_financial_sum,
      array_agg(incentive.policy_id) as policy_id
    FROM incentive
  ) as pip,
  LATERAL (
    WITH data AS (
      SELECT
        pi.policy_id,
        sum(pi.amount) as amount
      FROM policy.incentives as pi
      WHERE pi.carpool_id = cpd._id
      AND pi.status = 'validated'::policy.incentive_status_enum
      GROUP BY pi.policy_id
    ),
    incentive AS (
      SELECT
        data.policy_id as policy_id,
        ROW(
          cc.siret,
          data.amount,
          pp.unit::varchar,
          data.policy_id,
          pp.name::varchar,
          'incentive'
        )::trip.incentive as value,
        data.amount as amount,
        CASE WHEN pp.unit = 'point'::policy.policy_unit_enum THEN false ELSE true END as financial
      FROM data
      LEFT JOIN policy.policies as pp on pp._id = data.policy_id
      LEFT JOIN territory.territories as tt on pp.territory_id = tt._id
      LEFT JOIN company.companies as cc on cc._id = tt.company_id
    )
    SELECT
      array_agg(
        incentive.value
      ) as incentive_raw,
      sum(incentive.amount) as incentive_sum,
      sum(incentive.amount) FILTER (WHERE incentive.financial IS true) as incentive_financial_sum,
      array_agg(incentive.policy_id) as policy_id
    FROM incentive
  ) as pid,
  LATERAL (
    SELECT
      array_agg(
        value::trip.incentive
      ) as incentive
    FROM json_array_elements(cpp.meta->'payments')
  ) as cpip,
  LATERAL (
      SELECT
      array_agg(
        value::trip.incentive
      ) as incentive
    FROM json_array_elements(cpd.meta->'payments')
  ) as cpid
  WHERE cpp.is_driver = false
);

CREATE OR REPLACE FUNCTION hydrate_trip_from_policy() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trip.list ( 
      operator_id,
      applied_policies,
      journey_id,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
      journey_end_department,
      journey_end_town,
      journey_end_towngroup,
      journey_end_country,
      journey_distance,
      journey_distance_anounced,
      journey_distance_calculated,
      journey_duration,
      journey_duration_anounced,
      journey_duration_calculated,
      operator,
      operator_class,
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) SELECT
      tv.operator_id,
      tv.applied_policies,
      tv.journey_id,
      tv.trip_id,
      tv.journey_start_datetime,
      tv.journey_start_weekday,
      tv.journey_start_dayhour,
      tv.journey_start_lon,
      tv.journey_start_lat,
      tv.journey_start_insee,
      tv.journey_start_department,
      tv.journey_start_town,
      tv.journey_start_towngroup,
      tv.journey_start_country,
      tv.journey_end_datetime,
      tv.journey_end_lon,
      tv.journey_end_lat,
      tv.journey_end_insee,
      tv.journey_end_department,
      tv.journey_end_town,
      tv.journey_end_towngroup,
      tv.journey_end_country,
      tv.journey_distance,
      tv.journey_distance_anounced,
      tv.journey_distance_calculated,
      tv.journey_duration,
      tv.journey_duration_anounced,
      tv.journey_duration_calculated,
      tv.operator,
      tv.operator_class,
      tv.operator_journey_id,
      tv.operator_passenger_id,
      tv.operator_driver_id,
      tv.passenger_id,
      tv.passenger_card,
      tv.passenger_over_18,
      tv.passenger_seats,
      tv.passenger_contribution,
      tv.passenger_incentive_raw,
      tv.passenger_incentive_rpc_raw,
      tv.passenger_incentive_rpc_sum,
      tv.passenger_incentive_rpc_financial_sum,
      tv.driver_id,
      tv.driver_card,
      tv.driver_revenue,
      tv.driver_incentive_raw,
      tv.driver_incentive_rpc_raw,
      tv.driver_incentive_rpc_sum,
      tv.driver_incentive_rpc_financial_sum,
      tv.status
    FROM carpool.carpools AS cc
    LEFT JOIN trip.list_view AS tv ON tv.journey_id = cc.acquisition_id
    WHERE cc._id = NEW.carpool_id
    ON CONFLICT (journey_id)
    DO UPDATE SET (
      operator_id,
      applied_policies,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
      journey_end_department,
      journey_end_town,
      journey_end_towngroup,
      journey_end_country,
      journey_distance,
      journey_distance_anounced,
      journey_distance_calculated,
      journey_duration,
      journey_duration_anounced,
      journey_duration_calculated,
      operator,
      operator_class,
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) = (
      excluded.operator_id,
      excluded.applied_policies,
      excluded.trip_id,
      excluded.journey_start_datetime,
      excluded.journey_start_weekday,
      excluded.journey_start_dayhour,
      excluded.journey_start_lon,
      excluded.journey_start_lat,
      excluded.journey_start_insee,
      excluded.journey_start_department,
      excluded.journey_start_town,
      excluded.journey_start_towngroup,
      excluded.journey_start_country,
      excluded.journey_end_datetime,
      excluded.journey_end_lon,
      excluded.journey_end_lat,
      excluded.journey_end_insee,
      excluded.journey_end_department,
      excluded.journey_end_town,
      excluded.journey_end_towngroup,
      excluded.journey_end_country,
      excluded.journey_distance,
      excluded.journey_distance_anounced,
      excluded.journey_distance_calculated,
      excluded.journey_duration,
      excluded.journey_duration_anounced,
      excluded.journey_duration_calculated,
      excluded.operator,
      excluded.operator_class,
      excluded.operator_journey_id,
      excluded.operator_passenger_id,
      excluded.operator_driver_id,
      excluded.passenger_id,
      excluded.passenger_card,
      excluded.passenger_over_18,
      excluded.passenger_seats,
      excluded.passenger_contribution,
      excluded.passenger_incentive_raw,
      excluded.passenger_incentive_rpc_raw,
      excluded.passenger_incentive_rpc_sum,
      excluded.passenger_incentive_rpc_financial_sum,
      excluded.driver_id,
      excluded.driver_card,
      excluded.driver_revenue,
      excluded.driver_incentive_raw,
      excluded.driver_incentive_rpc_raw,
      excluded.driver_incentive_rpc_sum,
      excluded.driver_incentive_rpc_financial_sum,
      excluded.status
    );
    RETURN NULL;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION hydrate_trip_from_carpool() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trip.list ( 
      operator_id,
      applied_policies,
      journey_id,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
      journey_end_department,
      journey_end_town,
      journey_end_towngroup,
      journey_end_country,
      journey_distance,
      journey_distance_anounced,
      journey_distance_calculated,
      journey_duration,
      journey_duration_anounced,
      journey_duration_calculated,
      operator,
      operator_class,
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) SELECT
      operator_id,
      applied_policies,
      journey_id,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
      journey_end_department,
      journey_end_town,
      journey_end_towngroup,
      journey_end_country,
      journey_distance,
      journey_distance_anounced,
      journey_distance_calculated,
      journey_duration,
      journey_duration_anounced,
      journey_duration_calculated,
      operator,
      operator_class,
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    FROM trip.list_view WHERE journey_id = NEW.acquisition_id
    ON CONFLICT (journey_id)
    DO UPDATE SET (
      operator_id,
      applied_policies,
      trip_id,
      journey_start_datetime,
      journey_start_weekday,
      journey_start_dayhour,
      journey_start_lon,
      journey_start_lat,
      journey_start_insee,
      journey_start_department,
      journey_start_town,
      journey_start_towngroup,
      journey_start_country,
      journey_end_datetime,
      journey_end_lon,
      journey_end_lat,
      journey_end_insee,
      journey_end_department,
      journey_end_town,
      journey_end_towngroup,
      journey_end_country,
      journey_distance,
      journey_distance_anounced,
      journey_distance_calculated,
      journey_duration,
      journey_duration_anounced,
      journey_duration_calculated,
      operator,
      operator_class,
      operator_journey_id,
      operator_passenger_id,
      operator_driver_id,
      passenger_id,
      passenger_card,
      passenger_over_18,
      passenger_seats,
      passenger_contribution,
      passenger_incentive_raw,
      passenger_incentive_rpc_raw,
      passenger_incentive_rpc_sum,
      passenger_incentive_rpc_financial_sum,
      driver_id,
      driver_card,
      driver_revenue,
      driver_incentive_raw,
      driver_incentive_rpc_raw,
      driver_incentive_rpc_sum,
      driver_incentive_rpc_financial_sum,
      status
    ) = (
      excluded.operator_id,
      excluded.applied_policies,
      excluded.trip_id,
      excluded.journey_start_datetime,
      excluded.journey_start_weekday,
      excluded.journey_start_dayhour,
      excluded.journey_start_lon,
      excluded.journey_start_lat,
      excluded.journey_start_insee,
      excluded.journey_start_department,
      excluded.journey_start_town,
      excluded.journey_start_towngroup,
      excluded.journey_start_country,
      excluded.journey_end_datetime,
      excluded.journey_end_lon,
      excluded.journey_end_lat,
      excluded.journey_end_insee,
      excluded.journey_end_department,
      excluded.journey_end_town,
      excluded.journey_end_towngroup,
      excluded.journey_end_country,
      excluded.journey_distance,
      excluded.journey_distance_anounced,
      excluded.journey_distance_calculated,
      excluded.journey_duration,
      excluded.journey_duration_anounced,
      excluded.journey_duration_calculated,
      excluded.operator,
      excluded.operator_class,
      excluded.operator_journey_id,
      excluded.operator_passenger_id,
      excluded.operator_driver_id,
      excluded.passenger_id,
      excluded.passenger_card,
      excluded.passenger_over_18,
      excluded.passenger_seats,
      excluded.passenger_contribution,
      excluded.passenger_incentive_raw,
      excluded.passenger_incentive_rpc_raw,
      excluded.passenger_incentive_rpc_sum,
      excluded.passenger_incentive_rpc_financial_sum,
      excluded.driver_id,
      excluded.driver_card,
      excluded.driver_revenue,
      excluded.driver_incentive_raw,
      excluded.driver_incentive_rpc_raw,
      excluded.driver_incentive_rpc_sum,
      excluded.driver_incentive_rpc_financial_sum,
      excluded.status
    );
    RETURN NULL;
END;
$$ language plpgsql;

