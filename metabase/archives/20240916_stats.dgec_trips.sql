 WITH list AS (
         SELECT "left"(list_1.journey_start_datetime::text, 7) AS ym,
            list_1.operator_class,
            list_1.journey_distance AS distance,
            (list_1.passenger_seats + 1)::double precision AS seats
           FROM trip.list list_1
        )
 SELECT list.ym,
    count(*) AS trips,
    count(*) FILTER (WHERE list.operator_class = 'A'::bpchar) AS class_a,
    count(*) FILTER (WHERE list.operator_class = 'B'::bpchar) AS class_b,
    count(*) FILTER (WHERE list.operator_class = 'C'::bpchar) AS class_c,
    round(sum(list.distance)::double precision / 1000::double precision) AS total_distance,
    avg(list.distance)::double precision / 1000::double precision AS avg_distance,
    percentile_disc(0.5::double precision) WITHIN GROUP (ORDER BY list.distance)::double precision / 1000::double precision AS med_distance,
    round(avg(list.seats) * 100::double precision) / 100::double precision AS avg_seats,
    percentile_disc(0.5::double precision) WITHIN GROUP (ORDER BY list.seats) AS med_seats
   FROM list
  GROUP BY list.ym
  ORDER BY list.ym DESC;