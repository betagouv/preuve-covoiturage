 SELECT to_char(list.journey_start_datetime::date::timestamp with time zone, 'yyyy-mm'::text) AS month,
    COALESCE(sum(list.passenger_seats), 0::bigint)::integer AS trip,
    COALESCE(sum(list.journey_distance / 1000 * list.passenger_seats), 0::bigint)::integer AS distance,
    (count(DISTINCT list.driver_id) + count(DISTINCT list.passenger_id))::integer AS carpoolers,
    count(DISTINCT list.operator_id)::integer AS operators,
    trunc(sum(list.passenger_seats)::numeric / count(DISTINCT list.trip_id)::numeric + 1::numeric, 2)::double precision AS average_carpoolers_by_car,
    count(*) FILTER (WHERE array_to_string(list.driver_incentive_raw, ', '::text) ~~ '%incentive%'::text OR array_to_string(list.passenger_incentive_raw, ', '::text) ~~ '%incentive%'::text) AS trip_operator_subsidized,
    count(*) FILTER (WHERE (COALESCE(list.passenger_incentive_rpc_sum, 0) + COALESCE(list.driver_incentive_rpc_sum, 0)) > 0)::integer AS trip_subsidized,
    COALESCE(sum(COALESCE(list.passenger_incentive_rpc_financial_sum, 0) + COALESCE(list.driver_incentive_rpc_financial_sum, 0)), 0::bigint)::integer AS financial_incentive_sum,
    COALESCE(sum(COALESCE(list.passenger_incentive_rpc_sum, 0) + COALESCE(list.driver_incentive_rpc_sum, 0)), 0::bigint)::integer AS incentive_sum
   FROM trip.list
  WHERE list.journey_start_datetime >= (now() - '2 years'::interval)
  GROUP BY (to_char(list.journey_start_datetime::date::timestamp with time zone, 'yyyy-mm'::text));