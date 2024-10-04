 WITH list AS (
         SELECT row_number() OVER () AS id,
            "substring"(date_trunc('week'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))::text, 0, 11) AS week,
            count(*) AS trajets,
            count(*)::real / 106905::double precision AS ref_part_trajets,
            count(*)::real / 106905::double precision - 1::double precision AS ref_delta_trajets,
            (sum(list.journey_distance)::real / 1000::double precision)::integer AS km,
            (avg(list.journey_distance)::real / 1000::double precision)::integer AS avg_km,
            (avg(list.journey_duration)::real / 60::double precision)::integer AS avg_dur
           FROM trip.list
          WHERE list.journey_start_datetime >= '2020-01-05 23:00:00+00'::timestamp with time zone AND list.journey_start_datetime < CURRENT_DATE AND list.status = 'ok'::carpo>
          GROUP BY ("substring"(date_trunc('week'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))::text, 0, 11))
          ORDER BY ("substring"(date_trunc('week'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))::text, 0, 11)) DESC
        )
 SELECT l1.week,
    l1.trajets,
    l1.trajets - l2.trajets AS "Δ_trajets",
    l1.ref_part_trajets,
    l1.ref_delta_trajets,
    l1.km,
    l1.km - l2.km AS "Δ_km",
    l1.avg_km,
    l1.avg_km - l2.avg_km AS "Δ_avg_km",
    l1.avg_dur,
    l1.avg_dur - l2.avg_dur AS "Δ_avg_dur"
   FROM list l1
     LEFT JOIN list l2 ON l1.id = (l2.id - 1)
  WHERE l1.id IS NOT NULL;
  