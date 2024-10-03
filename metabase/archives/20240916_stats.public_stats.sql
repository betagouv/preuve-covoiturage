 WITH trip_stats AS (
         SELECT trunc(sum(list.passenger_seats)::numeric / count(DISTINCT list.trip_id)::numeric + 1::numeric, 2)::double precision AS average_carpoolers_by_car,
            count(DISTINCT list.operator_id) AS operators_count,
            count(DISTINCT list.trip_id) AS validated_trips_count
           FROM trip.list
        ), carpools_stats AS (
         SELECT count(DISTINCT carpools.trip_id) AS fraudulous_trips_count
           FROM carpool.carpools
          WHERE carpools.status <> 'ok'::carpool.carpool_status_enum
        ), incentives_stats AS (
         SELECT count(DISTINCT list.trip_id) AS subsidized_trips_count
           FROM trip.list
          WHERE list.driver_incentive_rpc_financial_sum > 0 OR list.passenger_incentive_rpc_financial_sum > 0
        )
 SELECT trip_stats.average_carpoolers_by_car,
    trip_stats.operators_count,
    trip_stats.validated_trips_count,
    carpools_stats.fraudulous_trips_count,
    incentives_stats.subsidized_trips_count
   FROM trip_stats,
    carpools_stats,
    incentives_stats;