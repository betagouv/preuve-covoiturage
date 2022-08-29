 SELECT cpp.operator_id,
    COALESCE(pip.policy_id || pid.policy_id, ARRAY[]::integer[]) AS applied_policies,
    cpp.acquisition_id AS journey_id,
    cpp.trip_id,
    ts_ceil(cpp.datetime, 600) AS journey_start_datetime,
    date_part('isodow'::text, cpp.datetime) AS journey_start_weekday,
    date_part('hour'::text, cpp.datetime) AS journey_start_dayhour,
    trunc(st_x(cpp.start_position::geometry)::numeric,
        CASE
            WHEN cts.surface > 0::double precision AND (cts.pop::double precision / (cts.surface::double precision / 100::double precision)) > 40::double precision THEN 3
            ELSE 2
        END) AS journey_start_lon,
    trunc(st_y(cpp.start_position::geometry)::numeric,
        CASE
            WHEN cts.surface > 0::double precision AND (cts.pop::double precision / (cts.surface::double precision / 100::double precision)) > 40::double precision THEN 3
            ELSE 2
        END) AS journey_start_lat,
    cts.arr AS journey_start_insee,
    cts.dep AS journey_start_department,
    cts.l_com AS journey_start_town,
    cts.l_epci AS journey_start_towngroup,
    cts.l_country AS journey_start_country,
    ts_ceil(cpp.datetime + ((cpp.duration || ' seconds'::text)::interval), 600) AS journey_end_datetime,
    trunc(st_x(cpp.end_position::geometry)::numeric,
        CASE
            WHEN cte.surface > 0::double precision AND (cte.pop::double precision / (cte.surface::double precision / 100::double precision)) > 40::double precision THEN 3
            ELSE 2
        END) AS journey_end_lon,
    trunc(st_y(cpp.end_position::geometry)::numeric,
        CASE
            WHEN cte.surface > 0::double precision AND (cte.pop::double precision / (cte.surface::double precision / 100::double precision)) > 40::double precision THEN 3
            ELSE 2
        END) AS journey_end_lat,
    cte.arr AS journey_end_insee,
    cte.dep AS journey_end_department,
    cte.l_com AS journey_end_town,
    cte.l_epci AS journey_end_towngroup,
    cte.l_country AS journey_end_country,
        CASE
            WHEN cpp.distance IS NOT NULL THEN cpp.distance
            ELSE (cpp.meta ->> 'calc_distance'::text)::integer
        END AS journey_distance,
    cpp.distance AS journey_distance_anounced,
    (cpp.meta ->> 'calc_distance'::text)::integer AS journey_distance_calculated,
        CASE
            WHEN cpp.duration IS NOT NULL THEN cpp.duration
            ELSE (cpp.meta ->> 'calc_duration'::text)::integer
        END AS journey_duration,
    cpp.duration AS journey_duration_anounced,
    (cpp.meta ->> 'calc_duration'::text)::integer AS journey_duration_calculated,
    ope.name AS operator,
    cpp.operator_class,
    cpp.operator_journey_id,
    cip.operator_user_id AS operator_passenger_id,
    cid.operator_user_id AS operator_driver_id,
    cip.uuid AS passenger_id,
        CASE
            WHEN cip.travel_pass_name IS NOT NULL THEN '1'::text
            ELSE '0'::text
        END::boolean AS passenger_card,
    cip.over_18 AS passenger_over_18,
    cpp.seats AS passenger_seats,
    abs(cpp.cost) AS passenger_contribution,
    cpip.incentive AS passenger_incentive_raw,
    pip.incentive_raw AS passenger_incentive_rpc_raw,
    pip.incentive_financial_sum AS passenger_incentive_rpc_financial_sum,
    pip.incentive_sum AS passenger_incentive_rpc_sum,
    cid.uuid AS driver_id,
        CASE
            WHEN cid.travel_pass_name IS NOT NULL THEN '1'::text
            ELSE '0'::text
        END::boolean AS driver_card,
    abs(cpd.cost) AS driver_revenue,
    cpid.incentive AS driver_incentive_raw,
    pid.incentive_raw AS driver_incentive_rpc_raw,
    pid.incentive_financial_sum AS driver_incentive_rpc_financial_sum,
    pid.incentive_sum AS driver_incentive_rpc_sum,
    cpp.status
   FROM carpool.carpools cpp
     JOIN operator.operators ope ON ope._id = cpp.operator_id
     LEFT JOIN carpool.carpools cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true
     LEFT JOIN carpool.identities cip ON cip._id = cpp.identity_id
     LEFT JOIN carpool.identities cid ON cid._id = cpd.identity_id
     LEFT JOIN geo.perimeters cts ON cts.arr::text = cpp.start_geo_code::text AND cts.year = geo.get_latest_millesime_or(date_part('year'::text, cpp.datetime)::smallint)
     LEFT JOIN geo.perimeters cte ON cte.arr::text = cpp.end_geo_code::text AND cte.year = geo.get_latest_millesime_or(date_part('year'::text, cpp.datetime)::smallint),
    LATERAL ( WITH data AS (
                 SELECT pi.policy_id,
                    sum(pi.amount) AS amount
                   FROM policy.incentives pi
                  WHERE pi.carpool_id = cpp._id AND pi.status = 'validated'::policy.incentive_status_enum
                  GROUP BY pi.policy_id
                ), incentive AS (
                 SELECT data.policy_id,
                    ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, 'incentive'::character varying)::trip.incentive AS value,
                    data.amount,
                        CASE
                            WHEN pp.unit = 'point'::policy.policy_unit_enum THEN false
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
           FROM incentive) pip,
    LATERAL ( WITH data AS (
                 SELECT pi.policy_id,
                    sum(pi.amount) AS amount
                   FROM policy.incentives pi
                  WHERE pi.carpool_id = cpd._id AND pi.status = 'validated'::policy.incentive_status_enum
                  GROUP BY pi.policy_id
                ), incentive AS (
                 SELECT data.policy_id,
                    ROW(cc.siret, data.amount::integer, pp.unit::character varying, data.policy_id, pp.name, 'incentive'::character varying)::trip.incentive AS value,
                    data.amount,
                        CASE
                            WHEN pp.unit = 'point'::policy.policy_unit_enum THEN false
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
           FROM incentive) pid,
    LATERAL ( SELECT array_agg(json_array_elements.value::trip.incentive) AS incentive
           FROM json_array_elements(cpp.meta -> 'payments'::text) json_array_elements(value)) cpip,
    LATERAL ( SELECT array_agg(json_array_elements.value::trip.incentive) AS incentive
           FROM json_array_elements(cpd.meta -> 'payments'::text) json_array_elements(value)) cpid
  WHERE cpp.is_driver = false;