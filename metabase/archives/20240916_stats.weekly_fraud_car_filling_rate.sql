 WITH journeys AS (
         SELECT list.trip_id,
            list.journey_start_insee AS insee,
            'origin'::text AS one_way,
            list.journey_distance,
            list.passenger_seats
           FROM trip.list
          WHERE list.journey_start_datetime > date_trunc('day'::text, now() - '1 mon'::interval) AND list.journey_start_datetime < now()
        UNION ALL
         SELECT list.trip_id,
            list.journey_end_insee AS insee,
            'destination'::text AS one_way,
            list.journey_distance,
            list.passenger_seats
           FROM trip.list
          WHERE list.journey_start_datetime > date_trunc('day'::text, now() - '1 mon'::interval) AND list.journey_start_datetime < now()
        ), distances AS (
         SELECT journeys.trip_id,
            journeys.insee,
            journeys.journey_distance * journeys.passenger_seats AS passengers_distance,
                CASE
                    WHEN row_number() OVER (PARTITION BY journeys.insee, journeys.trip_id ORDER BY journeys.journey_distance DESC) = 1 THEN journeys.journey_distance
                    ELSE 0
                END AS driver_distance
           FROM journeys
        ), sum_distances AS (
         SELECT distances.insee,
            count(DISTINCT distances.trip_id) AS journeys,
            sum(distances.passengers_distance) AS passengers_distance,
            sum(distances.driver_distance) AS driver_distance
           FROM distances
          GROUP BY distances.insee
        )
 SELECT sum_distances.insee,
    sum_distances.journeys,
    sum_distances.passengers_distance,
    sum_distances.driver_distance,
    round((sum_distances.passengers_distance + sum_distances.driver_distance)::numeric / sum_distances.driver_distance::numeric, 2) AS occupation_rate
   FROM sum_distances
  WHERE sum_distances.journeys > 100 AND round((sum_distances.passengers_distance + sum_distances.driver_distance)::numeric / sum_distances.driver_distance::numeric, 2) > 3::numeric
  ORDER BY (round((sum_distances.passengers_distance + sum_distances.driver_distance)::numeric / sum_distances.driver_distance::numeric, 2)) DESC;